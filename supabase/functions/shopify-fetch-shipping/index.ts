/**
 * Shopify Fetch Shipping Edge Function
 * 
 * Busca dados de envio (shipping zones, rates) e localizações de uma loja Shopify.
 * Retorna informações sobre:
 * - Zonas de envio configuradas (países, províncias/estados)
 * - Taxas de envio por zona
 * - Locais físicos da loja (fulfillment locations)
 * 
 * IMPORTANTE: Requer os escopos OAuth:
 * - read_shipping (para shipping zones e rates)
 * - read_locations (para locations)
 * 
 * Certifique-se de atualizar SHOPIFY_SCOPES para incluir esses escopos.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Shopify API version
const SHOPIFY_API_VERSION = '2024-01'

// ============================================================================
// Types
// ============================================================================

interface ShopifyCountry {
    id: number
    name: string
    code: string
    tax: number
    tax_name: string
    provinces: ShopifyProvince[]
}

interface ShopifyProvince {
    id: number
    country_id: number
    name: string
    code: string
    tax: number
    tax_name: string
    tax_type: string | null
    tax_percentage: number
    shipping_zone_id: number
}

interface ShopifyShippingRate {
    id: number
    name: string
    price: string
    min_order_subtotal: string | null
    max_order_subtotal: string | null
}

interface ShopifyWeightBasedRate {
    id: number
    name: string
    price: string
    weight_low: number
    weight_high: number
}

interface ShopifyPriceBasedRate {
    id: number
    name: string
    price: string
    min_order_subtotal: string
    max_order_subtotal: string | null
}

interface ShopifyCarrierRate {
    id: number
    carrier_service_id: number
    flat_modifier: string
    percent_modifier: number | null
    service_filter: string[]
    shipping_zone_id: number
}

interface ShopifyShippingZone {
    id: number
    name: string
    profile_id: string
    location_group_id: string
    admin_graphql_api_id: string
    countries: ShopifyCountry[]
    weight_based_shipping_rates: ShopifyWeightBasedRate[]
    price_based_shipping_rates: ShopifyPriceBasedRate[]
    carrier_shipping_rate_providers: ShopifyCarrierRate[]
}

interface ShopifyLocation {
    id: number
    name: string
    address1: string | null
    address2: string | null
    city: string | null
    zip: string | null
    province: string | null
    province_code: string | null
    country: string | null
    country_code: string | null
    phone: string | null
    active: boolean
    legacy: boolean
    localized_country_name: string | null
    localized_province_name: string | null
}

interface ShippingZonesResponse {
    shipping_zones: ShopifyShippingZone[]
}

interface LocationsResponse {
    locations: ShopifyLocation[]
}

// Normalized response types for frontend
interface NormalizedShippingRate {
    id: number
    name: string
    price: number
    currency: string
    type: 'flat' | 'weight_based' | 'price_based' | 'carrier'
    conditions?: {
        min_weight?: number
        max_weight?: number
        min_order_subtotal?: number
        max_order_subtotal?: number
    }
}

interface NormalizedRegion {
    id: string
    name: string
    code: string
    type: 'country' | 'province' | 'state'
    country_code?: string
    country_name?: string
}

interface NormalizedShippingZone {
    id: number
    name: string
    regions: NormalizedRegion[]
    rates: NormalizedShippingRate[]
}

interface NormalizedLocation {
    id: number
    name: string
    address: {
        line1: string | null
        line2: string | null
        city: string | null
        province: string | null
        province_code: string | null
        country: string | null
        country_code: string | null
        zip: string | null
    }
    phone: string | null
    active: boolean
}

interface FetchShippingResponse {
    success: boolean
    shipping_zones: NormalizedShippingZone[]
    locations: NormalizedLocation[]
    raw?: {
        shipping_zones: ShopifyShippingZone[]
        locations: ShopifyLocation[]
    }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch shipping zones from Shopify Admin API
 */
async function fetchShippingZones(
    shopDomain: string,
    accessToken: string
): Promise<ShopifyShippingZone[]> {
    const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/shipping_zones.json`
    
    console.log(`[shopify-fetch-shipping] Fetching shipping zones from: ${url}`)
    
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error(`[shopify-fetch-shipping] Shipping zones error: ${response.status}`, errorText)
        
        if (response.status === 403) {
            throw new Error('Access denied. Make sure the app has "read_shipping" scope enabled.')
        }
        
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`)
    }

    const data: ShippingZonesResponse = await response.json()
    console.log(`[shopify-fetch-shipping] Found ${data.shipping_zones?.length || 0} shipping zones`)
    
    return data.shipping_zones || []
}

/**
 * Fetch locations from Shopify Admin API
 */
async function fetchLocations(
    shopDomain: string,
    accessToken: string
): Promise<ShopifyLocation[]> {
    const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/locations.json`
    
    console.log(`[shopify-fetch-shipping] Fetching locations from: ${url}`)
    
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error(`[shopify-fetch-shipping] Locations error: ${response.status}`, errorText)
        
        if (response.status === 403) {
            throw new Error('Access denied. Make sure the app has "read_locations" scope enabled.')
        }
        
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`)
    }

    const data: LocationsResponse = await response.json()
    console.log(`[shopify-fetch-shipping] Found ${data.locations?.length || 0} locations`)
    
    return data.locations || []
}

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Normalize shipping zones for frontend consumption
 */
function normalizeShippingZones(zones: ShopifyShippingZone[]): NormalizedShippingZone[] {
    return zones.map(zone => {
        // Extract all regions (countries and their provinces)
        const regions: NormalizedRegion[] = []
        
        for (const country of zone.countries) {
            // Add the country
            regions.push({
                id: `country-${country.id}`,
                name: country.name,
                code: country.code,
                type: 'country'
            })
            
            // Add provinces/states if any
            if (country.provinces && country.provinces.length > 0) {
                for (const province of country.provinces) {
                    regions.push({
                        id: `province-${province.id}`,
                        name: province.name,
                        code: province.code,
                        type: province.code.length === 2 ? 'state' : 'province',
                        country_code: country.code,
                        country_name: country.name
                    })
                }
            }
        }
        
        // Normalize all shipping rates
        const rates: NormalizedShippingRate[] = []
        
        // Weight-based rates
        for (const rate of zone.weight_based_shipping_rates || []) {
            rates.push({
                id: rate.id,
                name: rate.name,
                price: parseFloat(rate.price),
                currency: 'USD', // Shopify returns prices in shop currency
                type: 'weight_based',
                conditions: {
                    min_weight: rate.weight_low,
                    max_weight: rate.weight_high
                }
            })
        }
        
        // Price-based rates
        for (const rate of zone.price_based_shipping_rates || []) {
            rates.push({
                id: rate.id,
                name: rate.name,
                price: parseFloat(rate.price),
                currency: 'USD',
                type: 'price_based',
                conditions: {
                    min_order_subtotal: parseFloat(rate.min_order_subtotal) || 0,
                    max_order_subtotal: rate.max_order_subtotal ? parseFloat(rate.max_order_subtotal) : undefined
                }
            })
        }
        
        // Carrier rates (these are typically calculated at checkout)
        for (const rate of zone.carrier_shipping_rate_providers || []) {
            rates.push({
                id: rate.id,
                name: 'Carrier Calculated',
                price: parseFloat(rate.flat_modifier) || 0,
                currency: 'USD',
                type: 'carrier'
            })
        }
        
        return {
            id: zone.id,
            name: zone.name,
            regions,
            rates
        }
    })
}

/**
 * Normalize locations for frontend consumption
 */
function normalizeLocations(locations: ShopifyLocation[]): NormalizedLocation[] {
    return locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        address: {
            line1: loc.address1,
            line2: loc.address2,
            city: loc.city,
            province: loc.localized_province_name || loc.province,
            province_code: loc.province_code,
            country: loc.localized_country_name || loc.country,
            country_code: loc.country_code,
            zip: loc.zip
        },
        phone: loc.phone,
        active: loc.active
    }))
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
    console.log('[shopify-fetch-shipping] Request received:', req.method)

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-fetch-shipping] Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { store_id, include_raw = false } = body

        console.log('[shopify-fetch-shipping] Request params:', { store_id, include_raw })

        // Validate required parameters
        if (!store_id) {
            return new Response(
                JSON.stringify({ error: 'Missing store_id parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get store details including credentials
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, brand_id, name, store_type, api_credentials')
            .eq('id', store_id)
            .eq('store_type', 'shopify')
            .single()

        if (storeError || !store) {
            console.error('[shopify-fetch-shipping] Store not found:', storeError)
            return new Response(
                JSON.stringify({ error: 'Shopify store not found', details: storeError?.message }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const credentials = store.api_credentials as {
            access_token?: string
            shop_domain?: string
        } | null

        if (!credentials?.access_token || !credentials?.shop_domain) {
            return new Response(
                JSON.stringify({ error: 'Store credentials not configured' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Fetch data from Shopify (in parallel for better performance)
        const [shippingZones, locations] = await Promise.all([
            fetchShippingZones(credentials.shop_domain, credentials.access_token)
                .catch(err => {
                    console.error('[shopify-fetch-shipping] Error fetching shipping zones:', err.message)
                    return [] as ShopifyShippingZone[]
                }),
            fetchLocations(credentials.shop_domain, credentials.access_token)
                .catch(err => {
                    console.error('[shopify-fetch-shipping] Error fetching locations:', err.message)
                    return [] as ShopifyLocation[]
                })
        ])

        // Normalize data for frontend
        const normalizedZones = normalizeShippingZones(shippingZones)
        const normalizedLocations = normalizeLocations(locations)

        // Build response
        const response: FetchShippingResponse = {
            success: true,
            shipping_zones: normalizedZones,
            locations: normalizedLocations
        }

        // Include raw data if requested (useful for debugging)
        if (include_raw) {
            response.raw = {
                shipping_zones: shippingZones,
                locations: locations
            }
        }

        console.log('[shopify-fetch-shipping] Response summary:', {
            shipping_zones: normalizedZones.length,
            total_regions: normalizedZones.reduce((sum, z) => sum + z.regions.length, 0),
            total_rates: normalizedZones.reduce((sum, z) => sum + z.rates.length, 0),
            locations: normalizedLocations.length
        })

        return new Response(
            JSON.stringify(response),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[shopify-fetch-shipping] Error:', error)
        return new Response(
            JSON.stringify({ 
                error: 'Failed to fetch shipping data', 
                message: error instanceof Error ? error.message : 'Unknown error' 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})


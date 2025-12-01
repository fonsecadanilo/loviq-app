/**
 * Shopify List Products Edge Function
 * 
 * Lista produtos de uma loja Shopify conectada sem sincronizar com o banco.
 * Usado para exibir produtos disponíveis para importação no modal.
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

interface ShopifyProduct {
    id: number
    title: string
    body_html: string | null
    vendor: string
    product_type: string
    status: string
    handle: string
    images: Array<{ id: number; src: string }>
    variants: Array<{
        id: number
        title: string
        price: string
        sku: string
        inventory_quantity: number
    }>
}

interface ShopifyProductsResponse {
    products: ShopifyProduct[]
}

// Fetch products from Shopify Admin API
async function fetchShopifyProducts(
    shopDomain: string, 
    accessToken: string, 
    limit: number = 50
): Promise<ShopifyProduct[]> {
    console.log(`[shopify-list-products] Fetching from ${shopDomain}`)
    
    const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=${limit}&status=active`
    
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error(`[shopify-list-products] Shopify API error: ${response.status}`, errorText)
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`)
    }

    const data: ShopifyProductsResponse = await response.json()
    console.log(`[shopify-list-products] Fetched ${data.products?.length || 0} products`)
    return data.products || []
}

serve(async (req) => {
    console.log('[shopify-list-products] Request received:', req.method)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-list-products] Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { store_id, brand_id, limit = 50 } = body

        console.log('[shopify-list-products] Request params:', { store_id, brand_id, limit })

        // Need either store_id or brand_id
        if (!store_id && !brand_id) {
            return new Response(
                JSON.stringify({ error: 'Missing store_id or brand_id parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get store details including credentials
        let storeQuery = supabase
            .from('stores')
            .select('id, brand_id, name, store_type, api_credentials, external_store_id')
            .eq('store_type', 'shopify')

        if (store_id) {
            storeQuery = storeQuery.eq('id', store_id)
        } else if (brand_id) {
            storeQuery = storeQuery.eq('brand_id', brand_id)
        }

        const { data: store, error: storeError } = await storeQuery.single()

        if (storeError || !store) {
            console.error('[shopify-list-products] Store not found:', storeError)
            return new Response(
                JSON.stringify({ error: 'Shopify store not found', details: storeError?.message }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-list-products] Found store:', store.id, store.name)

        const credentials = store.api_credentials as {
            access_token?: string
            shop_domain?: string
        } | null

        if (!credentials?.access_token || !credentials?.shop_domain) {
            console.error('[shopify-list-products] Store credentials not configured')
            return new Response(
                JSON.stringify({ error: 'Store credentials not configured. Please reconnect your Shopify store.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Fetch products from Shopify
        const shopifyProducts = await fetchShopifyProducts(
            credentials.shop_domain,
            credentials.access_token,
            limit
        )

        // Get already imported product IDs
        const { data: importedProducts } = await supabase
            .from('products')
            .select('external_product_id')
            .eq('store_id', store.id)
            .eq('product_source_type', 'shopify')

        const importedIds = new Set(importedProducts?.map(p => p.external_product_id) || [])

        // Transform to simpler format for frontend
        const products = shopifyProducts.map(product => {
            const mainVariant = product.variants[0]
            const mainImage = product.images[0]
            
            return {
                id: product.id.toString(),
                title: product.title,
                image: mainImage?.src || null,
                price: mainVariant?.price || '0.00',
                sku: mainVariant?.sku || '',
                inventory: mainVariant?.inventory_quantity || 0,
                vendor: product.vendor,
                product_type: product.product_type,
                handle: product.handle,
                already_imported: importedIds.has(product.id.toString())
            }
        })

        console.log('[shopify-list-products] Returning', products.length, 'products')

        return new Response(
            JSON.stringify({ 
                success: true,
                products,
                store_id: store.id,
                store_name: store.name
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[shopify-list-products] Error:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to fetch products', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})


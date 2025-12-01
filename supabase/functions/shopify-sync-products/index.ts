/**
 * Shopify Product Sync Edge Function
 * 
 * Sincroniza produtos de uma loja Shopify com o banco de dados do Loviq.
 * Busca produtos via Shopify Admin API e atualiza as tabelas `products` e `shopify_products`.
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
    limit: number = 250
): Promise<ShopifyProduct[]> {
    const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=${limit}&status=active`
    
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`)
    }

    const data: ShopifyProductsResponse = await response.json()
    return data.products || []
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { store_id } = body

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
            .select('id, brand_id, name, store_type, api_credentials, external_store_id')
            .eq('id', store_id)
            .eq('store_type', 'shopify')
            .single()

        if (storeError || !store) {
            return new Response(
                JSON.stringify({ error: 'Store not found', details: storeError?.message }),
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

        // Create sync log entry
        const { data: syncLog, error: logError } = await supabase
            .from('shopify_sync_logs')
            .insert({
                store_id: store.id,
                sync_type: 'products',
                status: 'in_progress',
                started_at: new Date().toISOString()
            })
            .select('id')
            .single()

        const syncLogId = syncLog?.id

        try {
            // Fetch products from Shopify
            const shopifyProducts = await fetchShopifyProducts(
                credentials.shop_domain,
                credentials.access_token
            )

            let syncedCount = 0
            let errorCount = 0
            const errors: string[] = []

            // Process each product
            for (const shopifyProduct of shopifyProducts) {
                try {
                    // Get the first variant for pricing (or default)
                    const mainVariant = shopifyProduct.variants[0]
                    const mainImage = shopifyProduct.images[0]

                    // Check if product already exists
                    const { data: existingProduct } = await supabase
                        .from('products')
                        .select('id')
                        .eq('store_id', store.id)
                        .eq('external_product_id', shopifyProduct.id.toString())
                        .maybeSingle()

                    let productId: number

                    if (existingProduct) {
                        // Update existing product
                        const { data: updatedProduct, error: updateError } = await supabase
                            .from('products')
                            .update({
                                name: shopifyProduct.title,
                                description: shopifyProduct.body_html,
                                price: parseFloat(mainVariant?.price || '0'),
                                image_url: mainImage?.src || null,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', existingProduct.id)
                            .select('id')
                            .single()

                        if (updateError) throw updateError
                        productId = updatedProduct.id
                    } else {
                        // Insert new product
                        const { data: newProduct, error: insertError } = await supabase
                            .from('products')
                            .insert({
                                store_id: store.id,
                                name: shopifyProduct.title,
                                description: shopifyProduct.body_html,
                                price: parseFloat(mainVariant?.price || '0'),
                                currency: 'BRL',
                                image_url: mainImage?.src || null,
                                product_source_type: 'shopify',
                                external_product_id: shopifyProduct.id.toString()
                            })
                            .select('id')
                            .single()

                        if (insertError) throw insertError
                        productId = newProduct.id
                    }

                    // Upsert shopify_products details
                    const { data: existingShopifyProduct } = await supabase
                        .from('shopify_products')
                        .select('id')
                        .eq('product_id', productId)
                        .maybeSingle()

                    if (existingShopifyProduct) {
                        await supabase
                            .from('shopify_products')
                            .update({
                                shopify_variant_id: mainVariant?.id?.toString() || null,
                                last_sync_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', existingShopifyProduct.id)
                    } else {
                        await supabase
                            .from('shopify_products')
                            .insert({
                                product_id: productId,
                                shopify_variant_id: mainVariant?.id?.toString() || null,
                                last_sync_at: new Date().toISOString()
                            })
                    }

                    syncedCount++
                } catch (productError) {
                    errorCount++
                    errors.push(`Product ${shopifyProduct.id}: ${productError.message}`)
                    console.error(`Error syncing product ${shopifyProduct.id}:`, productError)
                }
            }

            // Update sync log as success
            if (syncLogId) {
                await supabase
                    .from('shopify_sync_logs')
                    .update({
                        status: errorCount === 0 ? 'success' : 'success',
                        finished_at: new Date().toISOString(),
                        message: `Synced ${syncedCount} products${errorCount > 0 ? `, ${errorCount} errors` : ''}`
                    })
                    .eq('id', syncLogId)
            }

            return new Response(
                JSON.stringify({ 
                    success: true,
                    synced: syncedCount,
                    errors: errorCount,
                    total: shopifyProducts.length,
                    details: errors.length > 0 ? errors.slice(0, 5) : undefined
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

        } catch (syncError) {
            // Update sync log as failed
            if (syncLogId) {
                await supabase
                    .from('shopify_sync_logs')
                    .update({
                        status: 'failed',
                        finished_at: new Date().toISOString(),
                        message: syncError.message
                    })
                    .eq('id', syncLogId)
            }

            throw syncError
        }

    } catch (error) {
        console.error('Sync error:', error)
        return new Response(
            JSON.stringify({ error: 'Sync failed', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})


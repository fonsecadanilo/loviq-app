/**
 * Shopify Create Order Edge Function
 * 
 * Sincroniza pedidos da Loviq para o Shopify.
 * Quando um pedido é criado na Loviq, esta função pode ser chamada para
 * criar o pedido correspondente na loja Shopify do usuário.
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

// Interfaces
interface OrderItem {
    id: number
    order_id: number
    product_id: number
    quantity: number
    unit_price: number
    subtotal: number
    product?: {
        id: number
        name: string
        external_product_id: string | null
        shopify_product?: {
            shopify_variant_id: string | null
        }
    }
}

interface Order {
    id: number
    campaign_id: number
    brand_id: number
    store_id: number | null
    influencer_id: number
    order_date: string
    total_amount: number
    currency: string
    status: string
    order_source: string
    external_order_id: string | null
    customer_email: string | null
    customer_name: string | null
    commission_amount: number
}

interface ShopifyLineItem {
    variant_id?: number
    product_id?: number
    title?: string
    price?: string
    quantity: number
    requires_shipping?: boolean
    taxable?: boolean
}

interface ShopifyOrderPayload {
    order: {
        email?: string
        financial_status?: string
        fulfillment_status?: string
        send_receipt?: boolean
        send_fulfillment_receipt?: boolean
        line_items: ShopifyLineItem[]
        note?: string
        tags?: string
        customer?: {
            first_name?: string
            last_name?: string
            email?: string
        }
    }
}

interface ShopifyOrderResponse {
    order: {
        id: number
        name: string
        order_number: number
        created_at: string
        total_price: string
        financial_status: string
    }
    errors?: Record<string, string[]>
}

// Create order in Shopify
async function createShopifyOrder(
    shopDomain: string,
    accessToken: string,
    orderPayload: ShopifyOrderPayload
): Promise<ShopifyOrderResponse> {
    const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/orders.json`
    
    console.log(`[shopify-create-order] Creating order in ${shopDomain}`)
    console.log(`[shopify-create-order] Payload:`, JSON.stringify(orderPayload, null, 2))
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
    })

    const responseText = await response.text()
    console.log(`[shopify-create-order] Response status: ${response.status}`)
    console.log(`[shopify-create-order] Response body: ${responseText}`)

    if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} - ${responseText}`)
    }

    return JSON.parse(responseText)
}

serve(async (req) => {
    console.log('[shopify-create-order] Request received:', req.method)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-create-order] Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { order_id, sync_to_shopify = true } = body

        console.log('[shopify-create-order] Request params:', { order_id, sync_to_shopify })

        // Validate required parameters
        if (!order_id) {
            return new Response(
                JSON.stringify({ error: 'Missing order_id parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                id,
                campaign_id,
                brand_id,
                store_id,
                influencer_id,
                order_date,
                total_amount,
                currency,
                status,
                order_source,
                external_order_id,
                customer_email,
                customer_name,
                commission_amount
            `)
            .eq('id', order_id)
            .single()

        if (orderError || !order) {
            console.error('[shopify-create-order] Order not found:', orderError)
            return new Response(
                JSON.stringify({ error: 'Order not found', details: orderError?.message }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-create-order] Found order:', order.id)

        // Check if order already has external_order_id (already synced)
        if (order.external_order_id) {
            console.log('[shopify-create-order] Order already synced to Shopify:', order.external_order_id)
            return new Response(
                JSON.stringify({ 
                    success: true, 
                    message: 'Order already synced to Shopify',
                    external_order_id: order.external_order_id 
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // If no store_id, we can't sync to Shopify
        if (!order.store_id) {
            return new Response(
                JSON.stringify({ error: 'Order has no associated store' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get store details
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, name, store_type, api_credentials, external_store_id')
            .eq('id', order.store_id)
            .single()

        if (storeError || !store) {
            console.error('[shopify-create-order] Store not found:', storeError)
            return new Response(
                JSON.stringify({ error: 'Store not found', details: storeError?.message }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if store is Shopify type
        if (store.store_type !== 'shopify') {
            return new Response(
                JSON.stringify({ error: 'Store is not a Shopify store', store_type: store.store_type }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

        // Get order items with product details
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                id,
                order_id,
                product_id,
                quantity,
                unit_price,
                subtotal
            `)
            .eq('order_id', order_id)

        if (itemsError) {
            console.error('[shopify-create-order] Error fetching order items:', itemsError)
            return new Response(
                JSON.stringify({ error: 'Error fetching order items', details: itemsError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!orderItems || orderItems.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Order has no items' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get product details for each order item
        const productIds = orderItems.map(item => item.product_id)
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
                id,
                name,
                external_product_id,
                price
            `)
            .in('id', productIds)

        if (productsError) {
            console.error('[shopify-create-order] Error fetching products:', productsError)
        }

        // Get shopify_products details for variant IDs
        const { data: shopifyProducts, error: shopifyProductsError } = await supabase
            .from('shopify_products')
            .select('product_id, shopify_variant_id')
            .in('product_id', productIds)

        if (shopifyProductsError) {
            console.error('[shopify-create-order] Error fetching shopify_products:', shopifyProductsError)
        }

        // Create a map for quick lookup
        const productMap = new Map(products?.map(p => [p.id, p]) || [])
        const shopifyProductMap = new Map(shopifyProducts?.map(sp => [sp.product_id, sp]) || [])

        // Build Shopify line items
        const lineItems: ShopifyLineItem[] = orderItems.map(item => {
            const product = productMap.get(item.product_id)
            const shopifyProduct = shopifyProductMap.get(item.product_id)

            const lineItem: ShopifyLineItem = {
                quantity: item.quantity,
                price: item.unit_price.toString(),
                requires_shipping: true,
                taxable: true,
            }

            // If we have a Shopify variant ID, use it (most accurate)
            if (shopifyProduct?.shopify_variant_id) {
                lineItem.variant_id = parseInt(shopifyProduct.shopify_variant_id)
            } 
            // If we have external_product_id (Shopify product ID), use it
            else if (product?.external_product_id) {
                lineItem.product_id = parseInt(product.external_product_id)
            } 
            // Fallback: use title and price (creates a custom line item)
            else {
                lineItem.title = product?.name || `Product #${item.product_id}`
                delete lineItem.variant_id
                delete lineItem.product_id
            }

            return lineItem
        })

        // Parse customer name into first/last name
        let firstName = ''
        let lastName = ''
        if (order.customer_name) {
            const nameParts = order.customer_name.split(' ')
            firstName = nameParts[0] || ''
            lastName = nameParts.slice(1).join(' ') || ''
        }

        // Build Shopify order payload
        const shopifyOrderPayload: ShopifyOrderPayload = {
            order: {
                line_items: lineItems,
                financial_status: order.status === 'completed' ? 'paid' : 'pending',
                fulfillment_status: null,
                send_receipt: false,
                send_fulfillment_receipt: false,
                note: `Loviq Order #${order.id}`,
                tags: 'loviq,imported',
            }
        }

        // Add customer info if available
        if (order.customer_email) {
            shopifyOrderPayload.order.email = order.customer_email
            shopifyOrderPayload.order.customer = {
                email: order.customer_email,
                first_name: firstName,
                last_name: lastName,
            }
        }

        // Create sync log entry
        const { data: syncLog, error: syncLogError } = await supabase
            .from('shopify_sync_logs')
            .insert({
                store_id: store.id,
                sync_type: 'orders',
                status: 'in_progress',
                started_at: new Date().toISOString(),
                message: `Creating order #${order.id} in Shopify`
            })
            .select('id')
            .single()

        const syncLogId = syncLog?.id

        try {
            // Create order in Shopify
            const shopifyResponse = await createShopifyOrder(
                credentials.shop_domain,
                credentials.access_token,
                shopifyOrderPayload
            )

            if (shopifyResponse.errors) {
                throw new Error(`Shopify errors: ${JSON.stringify(shopifyResponse.errors)}`)
            }

            const shopifyOrderId = shopifyResponse.order.id.toString()
            const shopifyOrderName = shopifyResponse.order.name

            console.log(`[shopify-create-order] Created Shopify order: ${shopifyOrderId} (${shopifyOrderName})`)

            // Update order with external_order_id
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    external_order_id: shopifyOrderId,
                    order_source: 'shopify',
                    updated_at: new Date().toISOString()
                })
                .eq('id', order_id)

            if (updateError) {
                console.error('[shopify-create-order] Error updating order:', updateError)
            }

            // Update sync log as success
            if (syncLogId) {
                await supabase
                    .from('shopify_sync_logs')
                    .update({
                        status: 'success',
                        finished_at: new Date().toISOString(),
                        message: `Created Shopify order ${shopifyOrderName} (ID: ${shopifyOrderId})`
                    })
                    .eq('id', syncLogId)
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    shopify_order_id: shopifyOrderId,
                    shopify_order_name: shopifyOrderName,
                    loviq_order_id: order_id,
                    message: `Order successfully created in Shopify as ${shopifyOrderName}`
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

        } catch (shopifyError) {
            console.error('[shopify-create-order] Shopify API error:', shopifyError)

            // Update sync log as failed
            if (syncLogId) {
                await supabase
                    .from('shopify_sync_logs')
                    .update({
                        status: 'failed',
                        finished_at: new Date().toISOString(),
                        message: shopifyError instanceof Error ? shopifyError.message : 'Unknown error'
                    })
                    .eq('id', syncLogId)
            }

            return new Response(
                JSON.stringify({
                    error: 'Failed to create order in Shopify',
                    details: shopifyError instanceof Error ? shopifyError.message : 'Unknown error'
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

    } catch (error) {
        console.error('[shopify-create-order] Error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})



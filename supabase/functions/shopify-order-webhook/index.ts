/**
 * Shopify Order Webhook Edge Function
 * 
 * Recebe webhooks do Shopify quando pedidos são atualizados.
 * Sincroniza o status do pedido do Shopify para a Loviq.
 * 
 * Webhooks suportados:
 * - orders/updated: Atualiza status do pedido
 * - orders/paid: Marca pedido como pago
 * - orders/fulfilled: Marca pedido como enviado/concluído
 * - orders/cancelled: Marca pedido como cancelado
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET')

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Mapeia status do Shopify para status da Loviq
 * 
 * Shopify financial_status: pending, authorized, partially_paid, paid, partially_refunded, refunded, voided
 * Shopify fulfillment_status: null, partial, fulfilled
 * Shopify cancelled_at: null ou timestamp
 * 
 * Loviq order_status: pending, completed, cancelled, refunded
 */
function mapShopifyStatusToLoviq(shopifyOrder: ShopifyOrder): 'pending' | 'completed' | 'cancelled' | 'refunded' {
    // Se foi cancelado
    if (shopifyOrder.cancelled_at) {
        return 'cancelled'
    }

    // Se foi reembolsado
    if (shopifyOrder.financial_status === 'refunded') {
        return 'refunded'
    }

    // Se foi pago E fulfillment completo
    if (shopifyOrder.financial_status === 'paid' && shopifyOrder.fulfillment_status === 'fulfilled') {
        return 'completed'
    }

    // Se foi pago (mas ainda não enviado)
    if (shopifyOrder.financial_status === 'paid') {
        return 'pending' // Mantém pending até ser enviado
    }

    // Parcialmente reembolsado também conta como refunded
    if (shopifyOrder.financial_status === 'partially_refunded') {
        return 'refunded'
    }

    // Default: pending
    return 'pending'
}

interface ShopifyOrder {
    id: number
    name: string
    email: string | null
    financial_status: string
    fulfillment_status: string | null
    cancelled_at: string | null
    cancel_reason: string | null
    total_price: string
    currency: string
    created_at: string
    updated_at: string
    closed_at: string | null
    note: string | null
    tags: string
    customer?: {
        id: number
        email: string
        first_name: string
        last_name: string
    }
}

/**
 * Verifica a assinatura HMAC do webhook do Shopify
 */
async function verifyShopifyWebhook(
    body: string, 
    hmacHeader: string | null,
    apiSecret: string
): Promise<boolean> {
    if (!hmacHeader) {
        console.log('[shopify-order-webhook] No HMAC header provided')
        return false
    }

    try {
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(apiSecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        )

        const signature = await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(body)
        )

        const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)))
        
        const isValid = computedHmac === hmacHeader
        console.log('[shopify-order-webhook] HMAC verification:', isValid ? 'PASSED' : 'FAILED')
        
        return isValid
    } catch (error) {
        console.error('[shopify-order-webhook] HMAC verification error:', error)
        return false
    }
}

serve(async (req) => {
    console.log('[shopify-order-webhook] Request received:', req.method)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-order-webhook] Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        // Get Shopify headers
        const shopifyTopic = req.headers.get('x-shopify-topic')
        const shopifyShopDomain = req.headers.get('x-shopify-shop-domain')
        const shopifyHmac = req.headers.get('x-shopify-hmac-sha256')

        console.log('[shopify-order-webhook] Shopify headers:', {
            topic: shopifyTopic,
            shop: shopifyShopDomain,
            hasHmac: !!shopifyHmac
        })

        // Read body as text for HMAC verification
        const bodyText = await req.text()
        
        // Verify HMAC if secret is configured (recommended for production)
        if (SHOPIFY_API_SECRET && shopifyHmac) {
            const isValid = await verifyShopifyWebhook(bodyText, shopifyHmac, SHOPIFY_API_SECRET)
            if (!isValid) {
                console.error('[shopify-order-webhook] Invalid webhook signature')
                return new Response(
                    JSON.stringify({ error: 'Invalid webhook signature' }),
                    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        } else {
            console.warn('[shopify-order-webhook] HMAC verification skipped (no secret configured)')
        }

        // Parse body
        const shopifyOrder: ShopifyOrder = JSON.parse(bodyText)
        
        console.log('[shopify-order-webhook] Received order update:', {
            id: shopifyOrder.id,
            name: shopifyOrder.name,
            financial_status: shopifyOrder.financial_status,
            fulfillment_status: shopifyOrder.fulfillment_status,
            cancelled_at: shopifyOrder.cancelled_at
        })

        // Find the store by shop domain
        let store = null
        if (shopifyShopDomain) {
            const { data: storeData, error: storeError } = await supabase
                .from('stores')
                .select('id, name, brand_id')
                .eq('store_type', 'shopify')
                .or(`name.eq.${shopifyShopDomain},external_store_id.eq.${shopifyShopDomain}`)
                .single()

            if (storeError) {
                console.log('[shopify-order-webhook] Store lookup error:', storeError.message)
            } else {
                store = storeData
            }
        }

        if (!store) {
            console.log('[shopify-order-webhook] Store not found for domain:', shopifyShopDomain)
            // Return 200 to acknowledge webhook even if we can't process it
            return new Response(
                JSON.stringify({ success: true, message: 'Webhook received but store not found' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-order-webhook] Found store:', store.id, store.name)

        // Find the order by external_order_id
        const shopifyOrderId = shopifyOrder.id.toString()
        const { data: loviqOrder, error: orderError } = await supabase
            .from('orders')
            .select('id, status, external_order_id')
            .eq('external_order_id', shopifyOrderId)
            .single()

        if (orderError || !loviqOrder) {
            console.log('[shopify-order-webhook] Order not found for Shopify ID:', shopifyOrderId)
            // Return 200 to acknowledge webhook
            return new Response(
                JSON.stringify({ success: true, message: 'Webhook received but order not found in Loviq' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-order-webhook] Found Loviq order:', loviqOrder.id, 'current status:', loviqOrder.status)

        // Map Shopify status to Loviq status
        const newStatus = mapShopifyStatusToLoviq(shopifyOrder)
        console.log('[shopify-order-webhook] Mapped status:', newStatus)

        // Only update if status changed
        if (loviqOrder.status === newStatus) {
            console.log('[shopify-order-webhook] Status unchanged, skipping update')
            return new Response(
                JSON.stringify({ success: true, message: 'Order status unchanged' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', loviqOrder.id)

        if (updateError) {
            console.error('[shopify-order-webhook] Error updating order:', updateError)
            return new Response(
                JSON.stringify({ error: 'Failed to update order', details: updateError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-order-webhook] Order status updated:', loviqOrder.id, loviqOrder.status, '->', newStatus)

        // Log the sync
        await supabase
            .from('shopify_sync_logs')
            .insert({
                store_id: store.id,
                sync_type: 'orders',
                status: 'success',
                started_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
                message: `Order #${loviqOrder.id} status updated: ${loviqOrder.status} -> ${newStatus} (Shopify ${shopifyOrder.name})`
            })

        return new Response(
            JSON.stringify({
                success: true,
                message: `Order status updated from ${loviqOrder.status} to ${newStatus}`,
                loviq_order_id: loviqOrder.id,
                shopify_order_id: shopifyOrderId,
                shopify_order_name: shopifyOrder.name,
                old_status: loviqOrder.status,
                new_status: newStatus
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[shopify-order-webhook] Error:', error)
        // Return 200 to acknowledge webhook and prevent Shopify from retrying
        return new Response(
            JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})



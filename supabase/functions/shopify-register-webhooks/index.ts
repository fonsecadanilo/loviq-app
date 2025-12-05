/**
 * Shopify Register Webhooks Edge Function
 * 
 * Registra webhooks do Shopify para uma loja já conectada.
 * Útil para adicionar novos webhooks em lojas existentes.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Shopify API version
const SHOPIFY_API_VERSION = '2024-01'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookConfig {
    topic: string
    address: string
}

interface WebhookResult {
    topic: string
    status: 'created' | 'exists' | 'failed'
    error?: string
}

/**
 * Register webhooks for a Shopify store
 */
async function registerWebhooks(
    shopDomain: string,
    accessToken: string,
    webhooks: WebhookConfig[]
): Promise<WebhookResult[]> {
    const results: WebhookResult[] = []

    for (const webhook of webhooks) {
        try {
            // Check if webhook already exists
            const listResponse = await fetch(
                `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json?topic=${webhook.topic}`,
                {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (listResponse.ok) {
                const listData = await listResponse.json()
                const existingWebhook = listData.webhooks?.find(
                    (w: { address: string }) => w.address === webhook.address
                )

                if (existingWebhook) {
                    console.log(`[shopify-register-webhooks] Webhook already exists: ${webhook.topic}`)
                    results.push({ topic: webhook.topic, status: 'exists' })
                    continue
                }
            }

            // Register new webhook
            const response = await fetch(
                `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
                {
                    method: 'POST',
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        webhook: {
                            topic: webhook.topic,
                            address: webhook.address,
                            format: 'json'
                        }
                    })
                }
            )

            if (response.ok) {
                console.log(`[shopify-register-webhooks] Webhook created: ${webhook.topic}`)
                results.push({ topic: webhook.topic, status: 'created' })
            } else {
                const errorText = await response.text()
                console.error(`[shopify-register-webhooks] Failed webhook ${webhook.topic}:`, response.status, errorText)
                results.push({ topic: webhook.topic, status: 'failed', error: errorText })
            }
        } catch (e) {
            console.error(`[shopify-register-webhooks] Error webhook ${webhook.topic}:`, e)
            results.push({ 
                topic: webhook.topic, 
                status: 'failed', 
                error: e instanceof Error ? e.message : 'Unknown error' 
            })
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
    }

    return results
}

serve(async (req) => {
    console.log('[shopify-register-webhooks] Request received:', req.method)

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-register-webhooks] Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { store_id, webhook_types } = body

        console.log('[shopify-register-webhooks] Request params:', { store_id, webhook_types })

        // Validate required parameters
        if (!store_id) {
            return new Response(
                JSON.stringify({ error: 'Missing store_id parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get store details
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, name, store_type, api_credentials')
            .eq('id', store_id)
            .eq('store_type', 'shopify')
            .single()

        if (storeError || !store) {
            console.error('[shopify-register-webhooks] Store not found:', storeError)
            return new Response(
                JSON.stringify({ error: 'Shopify store not found' }),
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

        // Define webhook URLs
        const inventoryWebhookUrl = `${SUPABASE_URL}/functions/v1/shopify-sync-inventory`
        const orderWebhookUrl = `${SUPABASE_URL}/functions/v1/shopify-order-webhook`

        // Build webhook list based on requested types
        const allWebhooks: WebhookConfig[] = [
            // Inventory webhooks
            { topic: 'inventory_levels/update', address: inventoryWebhookUrl },
            { topic: 'products/update', address: inventoryWebhookUrl },
            // Order webhooks
            { topic: 'orders/updated', address: orderWebhookUrl },
            { topic: 'orders/paid', address: orderWebhookUrl },
            { topic: 'orders/fulfilled', address: orderWebhookUrl },
            { topic: 'orders/cancelled', address: orderWebhookUrl },
        ]

        // Filter webhooks if specific types requested
        let webhooksToRegister = allWebhooks
        if (webhook_types && Array.isArray(webhook_types) && webhook_types.length > 0) {
            webhooksToRegister = allWebhooks.filter(w => webhook_types.includes(w.topic))
        }

        console.log('[shopify-register-webhooks] Registering webhooks:', webhooksToRegister.map(w => w.topic))

        // Register webhooks
        const results = await registerWebhooks(
            credentials.shop_domain,
            credentials.access_token,
            webhooksToRegister
        )

        // Summary
        const created = results.filter(r => r.status === 'created').length
        const exists = results.filter(r => r.status === 'exists').length
        const failed = results.filter(r => r.status === 'failed').length

        return new Response(
            JSON.stringify({
                success: true,
                store_id: store.id,
                shop_domain: credentials.shop_domain,
                summary: {
                    created,
                    already_exists: exists,
                    failed
                },
                results
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[shopify-register-webhooks] Error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})




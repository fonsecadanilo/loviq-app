/**
 * Shopify OAuth Exchange Edge Function
 * 
 * Exchanges the authorization code for an access token and stores
 * the credentials in the database. Does NOT import products automatically.
 * 
 * Called from the frontend ShopifyCallback page.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Shopify API version
const SHOPIFY_API_VERSION = '2024-01'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Register webhooks for inventory, product, and order updates
 */
async function registerWebhooks(
    shopDomain: string, 
    accessToken: string, 
    supabaseUrl: string
): Promise<{ success: number; failed: number }> {
    const inventoryWebhookUrl = `${supabaseUrl}/functions/v1/shopify-sync-inventory`
    const orderWebhookUrl = `${supabaseUrl}/functions/v1/shopify-order-webhook`
    
    const webhooks = [
        // Inventory webhooks
        { topic: 'inventory_levels/update', address: inventoryWebhookUrl },
        { topic: 'products/update', address: inventoryWebhookUrl },
        // Order webhooks
        { topic: 'orders/updated', address: orderWebhookUrl },
        { topic: 'orders/paid', address: orderWebhookUrl },
        { topic: 'orders/fulfilled', address: orderWebhookUrl },
        { topic: 'orders/cancelled', address: orderWebhookUrl },
    ]
    
    let success = 0
    let failed = 0
    
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
                    (w: any) => w.address === webhook.address
                )
                
                if (existingWebhook) {
                    console.log(`[shopify-callback-exchange] Webhook already exists: ${webhook.topic}`)
                    success++
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
                success++
            } else {
                console.error(`[shopify-callback-exchange] Failed webhook ${webhook.topic}:`, response.status)
                failed++
            }
        } catch (e) {
            console.error(`[shopify-callback-exchange] Error webhook ${webhook.topic}:`, e)
            failed++
        }
        
        await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    return { success, failed }
}

serve(async (req) => {
    console.log('[shopify-callback-exchange] Request received:', req.method)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-callback-exchange] Missing environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        // Parse request body
        const body = await req.json()
        const { code, shop, state } = body
        
        console.log('[shopify-callback-exchange] Params:', { code: !!code, shop, state: !!state })

        // Validate required parameters
        if (!code) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization code' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!shop) {
            return new Response(
                JSON.stringify({ error: 'Missing shop domain' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse state to get brand_id
        let brand_id: string = '1' // Default
        if (state) {
            try {
                const stateData = JSON.parse(state)
                brand_id = stateData.brand_id?.toString() || '1'
            } catch (e) {
                console.warn('[shopify-callback-exchange] Could not parse state:', e)
            }
        }

        // Clean shop domain
        const cleanShop = shop.replace('https://', '').replace('http://', '').replace(/\/$/, '')
        console.log('[shopify-callback-exchange] Clean shop:', cleanShop)

        // Exchange authorization code for access token
        console.log('[shopify-callback-exchange] Exchanging code for access token...')
        const tokenResponse = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code,
            }),
        })

        const tokenResponseText = await tokenResponse.text()
        console.log('[shopify-callback-exchange] Token response status:', tokenResponse.status)

        if (!tokenResponse.ok) {
            console.error('[shopify-callback-exchange] Token exchange failed:', tokenResponse.status, tokenResponseText)
            return new Response(
                JSON.stringify({ error: 'Token exchange failed', details: tokenResponseText }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse token response
        let tokenData
        try {
            tokenData = JSON.parse(tokenResponseText)
        } catch (jsonError) {
            console.error('[shopify-callback-exchange] Failed to parse token response:', jsonError)
            return new Response(
                JSON.stringify({ error: 'Invalid response from Shopify' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!tokenData.access_token) {
            return new Response(
                JSON.stringify({ error: 'No access token received' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-callback-exchange] Token received, scope:', tokenData.scope)

        // Check if store already exists for this brand
        const { data: existingStore } = await supabase
            .from('stores')
            .select('id')
            .eq('brand_id', parseInt(brand_id))
            .eq('store_type', 'shopify')
            .maybeSingle()

        let storeResult
        const apiCredentials = {
            access_token: tokenData.access_token,
            shop_domain: cleanShop,
            scope: tokenData.scope,
            connected_at: new Date().toISOString()
        }

        if (existingStore) {
            // Update existing store
            console.log('[shopify-callback-exchange] Updating existing store:', existingStore.id)
            storeResult = await supabase
                .from('stores')
                .update({
                    api_credentials: apiCredentials,
                    external_store_id: cleanShop,
                    name: cleanShop,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingStore.id)
                .select('id, name, brand_id, store_type')
                .single()
        } else {
            // Create new store
            console.log('[shopify-callback-exchange] Creating new store for brand:', brand_id)
            storeResult = await supabase
                .from('stores')
                .insert({
                    brand_id: parseInt(brand_id),
                    name: cleanShop,
                    store_type: 'shopify',
                    external_store_id: cleanShop,
                    api_credentials: apiCredentials
                })
                .select('id, name, brand_id, store_type')
                .single()
        }

        if (storeResult.error) {
            console.error('[shopify-callback-exchange] Database error:', storeResult.error)
            return new Response(
                JSON.stringify({ error: 'Database error', details: storeResult.error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[shopify-callback-exchange] Store saved:', storeResult.data)

        // Register webhooks
        console.log('[shopify-callback-exchange] Registering webhooks...')
        const webhookResult = await registerWebhooks(cleanShop, tokenData.access_token, SUPABASE_URL!)
        console.log('[shopify-callback-exchange] Webhook registration:', webhookResult)

        // Return success with store info
        return new Response(
            JSON.stringify({
                success: true,
                store_id: storeResult.data.id,
                shop_domain: cleanShop,
                brand_id: parseInt(brand_id),
                webhooks: webhookResult
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[shopify-callback-exchange] Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})


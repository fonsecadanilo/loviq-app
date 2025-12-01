/**
 * Shopify OAuth Callback Edge Function
 * 
 * Processa o callback do OAuth do Shopify e armazena as credenciais
 * na tabela `stores` do Supabase.
 * 
 * IMPORTANTE: Esta função é chamada via GET pelo Shopify após autorização OAuth.
 * Não requer JWT pois é acessada externamente pelo Shopify.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:8081'

// Redirect to app with success message
function redirectSuccess(shop: string): Response {
    const redirectUrl = `${APP_URL}/store-integration?shopify=connected&store=${encodeURIComponent(shop)}`
    return new Response(null, {
        status: 302,
        headers: { 'Location': redirectUrl }
    })
}

// Redirect to app with error message
function redirectError(error: string, details?: string): Response {
    const params = new URLSearchParams({
        shopify: 'error',
        error: error,
        ...(details && { details })
    })
    const redirectUrl = `${APP_URL}/store-integration?${params.toString()}`
    return new Response(null, {
        status: 302,
        headers: { 'Location': redirectUrl }
    })
}

serve(async (req) => {
    console.log('[shopify-callback] Request received:', req.method, req.url)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { 
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    // Validate environment variables
    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-callback] Missing required environment variables:', {
            hasApiKey: !!SHOPIFY_API_KEY,
            hasApiSecret: !!SHOPIFY_API_SECRET,
            hasSupabaseUrl: !!SUPABASE_URL,
            hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
        })
        return redirectError('Configuration Error', 'Server is not properly configured')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        // Parse parameters from URL (GET request from Shopify redirect)
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const shop = url.searchParams.get('shop')
        const stateParam = url.searchParams.get('state')
        const hmac = url.searchParams.get('hmac')
        
        console.log('[shopify-callback] Params:', { code: !!code, shop, stateParam, hmac: !!hmac })

        // Validate required parameters
        if (!code) {
            return redirectError('Missing Code', 'Authorization code not received from Shopify')
        }

        if (!shop) {
            return redirectError('Missing Shop', 'Shop domain not received from Shopify')
        }

        // Parse state to get brand_id
        let brand_id: string | null = null
        if (stateParam) {
            try {
                const stateData = JSON.parse(stateParam)
                brand_id = stateData.brand_id?.toString()
                console.log('[shopify-callback] Parsed state:', stateData)
            } catch (e) {
                console.warn('[shopify-callback] Could not parse state:', e)
            }
        }

        if (!brand_id) {
            // Fallback: use brand_id 1 for demo
            console.warn('[shopify-callback] No brand_id in state, using default: 1')
            brand_id = '1'
        }

        // Clean shop domain
        const cleanShop = shop.replace('https://', '').replace('http://', '').replace(/\/$/, '')
        console.log('[shopify-callback] Clean shop:', cleanShop)

        // Exchange authorization code for access token
        console.log('[shopify-callback] Exchanging code for access token...')
        const tokenResponse = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code,
            }),
        })

        // Get response as text first for better error handling
        const tokenResponseText = await tokenResponse.text()
        console.log('[shopify-callback] Token response status:', tokenResponse.status)
        console.log('[shopify-callback] Token response text:', tokenResponseText.substring(0, 500))

        if (!tokenResponse.ok) {
            console.error('[shopify-callback] Shopify token exchange failed:', tokenResponse.status, tokenResponseText)
            return redirectError('Token Exchange Failed', `Could not get access token: ${tokenResponse.status}`)
        }

        // Parse JSON safely
        let tokenData
        try {
            tokenData = JSON.parse(tokenResponseText)
        } catch (jsonError) {
            console.error('[shopify-callback] Failed to parse Shopify response as JSON:', jsonError)
            return redirectError('Invalid Response', 'Shopify returned an invalid response')
        }
        console.log('[shopify-callback] Token received, scope:', tokenData.scope)

        if (!tokenData.access_token) {
            return redirectError('No Access Token', 'Shopify did not return an access token')
        }

        // Check if store already exists for this brand
        const { data: existingStore } = await supabase
            .from('stores')
            .select('id')
            .eq('brand_id', parseInt(brand_id))
            .eq('store_type', 'shopify')
            .maybeSingle()

        console.log('[shopify-callback] Existing store check:', existingStore)

        let storeResult
        const apiCredentials = {
            access_token: tokenData.access_token,
            shop_domain: cleanShop,
            scope: tokenData.scope,
            connected_at: new Date().toISOString()
        }

        if (existingStore) {
            // Update existing store
            console.log('[shopify-callback] Updating existing store:', existingStore.id)
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
            console.log('[shopify-callback] Creating new store for brand:', brand_id)
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
            console.error('[shopify-callback] Database error:', storeResult.error)
            return redirectError('Database Error', storeResult.error.message)
        }

        console.log('[shopify-callback] Store saved successfully:', storeResult.data)

        // Redirect back to the app with success
        return redirectSuccess(cleanShop)

    } catch (error) {
        console.error('[shopify-callback] Unexpected error:', error)
        return redirectError('Unexpected Error', error instanceof Error ? error.message : 'An unexpected error occurred')
    }
})

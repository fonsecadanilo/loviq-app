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

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// HTML response for browser redirect
function htmlRedirect(url: string, message: string): Response {
    return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="refresh" content="2;url=${url}">
            <title>Shopify Connection</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #95BF47; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                h2 { color: #333; margin: 0 0 10px; }
                p { color: #666; margin: 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="spinner"></div>
                <h2>${message}</h2>
                <p>Redirecting you back to the app...</p>
            </div>
        </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
}

function htmlError(title: string, message: string): Response {
    return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Error - Shopify Connection</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; }
                .icon { font-size: 48px; margin-bottom: 20px; }
                h2 { color: #e53935; margin: 0 0 10px; }
                p { color: #666; margin: 0 0 20px; }
                a { color: #95BF47; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">❌</div>
                <h2>${title}</h2>
                <p>${message}</p>
                <a href="${APP_URL}/store-integration">Back to integrations</a>
            </div>
        </body>
        </html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
}

serve(async (req) => {
    console.log('[shopify-callback] Request received:', req.method, req.url)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[shopify-callback] Missing required environment variables:', {
            hasApiKey: !!SHOPIFY_API_KEY,
            hasApiSecret: !!SHOPIFY_API_SECRET,
            hasSupabaseUrl: !!SUPABASE_URL,
            hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
        })
        return htmlError('Configuration Error', 'Server is not properly configured. Please contact support.')
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
            return htmlError('Missing Code', 'Authorization code not received from Shopify.')
        }

        if (!shop) {
            return htmlError('Missing Shop', 'Shop domain not received from Shopify.')
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
            return htmlError('Token Exchange Failed', `Could not get access token from Shopify: ${tokenResponse.status}`)
        }

        // Parse JSON safely
        let tokenData
        try {
            tokenData = JSON.parse(tokenResponseText)
        } catch (jsonError) {
            console.error('[shopify-callback] Failed to parse Shopify response as JSON:', jsonError)
            return htmlError('Invalid Response', 'Shopify returned an invalid response. Please try again.')
        }
        console.log('[shopify-callback] Token received, scope:', tokenData.scope)

        if (!tokenData.access_token) {
            return htmlError('No Access Token', 'Shopify did not return an access token.')
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
            return htmlError('Database Error', `Could not save store: ${storeResult.error.message}`)
        }

        console.log('[shopify-callback] Store saved successfully:', storeResult.data)

        // Redirect back to the app with success
        const redirectUrl = `${APP_URL}/store-integration?shopify=connected&store=${encodeURIComponent(cleanShop)}`
        return htmlRedirect(redirectUrl, 'Shopify Connected Successfully!')

    } catch (error) {
        console.error('[shopify-callback] Unexpected error:', error)
        return htmlError('Unexpected Error', error instanceof Error ? error.message : 'An unexpected error occurred.')
    }
})

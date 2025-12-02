/**
 * Shopify OAuth Callback Edge Function
 * 
 * Recebe o callback do OAuth do Shopify e redireciona para a página
 * de callback no frontend, passando os parâmetros OAuth.
 * 
 * O frontend é responsável por:
 * 1. Chamar shopify-callback-exchange para trocar o código por token
 * 2. Exibir produtos para o usuário selecionar
 * 3. Importar os produtos selecionados
 * 
 * IMPORTANTE: Esta função é chamada via GET pelo Shopify após autorização OAuth.
 * Não requer JWT pois é acessada externamente pelo Shopify.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Environment variables
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:8081'

// Redirect to frontend callback page with OAuth params
function redirectToFrontend(code: string, shop: string, state: string | null): Response {
    const params = new URLSearchParams({ code, shop })
    if (state) {
        params.set('state', state)
    }
    const redirectUrl = `${APP_URL}/shopify/callback?${params.toString()}`
    console.log('[shopify-callback] Redirecting to frontend:', redirectUrl)
    return new Response(null, {
        status: 302,
        headers: { 'Location': redirectUrl }
    })
}

// Redirect to app with error message
function redirectError(error: string, details?: string): Response {
    const params = new URLSearchParams({
        error,
        ...(details && { details })
    })
    const redirectUrl = `${APP_URL}/shopify/callback?${params.toString()}`
    console.log('[shopify-callback] Redirecting with error:', redirectUrl)
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

    try {
        // Parse parameters from URL (GET request from Shopify redirect)
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const shop = url.searchParams.get('shop')
        const state = url.searchParams.get('state')
        const errorParam = url.searchParams.get('error')
        const errorDescription = url.searchParams.get('error_description')
        
        console.log('[shopify-callback] Params:', { 
            code: !!code, 
            shop, 
            state: !!state,
            error: errorParam 
        })

        // Check for OAuth error from Shopify
        if (errorParam) {
            return redirectError(errorParam, errorDescription || 'Authorization was denied')
        }

        // Validate required parameters
        if (!code) {
            return redirectError('Missing Code', 'Authorization code not received from Shopify')
        }

        if (!shop) {
            return redirectError('Missing Shop', 'Shop domain not received from Shopify')
        }

        // Redirect to frontend with OAuth params
        // The frontend will handle the token exchange and product selection
        return redirectToFrontend(code, shop, state)

    } catch (error) {
        console.error('[shopify-callback] Unexpected error:', error)
        return redirectError('Unexpected Error', error instanceof Error ? error.message : 'An unexpected error occurred')
    }
})

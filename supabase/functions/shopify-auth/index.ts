/**
 * Shopify OAuth Authorization Edge Function
 * 
 * Gera a URL de autorização OAuth para conectar uma loja Shopify.
 * O usuário é redirecionado para essa URL para autorizar o app.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')
// Updated scopes to include read_shipping and read_locations for importing shipping methods
const SHOPIFY_SCOPES = Deno.env.get('SHOPIFY_SCOPES') || 'read_products,read_orders,read_inventory,read_shipping,read_locations'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Validate Shopify shop domain format
function isValidShopDomain(shop: string): boolean {
    // Accept formats: store.myshopify.com or just store name
    const shopifyDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/
    const storeNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/
    return shopifyDomainRegex.test(shop) || storeNameRegex.test(shop)
}

// Normalize shop domain to include .myshopify.com
function normalizeShopDomain(shop: string): string {
    const cleanShop = shop.toLowerCase().trim()
        .replace('https://', '')
        .replace('http://', '')
        .replace(/\/$/, '')
    
    if (cleanShop.includes('.myshopify.com')) {
        return cleanShop
    }
    return `${cleanShop}.myshopify.com`
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SHOPIFY_API_KEY || !SUPABASE_URL) {
        console.error('Missing required environment variables: SHOPIFY_API_KEY or SUPABASE_URL')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    try {
        // Support both GET (query params) and POST (body) requests
        let shop: string | null = null
        let brand_id: string | null = null

        if (req.method === 'GET') {
            const url = new URL(req.url)
            shop = url.searchParams.get('shop')
            brand_id = url.searchParams.get('brand_id')
        } else if (req.method === 'POST') {
            const body = await req.json()
            shop = body.shop
            brand_id = body.brand_id
        }

        // Validate shop parameter
        if (!shop) {
            return new Response(
                JSON.stringify({ error: 'Missing shop parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Validate brand_id
        if (!brand_id) {
            return new Response(
                JSON.stringify({ error: 'Missing brand_id parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Normalize and validate shop domain
        const normalizedShop = normalizeShopDomain(shop)
        if (!isValidShopDomain(normalizedShop)) {
            return new Response(
                JSON.stringify({ 
                    error: 'Invalid shop domain', 
                    message: 'Shop domain must be in format: store.myshopify.com or just the store name'
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Generate a random state for CSRF protection
        // In production, this should be stored and verified in the callback
        const state = crypto.randomUUID()

        // The redirect URI should point to the callback edge function
        const supabaseProjectRef = SUPABASE_URL!.match(/https:\/\/([^.]+)/)?.[1]
        const redirectUri = `${SUPABASE_URL}/functions/v1/shopify-callback`

        // Construct Shopify OAuth authorization URL
        const authParams = new URLSearchParams({
            client_id: SHOPIFY_API_KEY,
            scope: SHOPIFY_SCOPES,
            redirect_uri: redirectUri,
            state: JSON.stringify({ state, brand_id }) // Include brand_id in state for callback
        })

        const installUrl = `https://${normalizedShop}/admin/oauth/authorize?${authParams.toString()}`

        return new Response(
            JSON.stringify({ 
                url: installUrl,
                shop: normalizedShop,
                state,
                redirect_uri: redirectUri
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error generating auth URL:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

/**
 * Shopify OAuth Callback Edge Function
 * 
 * Processa o callback do OAuth do Shopify e armazena as credenciais
 * na tabela `stores` do Supabase.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Validate environment variables
    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        const body = await req.json()
        const { code, shop, state, brand_id } = body

        // Validate required parameters
        if (!code || !shop || !brand_id) {
            return new Response(
                JSON.stringify({ 
                    error: 'Missing required parameters',
                    required: ['code', 'shop', 'brand_id'],
                    received: { code: !!code, shop: !!shop, brand_id: !!brand_id }
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Clean shop domain
        const cleanShop = shop.replace('https://', '').replace('http://', '').replace(/\/$/, '')

        // Exchange authorization code for access token
        const tokenResponse = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code,
            }),
        })

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            console.error('Shopify token exchange failed:', errorText)
            return new Response(
                JSON.stringify({ error: 'Failed to exchange code for token', details: errorText }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const tokenData = await tokenResponse.json()

        if (!tokenData.access_token) {
            return new Response(
                JSON.stringify({ error: 'No access token received from Shopify' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if store already exists for this brand
        const { data: existingStore } = await supabase
            .from('stores')
            .select('id')
            .eq('brand_id', brand_id)
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
            storeResult = await supabase
                .from('stores')
                .update({
                    api_credentials: apiCredentials,
                    external_store_id: cleanShop,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingStore.id)
                .select('id, name, brand_id, store_type')
                .single()
        } else {
            // Create new store
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
            console.error('Database error:', storeResult.error)
            return new Response(
                JSON.stringify({ error: 'Failed to save store credentials', details: storeResult.error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                store: storeResult.data,
                message: existingStore ? 'Store credentials updated' : 'Store connected successfully'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

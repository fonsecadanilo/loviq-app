import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')!
const SHOPIFY_API_SECRET = Deno.env.get('SHOPIFY_API_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const { code, shop, state, brand_id } = await req.json()

        if (!code || !shop || !brand_id) {
            throw new Error('Missing required parameters')
        }

        // Exchange code for access token
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code,
            }),
        })

        const tokenData = await tokenResponse.json()

        if (!tokenData.access_token) {
            throw new Error('Failed to get access token')
        }

        // Store in database
        const { error } = await supabase
            .from('shopify_integrations')
            .upsert({
                brand_id,
                shop_domain: shop,
                access_token: tokenData.access_token,
                scope: tokenData.scope,
                updated_at: new Date().toISOString()
            }, { onConflict: 'brand_id,shop_domain' })

        if (error) throw error

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
    }
})

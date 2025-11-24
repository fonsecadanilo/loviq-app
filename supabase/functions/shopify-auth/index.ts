import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SHOPIFY_API_KEY = Deno.env.get('SHOPIFY_API_KEY')!
const SHOPIFY_SCOPES = Deno.env.get('SHOPIFY_SCOPES')!
const SHOPIFY_APP_URL = Deno.env.get('SHOPIFY_APP_URL')!

serve(async (req) => {
    // Enable CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const url = new URL(req.url)
        const shop = url.searchParams.get('shop')

        if (!shop) {
            return new Response(
                JSON.stringify({ error: 'Missing shop parameter' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Generate a random state for security (in production, store and verify this)
        const state = crypto.randomUUID()
        const redirectUri = `${SHOPIFY_APP_URL}/api/shopify/callback` // Or your Edge Function URL if different

        // Construct Shopify OAuth URL
        const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

        return new Response(
            JSON.stringify({ url: installUrl }),
            { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})

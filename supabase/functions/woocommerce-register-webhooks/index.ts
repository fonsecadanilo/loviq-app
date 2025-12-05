import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function registerWebhook(siteUrl: string, ck: string, cs: string, topic: string, deliveryUrl: string) {
  const url = `${siteUrl}/wp-json/wc/v3/webhooks`
  const auth = 'Basic ' + btoa(`${ck}:${cs}`)
  const payload = { name: `loviq-${topic}`, topic, delivery_url: deliveryUrl, status: 'active' }
  const res = await fetch(url, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error(`Webhook error: ${res.status}`)
  return await res.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = await req.json()
    const { site_url, consumer_key, consumer_secret, delivery_url, topics } = body
    if (!site_url || !consumer_key || !consumer_secret || !delivery_url) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const t: string[] = Array.isArray(topics) ? topics : ['product.updated', 'order.created']
    const results = [] as Array<any>
    for (const topic of t) {
      const r = await registerWebhook(site_url, consumer_key, consumer_secret, topic, delivery_url)
      results.push(r)
    }
    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to register webhooks', message: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})


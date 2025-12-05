import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SB_URL') || Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function createWooOrder(siteUrl: string, ck: string, cs: string, payload: unknown) {
  const url = `${siteUrl}/wp-json/wc/v3/orders`
  const auth = 'Basic ' + btoa(`${ck}:${cs}`)
  const res = await fetch(url, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error(`Create order error: ${res.status}`)
  return await res.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  try {
    const body = await req.json()
    const { order_id } = body
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, store_id, customer_email, customer_name, total_amount, currency')
      .eq('id', order_id)
      .single()
    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found', details: orderError?.message }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity, unit_price')
      .eq('order_id', order.id)
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, api_credentials')
      .eq('id', order.store_id)
      .eq('store_type', 'woocommerce')
      .single()
    if (storeError || !store) {
      return new Response(JSON.stringify({ error: 'WooCommerce store not found', details: storeError?.message }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const credentials = store.api_credentials as { site_url?: string; consumer_key?: string; consumer_secret?: string } | null
    if (!credentials?.site_url || !credentials?.consumer_key || !credentials?.consumer_secret) {
      return new Response(JSON.stringify({ error: 'Store credentials not configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const lineItems = [] as Array<{ product_id: number; quantity: number }>
    for (const it of items || []) {
      const { data: prod } = await supabase
        .from('products')
        .select('external_product_id')
        .eq('id', it.product_id)
        .single()
      const pid = prod?.external_product_id ? parseInt(prod.external_product_id) : undefined
      if (pid) lineItems.push({ product_id: pid, quantity: it.quantity })
    }
    const payload = {
      billing: { email: order.customer_email || '', first_name: order.customer_name || '' },
      line_items: lineItems,
      set_paid: false,
    }
    const created = await createWooOrder(credentials.site_url, credentials.consumer_key, credentials.consumer_secret, payload)
    await supabase
      .from('orders')
      .update({ external_order_id: String(created?.id || '') })
      .eq('id', order.id)
    return new Response(JSON.stringify({ success: true, woocommerce_order_id: String(created?.id || '') }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create order', message: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

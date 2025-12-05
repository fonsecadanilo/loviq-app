import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SB_URL') || Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type WooProduct = {
  id: number
  name: string
  price: string
  sku: string
  stock_quantity: number | null
  images: Array<{ src: string }>
}

async function fetchWooProducts(siteUrl: string, ck: string, cs: string, page = 1, perPage = 50): Promise<WooProduct[]> {
  const url = `${siteUrl}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}&status=publish`
  const auth = 'Basic ' + btoa(`${ck}:${cs}`)
  const res = await fetch(url, { headers: { Authorization: auth } })
  if (!res.ok) throw new Error(`WooCommerce API error: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  try {
    const body = await req.json()
    const { store_id } = body
    if (!store_id) {
      return new Response(JSON.stringify({ error: 'Missing store_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, name, api_credentials')
      .eq('id', store_id)
      .eq('store_type', 'woocommerce')
      .single()
    if (storeError || !store) {
      return new Response(JSON.stringify({ error: 'WooCommerce store not found', details: storeError?.message }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const credentials = store.api_credentials as { site_url?: string; consumer_key?: string; consumer_secret?: string } | null
    if (!credentials?.site_url || !credentials?.consumer_key || !credentials?.consumer_secret) {
      return new Response(JSON.stringify({ error: 'Store credentials not configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    let page = 1
    let synced = 0
    for (;;) {
      const batch = await fetchWooProducts(credentials.site_url, credentials.consumer_key, credentials.consumer_secret, page, 50)
      if (!batch.length) break
      const rows = batch.map((p) => ({
        name: p.name,
        description: null as string | null,
        price: parseFloat(p.price || '0'),
        currency: 'BRL',
        image_url: p.images?.[0]?.src || null,
        store_id: store.id as number,
        product_source_type: 'manual' as const,
        external_product_id: p.id.toString(),
        stock_quantity: p.stock_quantity ?? 0,
      }))
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(rows, { onConflict: 'external_product_id,store_id' })
      if (upsertError) {
        return new Response(JSON.stringify({ error: 'Upsert failed', details: upsertError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      synced += rows.length
      page += 1
    }
    return new Response(JSON.stringify({ success: true, synced }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to sync products', message: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

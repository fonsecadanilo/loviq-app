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
  slug: string
}

async function fetchWooProducts(siteUrl: string, ck: string, cs: string, limit = 50): Promise<WooProduct[]> {
  const url = `${siteUrl}/wp-json/wc/v3/products?per_page=${limit}&status=publish`
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
    const { store_id, brand_id, limit = 50 } = body
    if (!store_id && !brand_id) {
      return new Response(JSON.stringify({ error: 'Missing store_id or brand_id parameter' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    let storeQuery = supabase
      .from('stores')
      .select('id, brand_id, name, store_type, api_credentials, external_store_id')
      .eq('store_type', 'woocommerce')
    if (store_id) storeQuery = storeQuery.eq('id', store_id)
    else if (brand_id) storeQuery = storeQuery.eq('brand_id', brand_id)
    const { data: store, error: storeError } = await storeQuery.single()
    if (storeError || !store) {
      return new Response(JSON.stringify({ error: 'WooCommerce store not found', details: storeError?.message }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const credentials = store.api_credentials as { site_url?: string; consumer_key?: string; consumer_secret?: string } | null
    if (!credentials?.site_url || !credentials?.consumer_key || !credentials?.consumer_secret) {
      return new Response(JSON.stringify({ error: 'Store credentials not configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const wooProducts = await fetchWooProducts(credentials.site_url, credentials.consumer_key, credentials.consumer_secret, limit)
    const { data: importedProducts } = await supabase
      .from('products')
      .select('external_product_id')
      .eq('store_id', store.id)
    const importedIds = new Set(importedProducts?.map((p: { external_product_id: string | null }) => p.external_product_id || '') || [])
    const products = wooProducts.map((p) => {
      const img = p.images?.[0]?.src || null
      const inventory = p.stock_quantity ?? 0
      return {
        id: p.id.toString(),
        title: p.name,
        image: img,
        price: p.price || '0.00',
        sku: p.sku || '',
        inventory,
        vendor: '',
        product_type: '',
        handle: p.slug,
        already_imported: importedIds.has(p.id.toString()),
      }
    })
    return new Response(JSON.stringify({ success: true, products, store_id: store.id, store_name: store.name }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch products', message: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

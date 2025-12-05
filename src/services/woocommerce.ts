import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { TablesInsert } from '../types/database'

type WooApiCredentials = {
  site_url?: string
  consumer_key?: string
  consumer_secret?: string
  [key: string]: string | undefined
}

export interface WooStore {
  id: number
  brand_id: number
  name: string
  external_store_id: string | null
  created_at: string
}

export interface ConnectionStatus {
  connected: boolean
  store: WooStore | null
  productsCount: number
  lastSync: string | null
}

export type WooRawProduct = {
  id: number | string
  name?: string
  images?: Array<{ src?: string | null }>
  price?: string | number
  sku?: string
  stock_quantity?: number
  slug?: string
}

export interface RemoteProduct {
  id: string
  title: string
  image: string | null
  price: string
  sku: string
  inventory: number
  vendor: string
  product_type: string
  handle: string
  already_imported: boolean
}

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])
}

export const WooCommerceService = {
  async getConnectionStatus(brandId: number): Promise<ConnectionStatus> {
    const defaultStatus: ConnectionStatus = { connected: false, store: null, productsCount: 0, lastSync: null }
    if (!isSupabaseConfigured()) return defaultStatus
    return withTimeout(
      (async () => {
        const { data: store } = await supabase
          .from('stores')
          .select('id, brand_id, name, external_store_id, created_at')
          .eq('brand_id', brandId)
          .eq('store_type', 'woocommerce')
          .maybeSingle()
        if (!store) return defaultStatus
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', store.id)
        return { connected: true, store: store as WooStore, productsCount: productsCount || 0, lastSync: null }
      })(),
      2000,
      defaultStatus
    )
  },

  async connectStore(brandId: number, siteUrl: string, consumerKey: string, consumerSecret: string): Promise<{ success: boolean; store?: WooStore; error?: string }> {
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 1000))
      return {
        success: true,
        store: { id: 0, brand_id: brandId, name: siteUrl, external_store_id: siteUrl, created_at: new Date().toISOString() },
      }
    }
    const normalizeSiteUrl = (url: string) => {
      let u = url.trim()
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`
      u = u.replace(/\/+$/, '')
      return u
    }
    const normalizedUrl = normalizeSiteUrl(siteUrl)
    const newStore: TablesInsert<'stores'> = {
      brand_id: brandId,
      name: normalizedUrl.replace(/^https?:\/\//, ''),
      store_type: 'woocommerce',
      external_store_id: normalizedUrl.replace(/^https?:\/\//, ''),
      api_credentials: { site_url: normalizedUrl, consumer_key: consumerKey, consumer_secret: consumerSecret } as WooApiCredentials,
    }
    const { data: store, error } = await supabase
      .from('stores')
      .insert(newStore)
      .select('id, brand_id, name, external_store_id, created_at')
      .single()
    if (error) {
      const msg = error.message || ''
      if (msg.toLowerCase().includes('invalid api key')) {
        return { success: false, error: 'Supabase inválido: verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY' }
      }
      return { success: false, error: `Erro ao conectar loja: ${msg}` }
    }
    return { success: true, store: store as WooStore }
  },

  async disconnectStore(storeId: number): Promise<{ success: boolean; error?: string }>{
    if (!isSupabaseConfigured()) return { success: true }
    await supabase.from('products').delete().eq('store_id', storeId)
    const { error } = await supabase.from('stores').delete().eq('id', storeId)
    if (error) return { success: false, error: 'Erro ao desconectar loja' }
    return { success: true }
  },

  async syncProducts(storeId: number): Promise<{ success: boolean; synced: number; error?: string }>{
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 1000))
      return { success: true, synced: 0 }
    }
    const { data, error } = await supabase.functions.invoke('woocommerce-sync-products', { body: { store_id: storeId } })
    if (error) return { success: false, synced: 0, error: error.message }
    return { success: true, synced: data?.synced || 0 }
  },

  async listRemoteProducts(params: { store_id?: number; brand_id?: number; limit?: number }): Promise<{ success: boolean; products: Array<RemoteProduct>; store_id?: number; store_name?: string; error?: string }>{
    if (!isSupabaseConfigured()) return { success: true, products: [] }
    const { data, error } = await supabase.functions.invoke('woocommerce-list-products', { body: params })
    if (!error && data && !data.error) return data
    const limit = params.limit ?? 50
    let storeQuery = supabase
      .from('stores')
      .select('id, brand_id, name, store_type, api_credentials, external_store_id')
      .eq('store_type', 'woocommerce')
    if (params.store_id) storeQuery = storeQuery.eq('id', params.store_id)
    else if (params.brand_id) storeQuery = storeQuery.eq('brand_id', params.brand_id)
    const { data: store } = await storeQuery.maybeSingle()
    if (!store || !store.api_credentials) return { success: false, products: [], error: 'WooCommerce store not found or credentials missing' }
    const creds = store.api_credentials as { site_url?: string; consumer_key?: string; consumer_secret?: string }
    if (!creds.site_url || !creds.consumer_key || !creds.consumer_secret) return { success: false, products: [], error: 'Store credentials not configured' }
    const base = `${creds.site_url.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=${limit}&status=publish`
    const qpAuth = `&consumer_key=${encodeURIComponent(creds.consumer_key)}&consumer_secret=${encodeURIComponent(creds.consumer_secret)}`
    const candidates: string[] = [
      `${base}${qpAuth}`,
    ]
    if (/^https:\/\//i.test(base)) {
      candidates.push(`${base.replace(/^https:\/\//i, 'http://')}${qpAuth}`)
    }
    let res: Response | null = null
    let lastError: string | null = null
    for (const u of candidates) {
      try {
        const r = await fetch(u)
        if (r.ok) { res = r; break }
        lastError = `HTTP ${r.status}`
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Network error'
      }
    }
    if (!res) {
      // Try Basic Auth as final attempt (may require CORS enabled on server)
      try {
        const auth = 'Basic ' + btoa(`${creds.consumer_key}:${creds.consumer_secret}`)
        const r2 = await fetch(base, { headers: { Authorization: auth } })
        if (r2.ok) {
          res = r2
        } else {
          lastError = `HTTP ${r2.status}`
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Network error'
      }
    }
    if (!res) return { success: false, products: [], error: `WooCommerce API fetch failed: ${lastError || 'unknown error'}` }
    const wooData = await res.json()
    const { data: imported } = await supabase
      .from('products')
      .select('external_product_id')
      .eq('store_id', store.id)
    const importedIds = new Set((imported || []).map((p: { external_product_id: string | null }) => p.external_product_id || ''))
    const products = Array.isArray(wooData) ? wooData.map((p: WooRawProduct) => ({
      id: String(p.id),
      title: String(p.name || ''),
      image: p.images?.[0]?.src || null,
      price: String(p.price || '0.00'),
      sku: String(p.sku || ''),
      inventory: typeof p.stock_quantity === 'number' ? p.stock_quantity : 0,
      vendor: '',
      product_type: '',
      handle: String(p.slug || ''),
      already_imported: importedIds.has(String(p.id)),
    })) : []
    return { success: true, products, store_id: store.id, store_name: store.name }
  },
}

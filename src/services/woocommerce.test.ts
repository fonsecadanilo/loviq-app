import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as supabaseModule from '../lib/supabase'
import { WooCommerceService } from './woocommerce'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

describe('WooCommerceService.connectStore', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns friendly error when Supabase API key is invalid', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true)
    const insert = vi.fn().mockReturnValue({ select: () => ({ single: () => ({ data: null, error: { message: 'Invalid API key' } }) }) })
    const from = vi.fn().mockReturnValue({ insert })
    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({ from } as unknown as SupabaseClient<Database>)

    const res = await WooCommerceService.connectStore(1, 'https://example.com', 'ck_x', 'cs_y')
    expect(res.success).toBe(false)
    expect(res.error).toContain('Supabase inválido')
  })

  it('creates store when Supabase is configured and insert succeeds', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true)
    const single = vi.fn().mockReturnValue({ data: { id: 10, brand_id: 1, name: 'example', external_store_id: 'example', created_at: new Date().toISOString() }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const from = vi.fn().mockReturnValue({ insert })
    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({ from } as unknown as SupabaseClient<Database>)

    const res = await WooCommerceService.connectStore(1, 'https://example.com', 'ck_x', 'cs_y')
    expect(res.success).toBe(true)
    expect(res.store?.id).toBe(10)
  })

  it('returns demo success when Supabase not configured', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(false)
    const res = await WooCommerceService.connectStore(1, 'https://example.com', 'ck_x', 'cs_y')
    expect(res.success).toBe(true)
    expect(res.store?.brand_id).toBe(1)
  })

  it('falls back to direct Woo API when Edge Function fails', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true)
    const functions = { invoke: vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed to send a request to the Edge Function' } }) }
    const storesSingle = { data: { id: 22, brand_id: 1, name: 'dev-woo', store_type: 'woocommerce', api_credentials: { site_url: 'https://example.com', consumer_key: 'ck_x', consumer_secret: 'cs_y' }, external_store_id: 'dev-woo' }, error: null }
    const productsSelect = { data: [{ external_product_id: '123' }], error: null }
    const storesQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue(storesSingle) }
    const productsQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue(productsSelect) }
    const from = vi.fn((table: string) => (table === 'stores' ? storesQuery : productsQuery))
    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({ functions, from } as unknown as SupabaseClient<Database>)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([{ id: 123, name: 'P', images: [], price: '10.00', sku: '', stock_quantity: 3, slug: 'p' }]) }))

    const res = await WooCommerceService.listRemoteProducts({ brand_id: 1, limit: 50 })
    expect(res.success).toBe(true)
    expect(res.products.length).toBe(1)
    expect(res.products[0].already_imported).toBe(true)
  })

  it('preserves protocol when saving site_url', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true)
    const insert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue({ data: { id: 10, brand_id: 1, name: 'example.com', external_store_id: 'example.com', created_at: new Date().toISOString() }, error: null }) }) })
    const from = vi.fn().mockReturnValue({ insert })
    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({ from } as unknown as SupabaseClient<Database>)

    await WooCommerceService.connectStore(1, 'http://example.com/', 'ck_x', 'cs_y')
    const payload = insert.mock.calls[0][0]
    expect(payload.api_credentials.site_url).toBe('http://example.com')
  })

  it('tries http when https fetch fails', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true)
    const functions = { invoke: vi.fn().mockResolvedValue({ data: null, error: { message: 'Failed to send a request to the Edge Function' } }) }
    const storesSingle = { data: { id: 22, brand_id: 1, name: 'dev-woo', store_type: 'woocommerce', api_credentials: { site_url: 'https://example.com', consumer_key: 'ck_x', consumer_secret: 'cs_y' }, external_store_id: 'dev-woo' }, error: null }
    const productsSelect = { data: [], error: null }
    const storesQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue(storesSingle) }
    const productsQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue(productsSelect) }
    const from = vi.fn((table: string) => (table === 'stores' ? storesQuery : productsQuery))
    vi.spyOn(supabaseModule, 'supabase', 'get').mockReturnValue({ functions, from } as unknown as SupabaseClient<Database>)

    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 0, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ([{ id: 1, name: 'X' }]) })
    vi.stubGlobal('fetch', fetchMock)

    const res = await WooCommerceService.listRemoteProducts({ brand_id: 1, limit: 1 })
    expect(res.success).toBe(true)
    expect(res.products.length).toBe(1)
  })
})

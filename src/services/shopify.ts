/**
 * Serviço de integração com Shopify
 * 
 * Este serviço gerencia a conexão com lojas Shopify através da tabela `stores`
 * e sincroniza produtos para a tabela `products` com extensão em `shopify_products`.
 * 
 * Fluxo de dados:
 * - brands (1) -> stores (N) -> products (N)
 * - stores.store_type = 'shopify' para lojas Shopify
 * - products.product_source_type = 'shopify' para produtos sincronizados
 * - shopify_products armazena dados específicos do Shopify (variant_id, etc.)
 * - shopify_sync_logs registra histórico de sincronizações
 */

import { supabase, isSupabaseConfigured, isSilentError } from '../lib/supabase'
import type { 
    Store, 
    Product, 
    ShopifyProduct, 
    ShopifySyncLog,
    TablesInsert 
} from '../types/database'

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Representa uma loja Shopify conectada (subset de Store)
 */
export interface ShopifyStore {
    id: number
    brand_id: number
    name: string
    external_store_id: string | null
    created_at: string
}

/**
 * Região normalizada (país, estado ou província)
 */
export interface ShopifyNormalizedRegion {
    id: string
    name: string
    code: string
    type: 'country' | 'province' | 'state'
    country_code?: string
    country_name?: string
}

/**
 * Taxa de envio normalizada
 */
export interface ShopifyNormalizedShippingRate {
    id: number
    name: string
    price: number
    currency: string
    type: 'flat' | 'weight_based' | 'price_based' | 'carrier'
    conditions?: {
        min_weight?: number
        max_weight?: number
        min_order_subtotal?: number
        max_order_subtotal?: number
    }
}

/**
 * Zona de envio normalizada
 */
export interface ShopifyNormalizedShippingZone {
    id: number
    name: string
    regions: ShopifyNormalizedRegion[]
    rates: ShopifyNormalizedShippingRate[]
}

/**
 * Localização física normalizada
 */
export interface ShopifyNormalizedLocation {
    id: number
    name: string
    address: {
        line1: string | null
        line2: string | null
        city: string | null
        province: string | null
        province_code: string | null
        country: string | null
        country_code: string | null
        zip: string | null
    }
    phone: string | null
    active: boolean
}

/**
 * Resposta completa de dados de shipping
 */
export interface ShopifyShippingData {
    success: boolean
    shipping_zones: ShopifyNormalizedShippingZone[]
    locations: ShopifyNormalizedLocation[]
    error?: string
}

/**
 * Produto com informações do Shopify
 */
export interface ShopifyProductWithDetails extends Product {
    shopify_details?: ShopifyProduct | null
}

/**
 * Resultado da verificação de conexão
 */
export interface ConnectionStatus {
    connected: boolean
    store: ShopifyStore | null
    productsCount: number
    lastSync: string | null
}

/**
 * Credenciais da API Shopify (armazenadas em stores.api_credentials)
 */
interface ShopifyApiCredentials {
    access_token?: string
    shop_domain?: string
    api_key?: string
    api_secret?: string
    scopes?: string[]
    [key: string]: string | string[] | undefined // Index signature para compatibilidade com Json
}

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

// Helper: Promise with timeout
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
};

export const ShopifyService = {
    /**
     * Verifica o status da integração Shopify para uma marca
     * Busca na tabela `stores` por lojas do tipo 'shopify'
     */
    async getConnectionStatus(brandId: number): Promise<ConnectionStatus> {
        const defaultStatus: ConnectionStatus = { connected: false, store: null, productsCount: 0, lastSync: null };
        
        console.log('[ShopifyService.getConnectionStatus] Called with brandId:', brandId);
        
        // Verifica se Supabase está configurado
        if (!isSupabaseConfigured()) {
            console.log('[ShopifyService.getConnectionStatus] Supabase not configured');
            return defaultStatus;
        }

        // Wrap entire operation in a timeout to prevent hanging
        return withTimeout(
            (async () => {
                try {
                    // Busca loja Shopify da marca
                    console.log('[ShopifyService.getConnectionStatus] Querying stores table for brandId:', brandId);
                    let { data: store, error: storeError } = await supabase
                        .from('stores')
                        .select('id, brand_id, name, external_store_id, created_at')
                        .eq('brand_id', brandId)
                        .eq('store_type', 'shopify')
                        .maybeSingle()

                    console.log('[ShopifyService.getConnectionStatus] Query result:', { store, storeError });

                    // Se não encontrou por brand_id, tenta buscar qualquer loja Shopify
                    // Isso resolve o problema quando o OAuth salvou com brand_id errado
                    if (!store && !storeError) {
                        console.log('[ShopifyService.getConnectionStatus] No store found for brandId, trying to find any Shopify store...');
                        
                        const { data: anyStore, error: anyStoreError } = await supabase
                            .from('stores')
                            .select('id, brand_id, name, external_store_id, created_at')
                            .eq('store_type', 'shopify')
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .maybeSingle()
                        
                        console.log('[ShopifyService.getConnectionStatus] Any Shopify store:', { anyStore, anyStoreError });
                        
                        if (anyStore && !anyStoreError) {
                            // Se encontrou uma loja com brand_id diferente, atualiza o brand_id
                            if (anyStore.brand_id !== brandId) {
                                console.log('[ShopifyService.getConnectionStatus] Updating store brand_id from', anyStore.brand_id, 'to', brandId);
                                
                                const { error: updateError } = await supabase
                                    .from('stores')
                                    .update({ brand_id: brandId })
                                    .eq('id', anyStore.id)
                                
                                if (updateError) {
                                    console.error('[ShopifyService.getConnectionStatus] Error updating brand_id:', updateError);
                                } else {
                                    console.log('[ShopifyService.getConnectionStatus] Successfully updated brand_id');
                                    anyStore.brand_id = brandId;
                                }
                            }
                            store = anyStore;
                        }
                    }

                    if (storeError && !isSilentError(storeError.code)) {
                        console.error('Erro ao buscar loja Shopify:', storeError)
                        return defaultStatus;
                    }

                    if (!store) {
                        console.log('[ShopifyService.getConnectionStatus] No store found for brandId:', brandId);
                        return defaultStatus;
                    }

                    // Conta produtos sincronizados
                    const { count: productsCount } = await supabase
                        .from('products')
                        .select('*', { count: 'exact', head: true })
                        .eq('store_id', store.id)
                        .eq('product_source_type', 'shopify')

                    // Busca última sincronização
                    const { data: lastSyncLog } = await supabase
                        .from('shopify_sync_logs')
                        .select('finished_at')
                        .eq('store_id', store.id)
                        .eq('status', 'success')
                        .order('finished_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()

                    return {
                        connected: true,
                        store: store as ShopifyStore,
                        productsCount: productsCount || 0,
                        lastSync: lastSyncLog?.finished_at || null
                    }
                } catch (error) {
                    console.error('Erro ao verificar status da conexão:', error)
                    return defaultStatus;
                }
            })(),
            2000, // 2 second timeout
            defaultStatus
        );
    },

    /**
     * Inicia o processo de conexão com uma loja Shopify
     * 
     * Em produção, isso invocaria uma Edge Function para OAuth.
     * Por enquanto, cria o registro da loja para demonstração.
     */
    async connectStore(brandId: number, shopDomain: string): Promise<{ success: boolean; store?: ShopifyStore; error?: string; redirecting?: boolean }> {
        console.log('[ShopifyService] connectStore called with:', { brandId, shopDomain })
        
        // Verifica se Supabase está configurado
        if (!isSupabaseConfigured()) {
            console.warn('[ShopifyService] Supabase não configurado. Simulando conexão.')
            
            // Simula um delay para UX
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            return {
                success: true,
                store: {
                    id: 0,
                    brand_id: brandId,
                    name: shopDomain,
                    external_store_id: null,
                    created_at: new Date().toISOString()
                }
            }
        }

        try {
            // Limpa o domínio
            const cleanDomain = shopDomain
                .replace('https://', '')
                .replace('http://', '')
                .replace(/\/$/, '')
            
            console.log('[ShopifyService] Clean domain:', cleanDomain)

            // Verifica se já existe uma loja conectada
            const { data: existingStore, error: checkError } = await supabase
                .from('stores')
                .select('id')
                .eq('brand_id', brandId)
                .eq('store_type', 'shopify')
                .maybeSingle()

            console.log('[ShopifyService] Existing store check:', { existingStore, checkError })

            if (existingStore) {
                return { success: false, error: 'Já existe uma loja Shopify conectada para esta marca' }
            }

            // Tenta invocar Edge Function para OAuth
            console.log('[ShopifyService] Invoking shopify-auth Edge Function...')
            
            const { data, error } = await supabase.functions.invoke('shopify-auth', {
                body: { 
                    shop: cleanDomain,
                    brand_id: brandId 
                }
            })

            console.log('[ShopifyService] Edge Function response:', { data, error })

            if (error) {
                console.error('[ShopifyService] Edge Function error:', error)
                return { 
                    success: false, 
                    error: `Erro ao conectar: ${error.message || 'Edge Function falhou'}` 
                }
            }

            if (data?.url) {
                console.log('[ShopifyService] Redirecting to Shopify OAuth URL:', data.url)
                // Redireciona para OAuth do Shopify
                window.location.href = data.url
                return { success: true, redirecting: true }
            }

            if (data?.error) {
                console.error('[ShopifyService] Edge Function returned error:', data.error)
                return { 
                    success: false, 
                    error: data.message || data.error || 'Erro na Edge Function' 
                }
            }

            // Se não houve redirecionamento nem erro, algo inesperado aconteceu
            console.warn('[ShopifyService] No URL returned from Edge Function, falling back to direct creation')

            // Fallback: Cria registro da loja diretamente (para desenvolvimento/demo)
            const newStore: TablesInsert<'stores'> = {
                brand_id: brandId,
                name: cleanDomain,
                store_type: 'shopify',
                external_store_id: cleanDomain,
                api_credentials: {
                    shop_domain: cleanDomain,
                    // Em produção, access_token seria obtido via OAuth
                } as ShopifyApiCredentials
            }

            const { data: store, error: insertError } = await supabase
                .from('stores')
                .insert(newStore)
                .select('id, brand_id, name, external_store_id, created_at')
                .single()

            if (insertError) {
                console.error('[ShopifyService] Erro ao criar loja:', insertError)
                return { success: false, error: `Erro ao conectar loja: ${insertError.message}` }
            }

            console.log('[ShopifyService] Store created successfully:', store)
            return { success: true, store: store as ShopifyStore }
        } catch (error) {
            console.error('[ShopifyService] Erro ao conectar loja Shopify:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Erro inesperado ao conectar loja' }
        }
    },

    /**
     * Desconecta uma loja Shopify
     */
    async disconnectStore(storeId: number): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured()) {
            return { success: true }
        }

        try {
            // Remove produtos da loja primeiro
            await supabase
                .from('products')
                .delete()
                .eq('store_id', storeId)

            // Remove logs de sincronização
            await supabase
                .from('shopify_sync_logs')
                .delete()
                .eq('store_id', storeId)

            // Remove a loja
            const { error } = await supabase
                .from('stores')
                .delete()
                .eq('id', storeId)

            if (error) {
                console.error('Erro ao desconectar loja:', error)
                return { success: false, error: 'Erro ao desconectar loja' }
            }

            return { success: true }
        } catch (error) {
            console.error('Erro ao desconectar loja:', error)
            return { success: false, error: 'Erro inesperado' }
        }
    },

    /**
     * Sincroniza produtos do Shopify
     * 
     * Em produção, isso invocaria uma Edge Function que:
     * 1. Busca produtos via Shopify API
     * 2. Insere/atualiza na tabela products
     * 3. Cria registros em shopify_products
     * 4. Registra log em shopify_sync_logs
     */
    async syncProducts(storeId: number): Promise<{ success: boolean; synced: number; error?: string }> {
        if (!isSupabaseConfigured()) {
            console.warn('[ShopifyService] Supabase não configurado. Simulando sincronização.')
            await new Promise(resolve => setTimeout(resolve, 2000))
            return { success: true, synced: 0 }
        }

        try {
            // Cria log de sincronização
            const syncLog: TablesInsert<'shopify_sync_logs'> = {
                store_id: storeId,
                sync_type: 'products',
                status: 'in_progress',
                started_at: new Date().toISOString()
            }

            const { data: log, error: logError } = await supabase
                .from('shopify_sync_logs')
                .insert(syncLog)
                .select('id')
                .single()

            if (logError) {
                console.error('Erro ao criar log de sincronização:', logError)
            }

            // Tenta invocar Edge Function de sincronização
            try {
                const { data, error } = await supabase.functions.invoke('shopify-sync-products', {
                    body: { store_id: storeId }
                })

                if (!error && data) {
                    // Atualiza log como sucesso
                    if (log?.id) {
                        await supabase
                            .from('shopify_sync_logs')
                            .update({
                                status: 'success',
                                finished_at: new Date().toISOString(),
                                message: `${data.synced || 0} produtos sincronizados`
                            })
                            .eq('id', log.id)
                    }

                    return { success: true, synced: data.synced || 0 }
                }
            } catch (fnError) {
                console.warn('[ShopifyService] Edge Function de sync não disponível')
            }

            // Atualiza log como sucesso (demo mode)
            if (log?.id) {
                await supabase
                    .from('shopify_sync_logs')
                    .update({
                        status: 'success',
                        finished_at: new Date().toISOString(),
                        message: 'Sincronização simulada (Edge Function não configurada)'
                    })
                    .eq('id', log.id)
            }

            return { success: true, synced: 0 }
        } catch (error) {
            console.error('Erro ao sincronizar produtos:', error)
            return { success: false, synced: 0, error: 'Erro ao sincronizar' }
        }
    },

    /**
     * Lista produtos sincronizados de uma loja
     */
    async getProducts(storeId: number, limit = 50, offset = 0): Promise<ShopifyProductWithDetails[]> {
        if (!isSupabaseConfigured()) {
            return []
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    shopify_details:shopify_products(*)
                `)
                .eq('store_id', storeId)
                .eq('product_source_type', 'shopify')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error && !isSilentError(error.code)) {
                console.error('Erro ao buscar produtos:', error)
                return []
            }

            return (data || []) as ShopifyProductWithDetails[]
        } catch (error) {
            console.error('Erro ao buscar produtos:', error)
            return []
        }
    },

    /**
     * Busca logs de sincronização
     */
    async getSyncLogs(storeId: number, limit = 10): Promise<ShopifySyncLog[]> {
        if (!isSupabaseConfigured()) {
            return []
        }

        try {
            const { data, error } = await supabase
                .from('shopify_sync_logs')
                .select('*')
                .eq('store_id', storeId)
                .order('started_at', { ascending: false })
                .limit(limit)

            if (error && !isSilentError(error.code)) {
                console.error('Erro ao buscar logs:', error)
                return []
            }

            return (data || []) as ShopifySyncLog[]
        } catch (error) {
            console.error('Erro ao buscar logs:', error)
            return []
        }
    },

    /**
     * Cria um pedido no Shopify a partir de um pedido da Loviq
     * 
     * Esta função invoca a Edge Function `shopify-create-order` que:
     * 1. Busca os detalhes do pedido e itens no banco
     * 2. Mapeia os produtos para os IDs do Shopify
     * 3. Cria o pedido na API do Shopify
     * 4. Atualiza o external_order_id no banco
     */
    async createOrderInShopify(orderId: number): Promise<{
        success: boolean
        shopify_order_id?: string
        shopify_order_name?: string
        error?: string
        details?: string
    }> {
        console.log('[ShopifyService] createOrderInShopify called with:', { orderId })

        if (!isSupabaseConfigured()) {
            console.warn('[ShopifyService] Supabase não configurado. Simulando criação de pedido.')
            await new Promise(resolve => setTimeout(resolve, 1500))
            return {
                success: true,
                shopify_order_id: 'mock-123456',
                shopify_order_name: '#MOCK-1001'
            }
        }

        try {
            // Invoca Edge Function para criar pedido no Shopify
            console.log('[ShopifyService] Invoking shopify-create-order Edge Function...')

            const { data, error } = await supabase.functions.invoke('shopify-create-order', {
                body: { order_id: orderId }
            })

            console.log('[ShopifyService] Edge Function response:', { data, error })

            if (error) {
                console.error('[ShopifyService] Edge Function error:', error)
                return {
                    success: false,
                    error: `Erro ao criar pedido: ${error.message || 'Edge Function falhou'}`,
                    details: error.context?.message || error.message
                }
            }

            if (data?.error) {
                console.error('[ShopifyService] Edge Function returned error:', data.error)
                return {
                    success: false,
                    error: data.error,
                    details: data.details || data.message
                }
            }

            if (data?.success) {
                return {
                    success: true,
                    shopify_order_id: data.shopify_order_id,
                    shopify_order_name: data.shopify_order_name
                }
            }

            // Resposta inesperada
            return {
                success: false,
                error: 'Resposta inesperada da Edge Function'
            }
        } catch (error) {
            console.error('[ShopifyService] Erro ao criar pedido no Shopify:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro inesperado ao criar pedido'
            }
        }
    },

    /**
     * Verifica se um pedido já foi sincronizado com o Shopify
     */
    async isOrderSyncedToShopify(orderId: number): Promise<boolean> {
        if (!isSupabaseConfigured()) {
            return false
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('external_order_id')
                .eq('id', orderId)
                .single()

            if (error) {
                console.error('[ShopifyService] Erro ao verificar pedido:', error)
                return false
            }

            return !!data?.external_order_id
        } catch (error) {
            console.error('[ShopifyService] Erro ao verificar pedido:', error)
            return false
        }
    },

    /**
     * Busca dados de envio (shipping zones, rates) e localizações do Shopify
     * 
     * IMPORTANTE: Requer os escopos OAuth adicionais:
     * - read_shipping (para shipping zones e rates)
     * - read_locations (para locations)
     * 
     * @param storeId - ID da loja Shopify no banco de dados
     * @param includeRaw - Se true, inclui dados brutos do Shopify na resposta (útil para debug)
     */
    async fetchShippingData(storeId: number, includeRaw = false): Promise<ShopifyShippingData> {
        console.log('[ShopifyService] fetchShippingData called with:', { storeId, includeRaw })

        const defaultResponse: ShopifyShippingData = {
            success: false,
            shipping_zones: [],
            locations: [],
            error: 'Supabase não configurado'
        }

        if (!isSupabaseConfigured()) {
            console.warn('[ShopifyService] Supabase não configurado. Retornando dados vazios.')
            return defaultResponse
        }

        try {
            // Invoca Edge Function para buscar dados de shipping
            console.log('[ShopifyService] Invoking shopify-fetch-shipping Edge Function...')

            const { data, error } = await supabase.functions.invoke('shopify-fetch-shipping', {
                body: { 
                    store_id: storeId,
                    include_raw: includeRaw
                }
            })

            console.log('[ShopifyService] Edge Function response:', { 
                success: data?.success, 
                zones: data?.shipping_zones?.length,
                locations: data?.locations?.length,
                error 
            })

            if (error) {
                console.error('[ShopifyService] Edge Function error:', error)
                return {
                    success: false,
                    shipping_zones: [],
                    locations: [],
                    error: `Erro ao buscar dados de envio: ${error.message || 'Edge Function falhou'}`
                }
            }

            if (data?.error) {
                console.error('[ShopifyService] Edge Function returned error:', data.error)
                return {
                    success: false,
                    shipping_zones: [],
                    locations: [],
                    error: data.message || data.error
                }
            }

            if (data?.success) {
                return {
                    success: true,
                    shipping_zones: data.shipping_zones || [],
                    locations: data.locations || []
                }
            }

            // Resposta inesperada
            return {
                success: false,
                shipping_zones: [],
                locations: [],
                error: 'Resposta inesperada da Edge Function'
            }
        } catch (error) {
            console.error('[ShopifyService] Erro ao buscar dados de envio:', error)
            return {
                success: false,
                shipping_zones: [],
                locations: [],
                error: error instanceof Error ? error.message : 'Erro inesperado ao buscar dados de envio'
            }
        }
    },

    /**
     * Retorna todas as regiões únicas configuradas no Shopify
     * Útil para preencher o campo de "Delivery Regions" na tela de configurações
     */
    async getAllShippingRegions(storeId: number): Promise<ShopifyNormalizedRegion[]> {
        const data = await this.fetchShippingData(storeId)
        
        if (!data.success) {
            console.warn('[ShopifyService] Falha ao buscar regiões:', data.error)
            return []
        }

        // Extrai todas as regiões de todas as zonas
        const allRegions: ShopifyNormalizedRegion[] = []
        const seenIds = new Set<string>()

        for (const zone of data.shipping_zones) {
            for (const region of zone.regions) {
                if (!seenIds.has(region.id)) {
                    seenIds.add(region.id)
                    allRegions.push(region)
                }
            }
        }

        // Ordena: países primeiro, depois estados/províncias por nome
        return allRegions.sort((a, b) => {
            if (a.type === 'country' && b.type !== 'country') return -1
            if (a.type !== 'country' && b.type === 'country') return 1
            return a.name.localeCompare(b.name)
        })
    },

    /**
     * Retorna todas as taxas de envio configuradas no Shopify
     */
    async getAllShippingRates(storeId: number): Promise<ShopifyNormalizedShippingRate[]> {
        const data = await this.fetchShippingData(storeId)
        
        if (!data.success) {
            console.warn('[ShopifyService] Falha ao buscar taxas:', data.error)
            return []
        }

        // Extrai todas as taxas de todas as zonas
        const allRates: ShopifyNormalizedShippingRate[] = []
        const seenIds = new Set<number>()

        for (const zone of data.shipping_zones) {
            for (const rate of zone.rates) {
                if (!seenIds.has(rate.id)) {
                    seenIds.add(rate.id)
                    allRates.push(rate)
                }
            }
        }

        // Ordena por preço
        return allRates.sort((a, b) => a.price - b.price)
    }
}

// ============================================================================
// EXPORTS LEGADOS (para compatibilidade com código existente)
// ============================================================================

/**
 * @deprecated Use ShopifyService.getConnectionStatus() em vez disso
 */
export interface ShopifyIntegration {
    id: string
    shop_domain: string
    created_at: string
}

/**
 * @deprecated Mantido para compatibilidade com ShopifyConnectButton
 */
export const getIntegrationStatus = async (userId: string): Promise<ShopifyIntegration | null> => {
    // Converte userId para brandId (assumindo que são equivalentes temporariamente)
    const brandId = parseInt(userId, 10)
    
    if (isNaN(brandId)) {
        return null
    }

    const status = await ShopifyService.getConnectionStatus(brandId)
    
    if (!status.connected || !status.store) {
        return null
    }

    // Retorna no formato legado
    return {
        id: status.store.id.toString(),
        shop_domain: status.store.name,
        created_at: status.store.created_at
    }
}

export { supabase }
export default ShopifyService

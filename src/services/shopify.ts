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

export const ShopifyService = {
    /**
     * Verifica o status da integração Shopify para uma marca
     * Busca na tabela `stores` por lojas do tipo 'shopify'
     */
    async getConnectionStatus(brandId: number): Promise<ConnectionStatus> {
        // Verifica se Supabase está configurado
        if (!isSupabaseConfigured()) {
            return { connected: false, store: null, productsCount: 0, lastSync: null }
        }

        try {
            // Busca loja Shopify da marca
            const { data: store, error: storeError } = await supabase
                .from('stores')
                .select('id, brand_id, name, external_store_id, created_at')
                .eq('brand_id', brandId)
                .eq('store_type', 'shopify')
                .maybeSingle()

            if (storeError && !isSilentError(storeError.code)) {
                console.error('Erro ao buscar loja Shopify:', storeError)
                return { connected: false, store: null, productsCount: 0, lastSync: null }
            }

            if (!store) {
                return { connected: false, store: null, productsCount: 0, lastSync: null }
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
            return { connected: false, store: null, productsCount: 0, lastSync: null }
        }
    },

    /**
     * Inicia o processo de conexão com uma loja Shopify
     * 
     * Em produção, isso invocaria uma Edge Function para OAuth.
     * Por enquanto, cria o registro da loja para demonstração.
     */
    async connectStore(brandId: number, shopDomain: string): Promise<{ success: boolean; store?: ShopifyStore; error?: string }> {
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

            // Verifica se já existe uma loja conectada
            const { data: existingStore } = await supabase
                .from('stores')
                .select('id')
                .eq('brand_id', brandId)
                .eq('store_type', 'shopify')
                .maybeSingle()

            if (existingStore) {
                return { success: false, error: 'Já existe uma loja Shopify conectada para esta marca' }
            }

            // Tenta invocar Edge Function para OAuth (se existir)
            try {
                const { data, error } = await supabase.functions.invoke('shopify-auth', {
                    body: { 
                        shop: cleanDomain,
                        brand_id: brandId 
                    }
                })

                if (!error && data?.url) {
                    // Redireciona para OAuth do Shopify
                    window.location.href = data.url
                    return { success: true }
                }
            } catch (fnError) {
                console.warn('[ShopifyService] Edge Function não disponível, criando loja diretamente')
            }

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
                console.error('Erro ao criar loja:', insertError)
                return { success: false, error: 'Erro ao conectar loja' }
            }

            return { success: true, store: store as ShopifyStore }
        } catch (error) {
            console.error('Erro ao conectar loja Shopify:', error)
            return { success: false, error: 'Erro inesperado ao conectar loja' }
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

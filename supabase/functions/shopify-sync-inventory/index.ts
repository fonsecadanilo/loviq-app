/**
 * Shopify Inventory Sync Edge Function
 * 
 * Sincronização leve e eficiente de estoque Shopify → Loviq.
 * 
 * Características:
 * - Sync incremental (apenas produtos modificados)
 * - Processamento em batch para eficiência
 * - Suporte a webhooks do Shopify
 * - Rate limiting integrado
 * - Fallback para sync completo quando necessário
 * 
 * Modos de operação:
 * 1. webhook: Recebe webhook de inventory_levels/update do Shopify
 * 2. delta: Sincroniza apenas produtos atualizados desde última sync
 * 3. full: Sincronização completa (usar com moderação)
 * 
 * @author Loviq Platform
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Shopify API version
const SHOPIFY_API_VERSION = '2024-01'

// Configuration
const CONFIG = {
    // Maximum products to process in a single batch
    BATCH_SIZE: 50,
    // Minimum interval between syncs for the same store (in minutes)
    MIN_SYNC_INTERVAL: 5,
    // Maximum age of inventory data before forcing resync (in hours)
    MAX_INVENTORY_AGE: 4,
    // Rate limit: max requests per minute to Shopify API
    RATE_LIMIT_PER_MINUTE: 40,
}

// Types
type SyncMode = 'webhook' | 'delta' | 'full'

interface ShopifyInventoryLevel {
    inventory_item_id: number
    location_id: number
    available: number | null
    updated_at: string
}

interface ShopifyProduct {
    id: number
    title: string
    variants: Array<{
        id: number
        inventory_item_id: number
        inventory_quantity: number
    }>
}

interface SyncResult {
    success: boolean
    mode: SyncMode
    updated: number
    skipped: number
    errors: number
    duration_ms: number
    message?: string
}

// =============================================
// Helper Functions
// =============================================

/**
 * Fetch inventory levels from Shopify with pagination support
 */
async function fetchShopifyInventoryLevels(
    shopDomain: string,
    accessToken: string,
    inventoryItemIds: string[]
): Promise<ShopifyInventoryLevel[]> {
    if (inventoryItemIds.length === 0) return []
    
    // Shopify limits inventory_item_ids to 50 per request
    const chunks = []
    for (let i = 0; i < inventoryItemIds.length; i += 50) {
        chunks.push(inventoryItemIds.slice(i, i + 50))
    }
    
    const allLevels: ShopifyInventoryLevel[] = []
    
    for (const chunk of chunks) {
        const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/inventory_levels.json?inventory_item_ids=${chunk.join(',')}`
        
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
        })
        
        if (!response.ok) {
            console.error(`[inventory-sync] Shopify API error: ${response.status}`)
            continue
        }
        
        const data = await response.json()
        if (data.inventory_levels) {
            allLevels.push(...data.inventory_levels)
        }
        
        // Basic rate limiting - wait 100ms between requests
        if (chunks.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }
    
    return allLevels
}

/**
 * Fetch products with variants from Shopify
 * Optimized to only fetch id and inventory fields
 */
async function fetchShopifyProductsLite(
    shopDomain: string,
    accessToken: string,
    productIds?: string[]
): Promise<ShopifyProduct[]> {
    let url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?fields=id,title,variants&limit=250`
    
    if (productIds && productIds.length > 0) {
        url += `&ids=${productIds.join(',')}`
    }
    
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
    })
    
    if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.products || []
}

/**
 * Check if sync is allowed based on rate limiting
 */
async function canSync(supabase: any, storeId: number): Promise<boolean> {
    const { data: lastSync } = await supabase
        .from('shopify_sync_logs')
        .select('finished_at')
        .eq('store_id', storeId)
        .eq('sync_type', 'inventory')
        .eq('status', 'success')
        .order('finished_at', { ascending: false })
        .limit(1)
        .single()
    
    if (!lastSync?.finished_at) return true
    
    const lastSyncTime = new Date(lastSync.finished_at).getTime()
    const now = Date.now()
    const minInterval = CONFIG.MIN_SYNC_INTERVAL * 60 * 1000
    
    return (now - lastSyncTime) >= minInterval
}

/**
 * Get products that need inventory update
 */
async function getProductsNeedingUpdate(
    supabase: any,
    storeId: number,
    mode: SyncMode
): Promise<Array<{
    product_id: number
    external_product_id: string
    inventory_item_id: string | null
}>> {
    let query = supabase
        .from('products')
        .select(`
            id,
            external_product_id,
            shopify_products!inner(
                inventory_item_id,
                last_inventory_sync_at
            )
        `)
        .eq('store_id', storeId)
        .eq('product_source_type', 'shopify')
        .not('external_product_id', 'is', null)
    
    if (mode === 'delta') {
        // Only get products with stale inventory (older than MAX_INVENTORY_AGE hours)
        const staleTime = new Date()
        staleTime.setHours(staleTime.getHours() - CONFIG.MAX_INVENTORY_AGE)
        
        query = query.or(
            `shopify_products.last_inventory_sync_at.is.null,shopify_products.last_inventory_sync_at.lt.${staleTime.toISOString()}`
        )
    }
    
    const { data, error } = await query.limit(CONFIG.BATCH_SIZE)
    
    if (error) {
        console.error('[inventory-sync] Error fetching products:', error)
        return []
    }
    
    return (data || []).map((p: any) => ({
        product_id: p.id,
        external_product_id: p.external_product_id,
        inventory_item_id: p.shopify_products?.inventory_item_id || null
    }))
}

/**
 * Update inventory in database
 */
async function updateInventory(
    supabase: any,
    productId: number,
    quantity: number
): Promise<boolean> {
    const now = new Date().toISOString()
    
    // Update products table
    const { error: productError } = await supabase
        .from('products')
        .update({
            stock_quantity: quantity,
            updated_at: now
        })
        .eq('id', productId)
    
    if (productError) {
        console.error(`[inventory-sync] Error updating product ${productId}:`, productError)
        return false
    }
    
    // Update shopify_products table
    const { error: shopifyError } = await supabase
        .from('shopify_products')
        .update({
            inventory_quantity: quantity,
            last_inventory_sync_at: now,
            updated_at: now
        })
        .eq('product_id', productId)
    
    if (shopifyError) {
        console.error(`[inventory-sync] Error updating shopify_product for ${productId}:`, shopifyError)
        return false
    }
    
    return true
}

/**
 * Process webhook from Shopify
 */
async function handleWebhook(
    supabase: any,
    shopDomain: string,
    payload: any
): Promise<SyncResult> {
    const startTime = Date.now()
    
    // Find store by domain
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, api_credentials')
        .eq('store_type', 'shopify')
        .filter('api_credentials->shop_domain', 'eq', shopDomain)
        .single()
    
    if (storeError || !store) {
        return {
            success: false,
            mode: 'webhook',
            updated: 0,
            skipped: 0,
            errors: 1,
            duration_ms: Date.now() - startTime,
            message: 'Store not found for webhook domain'
        }
    }
    
    // Handle inventory_levels/update webhook
    if (payload.inventory_item_id && payload.available !== undefined) {
        // Find product by inventory_item_id
        const { data: shopifyProduct } = await supabase
            .from('shopify_products')
            .select('product_id')
            .eq('inventory_item_id', payload.inventory_item_id.toString())
            .single()
        
        if (shopifyProduct) {
            const success = await updateInventory(
                supabase,
                shopifyProduct.product_id,
                payload.available || 0
            )
            
            return {
                success,
                mode: 'webhook',
                updated: success ? 1 : 0,
                skipped: 0,
                errors: success ? 0 : 1,
                duration_ms: Date.now() - startTime
            }
        }
    }
    
    return {
        success: true,
        mode: 'webhook',
        updated: 0,
        skipped: 1,
        errors: 0,
        duration_ms: Date.now() - startTime,
        message: 'Product not found in Loviq'
    }
}

/**
 * Main sync handler
 */
async function syncInventory(
    supabase: any,
    storeId: number,
    mode: SyncMode
): Promise<SyncResult> {
    const startTime = Date.now()
    let updated = 0
    let skipped = 0
    let errors = 0
    
    // Check rate limiting for non-webhook modes
    if (mode !== 'webhook') {
        const allowed = await canSync(supabase, storeId)
        if (!allowed) {
            return {
                success: true,
                mode,
                updated: 0,
                skipped: 0,
                errors: 0,
                duration_ms: Date.now() - startTime,
                message: 'Sync skipped due to rate limiting'
            }
        }
    }
    
    // Get store credentials
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, api_credentials')
        .eq('id', storeId)
        .eq('store_type', 'shopify')
        .single()
    
    if (storeError || !store) {
        return {
            success: false,
            mode,
            updated: 0,
            skipped: 0,
            errors: 1,
            duration_ms: Date.now() - startTime,
            message: 'Store not found'
        }
    }
    
    const credentials = store.api_credentials as {
        access_token?: string
        shop_domain?: string
    }
    
    if (!credentials?.access_token || !credentials?.shop_domain) {
        return {
            success: false,
            mode,
            updated: 0,
            skipped: 0,
            errors: 1,
            duration_ms: Date.now() - startTime,
            message: 'Store credentials not configured'
        }
    }
    
    // Create sync log
    const { data: syncLog } = await supabase
        .from('shopify_sync_logs')
        .insert({
            store_id: storeId,
            sync_type: 'inventory',
            status: 'in_progress',
            started_at: new Date().toISOString()
        })
        .select('id')
        .single()
    
    try {
        // Get products that need updating
        const productsToUpdate = await getProductsNeedingUpdate(supabase, storeId, mode)
        
        if (productsToUpdate.length === 0) {
            // Update sync log
            if (syncLog?.id) {
                await supabase
                    .from('shopify_sync_logs')
                    .update({
                        status: 'success',
                        finished_at: new Date().toISOString(),
                        message: 'No products need inventory update'
                    })
                    .eq('id', syncLog.id)
            }
            
            return {
                success: true,
                mode,
                updated: 0,
                skipped: 0,
                errors: 0,
                duration_ms: Date.now() - startTime,
                message: 'All products up to date'
            }
        }
        
        // Try to use inventory_item_ids if available
        const inventoryItemIds = productsToUpdate
            .map(p => p.inventory_item_id)
            .filter((id): id is string => id !== null)
        
        if (inventoryItemIds.length > 0) {
            // Fast path: Use inventory levels API
            const inventoryLevels = await fetchShopifyInventoryLevels(
                credentials.shop_domain,
                credentials.access_token,
                inventoryItemIds
            )
            
            // Create a map of inventory_item_id to total available
            const inventoryMap = new Map<string, number>()
            for (const level of inventoryLevels) {
                const key = level.inventory_item_id.toString()
                inventoryMap.set(key, (inventoryMap.get(key) || 0) + (level.available || 0))
            }
            
            // Update each product
            for (const product of productsToUpdate) {
                if (product.inventory_item_id && inventoryMap.has(product.inventory_item_id)) {
                    const quantity = inventoryMap.get(product.inventory_item_id) || 0
                    const success = await updateInventory(supabase, product.product_id, quantity)
                    if (success) {
                        updated++
                    } else {
                        errors++
                    }
                } else {
                    skipped++
                }
            }
        } else {
            // Fallback: Fetch full product data
            const productIds = productsToUpdate.map(p => p.external_product_id)
            const shopifyProducts = await fetchShopifyProductsLite(
                credentials.shop_domain,
                credentials.access_token,
                productIds
            )
            
            // Create a map of shopify product id to total inventory
            const inventoryMap = new Map<string, number>()
            for (const product of shopifyProducts) {
                const totalInventory = product.variants.reduce(
                    (sum, v) => sum + (v.inventory_quantity || 0),
                    0
                )
                inventoryMap.set(product.id.toString(), totalInventory)
            }
            
            // Update each product
            for (const product of productsToUpdate) {
                if (inventoryMap.has(product.external_product_id)) {
                    const quantity = inventoryMap.get(product.external_product_id) || 0
                    const success = await updateInventory(supabase, product.product_id, quantity)
                    if (success) {
                        updated++
                    } else {
                        errors++
                    }
                } else {
                    skipped++
                }
            }
        }
        
        // Update sync log
        if (syncLog?.id) {
            await supabase
                .from('shopify_sync_logs')
                .update({
                    status: errors === 0 ? 'success' : 'success',
                    finished_at: new Date().toISOString(),
                    message: `Updated ${updated} products${errors > 0 ? `, ${errors} errors` : ''}`
                })
                .eq('id', syncLog.id)
        }
        
        return {
            success: true,
            mode,
            updated,
            skipped,
            errors,
            duration_ms: Date.now() - startTime
        }
        
    } catch (error) {
        // Update sync log as failed
        if (syncLog?.id) {
            await supabase
                .from('shopify_sync_logs')
                .update({
                    status: 'failed',
                    finished_at: new Date().toISOString(),
                    message: error.message
                })
                .eq('id', syncLog.id)
        }
        
        return {
            success: false,
            mode,
            updated,
            skipped,
            errors: errors + 1,
            duration_ms: Date.now() - startTime,
            message: error.message
        }
    }
}

// =============================================
// Main Handler
// =============================================

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    
    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[inventory-sync] Missing required environment variables')
        return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    try {
        // Check for Shopify webhook headers
        const shopifyTopic = req.headers.get('x-shopify-topic')
        const shopifyDomain = req.headers.get('x-shopify-shop-domain')
        
        // Handle Shopify webhook
        if (shopifyTopic && shopifyDomain) {
            console.log(`[inventory-sync] Webhook received: ${shopifyTopic} from ${shopifyDomain}`)
            
            // Only process inventory-related webhooks
            if (shopifyTopic.includes('inventory')) {
                const payload = await req.json()
                const result = await handleWebhook(supabase, shopifyDomain, payload)
                
                return new Response(
                    JSON.stringify(result),
                    { 
                        status: result.success ? 200 : 500, 
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                    }
                )
            }
            
            // Acknowledge non-inventory webhooks
            return new Response(
                JSON.stringify({ success: true, message: 'Webhook acknowledged' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        
        // Handle manual/scheduled sync request
        const body = await req.json()
        const { store_id, mode = 'delta' } = body
        
        if (!store_id) {
            return new Response(
                JSON.stringify({ error: 'Missing store_id parameter' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        
        const validModes: SyncMode[] = ['delta', 'full']
        const syncMode = validModes.includes(mode) ? mode : 'delta'
        
        console.log(`[inventory-sync] Starting ${syncMode} sync for store ${store_id}`)
        
        const result = await syncInventory(supabase, store_id, syncMode as SyncMode)
        
        console.log(`[inventory-sync] Sync completed:`, result)
        
        return new Response(
            JSON.stringify(result),
            { 
                status: result.success ? 200 : 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        )
        
    } catch (error) {
        console.error('[inventory-sync] Error:', error)
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: 'Sync failed', 
                message: error.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})


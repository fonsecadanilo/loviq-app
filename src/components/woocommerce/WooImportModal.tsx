import React, { useEffect, useState } from 'react'
import { Search, AlertCircle, Loader2, ExternalLink, RefreshCw, Package } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { WooCommerceService } from '../../services/woocommerce'
import { TablesInsert } from '../../types/database'

interface WooImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface WooProduct {
  id: string
  title: string
  image: string | null
  price: string
  sku: string
  inventory: number
  vendor?: string
  product_type?: string
  handle?: string
  already_imported?: boolean
}

export const WooImportModal: React.FC<WooImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<WooProduct[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeId, setStoreId] = useState<number | null>(null)
  const [storeName, setStoreName] = useState<string>('')
  const brandId = 1

  useEffect(() => {
    if (isOpen) {
      loadProducts()
      setSelectedIds(new Set())
      setSearchQuery('')
      setError(null)
    }
  }, [isOpen])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await WooCommerceService.listRemoteProducts({ brand_id: brandId, limit: 100 })
      if (!result.success) throw new Error(result.error || 'Failed to connect to WooCommerce')
      const availableProducts = (result.products || []).filter((p: WooProduct) => !p.already_imported)
      setProducts(availableProducts)
      if (result.store_id) setStoreId(result.store_id)
      if (result.store_name) setStoreName(result.store_name || 'WooCommerce')
    } catch (err) {
      const baseMsg = err instanceof Error ? err.message : 'Failed to load products from WooCommerce'
      setError(`${baseMsg}. Verifique protocolo (http/https), CORS do seu site e credenciais.`)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) setSelectedIds(new Set())
    else {
      const next = new Set<string>()
      filteredProducts.forEach((p) => next.add(p.id))
      setSelectedIds(next)
    }
  }

  const handleImport = async () => {
    if (selectedIds.size === 0) return
    setImporting(true)
    setError(null)
    try {
      const selectedProducts = products.filter((p) => selectedIds.has(p.id))
      if (!storeId) throw new Error('No WooCommerce store connected')
      const productsToInsert: TablesInsert<'products'>[] = selectedProducts.map((p) => ({
        name: p.title,
        description: p.sku ? `SKU: ${p.sku}` : null,
        price: parseFloat(p.price) || 0,
        currency: 'BRL',
        image_url: p.image,
        store_id: storeId,
        product_source_type: 'manual' as const,
        external_product_id: p.id,
      }))
      const { error: insertError } = await supabase.from('products').insert(productsToInsert)
      if (insertError) throw new Error(insertError.message || 'Failed to save products to database.')
      onImportComplete()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import products. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const filteredProducts = products.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Products from WooCommerce" description="Select products to sync with your Loviq catalog." maxWidth="max-w-3xl">
      <div className="p-6 space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input type="text" placeholder="Search by name or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all" />
        </div>
        {storeName && !loading && (
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              <span>Connected to <strong className="text-slate-700">{storeName}</strong></span>
            </div>
            <button onClick={loadProducts} disabled={loading} className="flex items-center gap-1 text-purple-600 hover:text-purple-700">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center p-6 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No products available to import
              </div>
            ) : (
              filteredProducts.map((product) => (
                <label key={product.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelection(product.id)} className="rounded" />
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-10 h-10 rounded-md object-cover border border-slate-100 bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{product.title}</span>
                  </div>
                  <span className="ml-auto text-xs text-slate-500">R$ {product.price}</span>
                </label>
              ))
            )}
          </div>
          {filteredProducts.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {selectedIds.size} selected
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleAll} className="text-xs font-medium text-slate-600 hover:text-slate-900">Select All</button>
                <button onClick={() => setSelectedIds(new Set())} className="text-xs font-medium text-slate-600 hover:text-slate-900">Clear</button>
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ExternalLink className="w-3.5 h-3.5" />
            Import will create products in your catalog
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={importing}>Cancel</Button>
            <Button onClick={handleImport} disabled={importing || selectedIds.size === 0}>
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import Selected'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WooImportModal

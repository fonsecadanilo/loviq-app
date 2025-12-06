import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, Loader2, ShoppingBag, ExternalLink, RefreshCw, Package } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface ShopifyImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

interface ShopifyProduct {
    id: string;
    title: string;
    image: string | null;
    price: string;
    sku: string;
    inventory: number;
    vendor?: string;
    product_type?: string;
    handle?: string;
    already_imported?: boolean;
}

export const ShopifyImportModal: React.FC<ShopifyImportModalProps> = ({
    isOpen,
    onClose,
    onImportComplete
}) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [storeId, setStoreId] = useState<number | null>(null);
    const [storeName, setStoreName] = useState<string>('');

    // TODO: Em produção, obter do contexto de autenticação
    const brandId = 1;

    // Load products when modal opens
    useEffect(() => {
        if (isOpen) {
            loadShopifyProducts();
            setSelectedIds(new Set());
            setSearchQuery('');
            setError(null);
        }
    }, [isOpen]);

    const loadShopifyProducts = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Call Edge Function to fetch products from Shopify
            const { data, error: fnError } = await supabase.functions.invoke('shopify-list-products', {
                body: { brand_id: brandId, limit: 100 }
            });

            if (fnError) {
                console.error('[ShopifyImportModal] Edge function error:', fnError);
                throw new Error(fnError.message || 'Failed to connect to Shopify');
            }

            if (data?.error) {
                throw new Error(data.message || data.error);
            }

            if (data?.products) {
                // Filter out already imported products for the main list, but keep track of them
                const availableProducts = data.products.filter((p: ShopifyProduct) => !p.already_imported);
                setProducts(availableProducts);
                setStoreId(data.store_id);
                setStoreName(data.store_name || 'Shopify');
                console.log('[ShopifyImportModal] Loaded', availableProducts.length, 'available products from', data.store_name);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error('[ShopifyImportModal] Error loading products:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products from Shopify');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            const newSelected = new Set<string>();
            filteredProducts.forEach(p => newSelected.add(p.id));
            setSelectedIds(newSelected);
        }
    };

    const handleImport = async () => {
        if (selectedIds.size === 0) return;

        setImporting(true);
        setError(null);

        try {
            // Get selected products details
            const selectedProducts = products.filter(p => selectedIds.has(p.id));
            
            if (!storeId) {
                throw new Error('No Shopify store connected');
            }

            // Insert into Supabase
            const productsToInsert = selectedProducts.map(p => ({
                name: p.title,
                description: p.sku ? `SKU: ${p.sku}` : null,
                price: parseFloat(p.price) || 0,
                currency: 'BRL',
                image_url: p.image,
                store_id: storeId,
                product_source_type: 'shopify' as const,
                external_product_id: p.id
            }));

            console.log('[ShopifyImportModal] Importing', productsToInsert.length, 'products');
            
            const { error: insertError } = await supabase
                .from('products')
                .insert(productsToInsert);

            if (insertError) {
                console.error('[ShopifyImportModal] Error importing products:', insertError);
                throw new Error(insertError.message || 'Failed to save products to database.');
            }

            console.log('[ShopifyImportModal] Import successful!');
            
            // Success
            onImportComplete();
            onClose();
        } catch (err) {
            console.error('[ShopifyImportModal] Import error:', err);
            setError(err instanceof Error ? err.message : 'Failed to import products. Please try again.');
        } finally {
            setImporting(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Products from Shopify"
            description="Select products to sync with your Loviq catalog."
            maxWidth="max-w-3xl"
        >
            <div className="p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all"
                    />
                </div>

                {/* Store Info */}
                {storeName && !loading && (
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" />
                            <span>Connected to <strong className="text-slate-700">{storeName}</strong></span>
                        </div>
                        <button
                            onClick={loadShopifyProducts}
                            disabled={loading}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1">{error}</div>
                        <button
                            onClick={loadShopifyProducts}
                            className="text-red-700 hover:text-red-800 underline text-xs"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Products List */}
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Loading products from Shopify...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="w-10 px-4 py-3 border-b border-slate-200">
                                        <input 
                                            type="checkbox" 
                                            checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                                            onChange={toggleAll}
                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Product</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Price</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Inventory</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">SKU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr 
                                            key={product.id} 
                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedIds.has(product.id) ? 'bg-purple-50/30' : ''}`}
                                            onClick={() => toggleSelection(product.id)}
                                        >
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedIds.has(product.id)}
                                                    onChange={() => toggleSelection(product.id)}
                                                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {product.image ? (
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.title} 
                                                            className="w-10 h-10 rounded-md object-cover border border-slate-100 bg-white"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                                                        {product.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                R$ {product.price}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    product.inventory > 0 
                                                    ? 'bg-green-50 text-green-700' 
                                                    : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {product.inventory} in stock
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {product.sku}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                                                <p className="text-slate-600 font-medium">All products imported!</p>
                                                <p className="text-slate-400 text-sm">
                                                    {searchQuery 
                                                        ? 'No products match your search.' 
                                                        : 'All available products from your Shopify store have been imported.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-slate-500">
                        {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            disabled={importing}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleImport}
                            disabled={selectedIds.size === 0 || importing}
                            className="min-w-[120px]"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Import Products
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


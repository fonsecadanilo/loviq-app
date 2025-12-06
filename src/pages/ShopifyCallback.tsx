import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShoppingBag,
  ArrowRight,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ShopifyProduct {
  id: string;
  title: string;
  image: string | null;
  price: string;
  sku: string;
  inventory: number;
  vendor: string;
  product_type: string;
  handle: string;
  already_imported: boolean;
  // Inventory tracking fields
  variant_id: string | null;
  inventory_item_id: string | null;
  inventory_tracked: boolean;
  inventory_policy: string;
}

type FlowStep = 'loading' | 'exchanging' | 'select_products' | 'importing' | 'success' | 'error';

export const ShopifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Ref to prevent duplicate API calls in StrictMode
  const hasCalledExchange = useRef(false);

  // Flow state
  const [step, setStep] = useState<FlowStep>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Store data
  const [storeId, setStoreId] = useState<number | null>(null);
  const [storeName, setStoreName] = useState<string>('');

  // Products state
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [importedCount, setImportedCount] = useState(0);

  // Get params from URL
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');

  // Check authentication and redirect to login if not authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not authenticated, save current URL and redirect to login
    if (!isAuthenticated) {
      // Save the full callback URL to sessionStorage so we can return after login
      const callbackUrl = window.location.href;
      sessionStorage.setItem('shopify_callback_url', callbackUrl);
      
      // Redirect to login
      navigate('/login', { 
        state: { from: { pathname: '/shopify/callback', search: window.location.search } },
        replace: true 
      });
      return;
    }

    // User is authenticated, proceed with OAuth callback
    if (hasCalledExchange.current) return;
    
    if (code && shop) {
      hasCalledExchange.current = true;
      handleOAuthCallback();
    } else {
      // Check if we already have an error from a previous redirect
      const error = searchParams.get('error');
      if (error) {
        setStep('error');
        setErrorMessage(error);
        setErrorDetails(searchParams.get('details') || '');
      } else {
        setStep('error');
        setErrorMessage('Missing parameters');
        setErrorDetails('The callback URL is missing required parameters (code or shop).');
      }
    }
  }, [authLoading, isAuthenticated]);

  const handleOAuthCallback = async () => {
    setStep('exchanging');

    try {
      // Call the shopify-callback Edge Function to exchange code for token
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-callback-exchange`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, shop, state }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        // If exchange failed, try to check if store already exists
        // This can happen if the OAuth code was already used (e.g., page refresh)
        console.warn('Token exchange failed, checking for existing store...');
        const existingStore = await tryGetExistingStore();
        
        if (existingStore) {
          setStoreId(existingStore.id);
          setStoreName(existingStore.name || shop || '');
          await fetchShopifyProducts(existingStore.id);
          return;
        }
        
        throw new Error(data.error || data.message || 'Failed to connect to Shopify');
      }

      // Store the store info
      setStoreId(data.store_id);
      setStoreName(data.shop_domain || shop || '');

      // Fetch products from Shopify
      await fetchShopifyProducts(data.store_id);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStep('error');
      setErrorMessage('Connection failed');
      setErrorDetails(error instanceof Error ? error.message : 'Could not complete Shopify connection');
    }
  };

  // Try to get existing store if token exchange fails
  const tryGetExistingStore = async (): Promise<{ id: number; name: string } | null> => {
    try {
      // Parse state to get brand_id
      let brandId = 1;
      if (state) {
        try {
          const stateData = JSON.parse(state);
          brandId = stateData.brand_id || 1;
        } catch {
          // Use default
        }
      }

      const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('brand_id', brandId)
        .eq('store_type', 'shopify')
        .single();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  };

  const fetchShopifyProducts = async (currentStoreId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-list-products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ store_id: currentStoreId }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products || []);
      
      // Pre-select all products that are not already imported
      const notImported = (data.products || [])
        .filter((p: ShopifyProduct) => !p.already_imported)
        .map((p: ShopifyProduct) => p.id);
      setSelectedProducts(new Set(notImported));
      
      setStep('select_products');

    } catch (error) {
      console.error('Error fetching products:', error);
      setStep('error');
      setErrorMessage('Could not load products');
      setErrorDetails(error instanceof Error ? error.message : 'Failed to fetch products from Shopify');
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = products.filter(p => !p.already_imported).map(p => p.id);
    setSelectedProducts(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  const handleImportProducts = async () => {
    if (selectedProducts.size === 0 || !storeId) return;

    setStep('importing');

    try {
      // Get the selected products data
      const productsToImport = products.filter(p => selectedProducts.has(p.id));
      
      // Import each product
      let imported = 0;
      for (const product of productsToImport) {
        // 1. Insert into products table
        const { data: insertedProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name: product.title,
            description: null,
            price: parseFloat(product.price || '0'),
            image_url: product.image || null,
            external_product_id: product.id,
            product_source_type: 'shopify',
            store_id: storeId,
            stock_quantity: product.inventory || 0,
          })
          .select('id')
          .single();

        if (productError) {
          console.error('Error inserting product:', productError);
          continue;
        }

        // 2. Insert into shopify_products table with inventory_item_id
        if (insertedProduct?.id) {
          const { error: shopifyProductError } = await supabase
            .from('shopify_products')
            .insert({
              product_id: insertedProduct.id,
              shopify_variant_id: product.variant_id,
              inventory_item_id: product.inventory_item_id,
              inventory_quantity: product.inventory || 0,
              inventory_tracked: product.inventory_tracked ?? true,
              inventory_policy: product.inventory_policy || 'deny',
              last_sync_at: new Date().toISOString(),
              last_inventory_sync_at: new Date().toISOString(),
            });

          if (shopifyProductError) {
            console.error('Error inserting shopify_product:', shopifyProductError);
            // Continue anyway - product was already created
          }

          imported++;
        }
      }

      setImportedCount(imported);
      setStep('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/store-integration?tab=integrations&shopify=connected');
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setStep('error');
      setErrorMessage('Import failed');
      setErrorDetails(error instanceof Error ? error.message : 'Failed to import products');
    }
  };

  const handleSkipImport = () => {
    setStep('success');
    setImportedCount(0);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/store-integration?tab=integrations&shopify=connected');
    }, 2000);
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Loading / Exchanging Step
  if (step === 'loading' || step === 'exchanging') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {step === 'loading' ? 'Connecting to Shopify...' : 'Exchanging credentials...'}
          </h1>
          <p className="text-slate-500 text-sm">
            Please wait while we securely connect your store.
          </p>
        </motion.div>
      </div>
    );
  }

  // Error Step
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{errorMessage}</h1>
          <p className="text-slate-500 text-sm mb-6">{errorDetails}</p>
          <button
            onClick={() => navigate('/store-integration?tab=integrations')}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Back to Integrations
          </button>
        </motion.div>
      </div>
    );
  }

  // Importing Step
  if (step === 'importing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Importing Products...</h1>
          <p className="text-slate-500 text-sm">
            Importing {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} to your catalog.
          </p>
        </motion.div>
      </div>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {importedCount > 0 ? 'Products Imported!' : 'Store Connected!'}
          </h1>
          <p className="text-slate-500 text-sm mb-2">
            {importedCount > 0 
              ? `${importedCount} product${importedCount !== 1 ? 's' : ''} have been added to your catalog.`
              : 'Your Shopify store has been connected successfully.'
            }
          </p>
          <p className="text-slate-400 text-xs">
            Redirecting to Integrations...
          </p>
          
          {/* Progress bar */}
          <div className="mt-6 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "linear" }}
              className="h-full bg-green-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Select Products Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Store connected: {storeName}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Products to Import</h1>
          <p className="text-slate-500">
            Choose which products you want to add to your Loviq catalog.
          </p>
        </motion.div>

        {/* Products Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{selectedProducts.size}</span> of {products.filter(p => !p.already_imported).length} selected
              </span>
              <div className="h-4 w-px bg-slate-200" />
              <button 
                onClick={selectAll}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Select all
              </button>
              <button 
                onClick={deselectAll}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Deselect all
              </button>
            </div>
            <div className="text-xs text-slate-400">
              {products.filter(p => p.already_imported).length} already imported
            </div>
          </div>

          {/* Products List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            <AnimatePresence>
              {products.map((product, index) => {
                const isSelected = selectedProducts.has(product.id);
                const alreadyImported = product.already_imported;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 flex items-center gap-4 transition-colors ${
                      alreadyImported 
                        ? 'bg-slate-50/50 opacity-60' 
                        : isSelected 
                          ? 'bg-violet-50/50' 
                          : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => !alreadyImported && toggleProduct(product.id)}
                      disabled={alreadyImported}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        alreadyImported
                          ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                          : isSelected
                            ? 'border-violet-600 bg-violet-600'
                            : 'border-slate-300 hover:border-violet-400'
                      }`}
                    >
                      {(isSelected || alreadyImported) && (
                        <Check className={`w-3 h-3 ${alreadyImported ? 'text-slate-400' : 'text-white'}`} />
                      )}
                    </button>

                    {/* Image */}
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        <ShoppingBag className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 truncate">{product.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-semibold text-slate-700">
                          {formatPrice(product.price || '0')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.inventory === 0 
                            ? 'bg-red-50 text-red-600' 
                            : product.inventory <= 10
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-green-50 text-green-600'
                        }`}>
                          {product.inventory === 0 
                            ? 'Out of stock' 
                            : `${product.inventory} in stock`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    {alreadyImported && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        Already imported
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {products.length === 0 && (
              <div className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No products found in your Shopify store.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              onClick={handleSkipImport}
              className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleImportProducts}
              disabled={selectedProducts.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopifyCallback;


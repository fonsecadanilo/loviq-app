import React, { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, Truck, DollarSign, X } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { ShopifyService, ShopifyNormalizedShippingRate, ShopifyNormalizedShippingZone } from '../../services/shopify';
import { ShippingMethod } from './ShippingMethodSheet';

interface ShopifyImportShippingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: number | null;
  onImport: (methods: ShippingMethod[]) => void;
  existingMethodNames: string[]; // To check for duplicates
}

export const ShopifyImportShippingSheet: React.FC<ShopifyImportShippingSheetProps> = ({
  isOpen,
  onClose,
  storeId,
  onImport,
  existingMethodNames,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopifyRates, setShopifyRates] = useState<ShopifyNormalizedShippingRate[]>([]);
  const [selectedRateIds, setSelectedRateIds] = useState<Set<number>>(new Set());

  // Fetch rates when sheet opens
  useEffect(() => {
    if (isOpen && storeId) {
      fetchRates();
    } else {
      // Reset state when closed
      setShopifyRates([]);
      setSelectedRateIds(new Set());
      setError(null);
    }
  }, [isOpen, storeId]);

  const fetchRates = async () => {
    console.log('[ShopifyImportShippingSheet] fetchRates called with storeId:', storeId);
    
    if (!storeId) {
      console.log('[ShopifyImportShippingSheet] No storeId provided');
      setError('No Shopify store connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[ShopifyImportShippingSheet] Calling ShopifyService.fetchShippingData...');
      const data = await ShopifyService.fetchShippingData(storeId);
      console.log('[ShopifyImportShippingSheet] Response:', data);
      
      if (!data.success) {
        console.error('[ShopifyImportShippingSheet] Fetch failed:', data.error);
        setError(data.error || 'Failed to fetch shipping data');
        return;
      }

      // Collect all unique rates from all zones
      const allRates: ShopifyNormalizedShippingRate[] = [];
      const seenIds = new Set<number>();
      
      for (const zone of data.shipping_zones) {
        for (const rate of zone.rates) {
          if (!seenIds.has(rate.id)) {
            seenIds.add(rate.id);
            allRates.push(rate);
          }
        }
      }

      setShopifyRates(allRates);
      
      if (allRates.length === 0) {
        setError('No shipping rates found in your Shopify store');
      }
    } catch (err) {
      console.error('Error fetching Shopify rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRate = (rateId: number) => {
    setSelectedRateIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rateId)) {
        newSet.delete(rateId);
      } else {
        newSet.add(rateId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRateIds.size === shopifyRates.length) {
      setSelectedRateIds(new Set());
    } else {
      setSelectedRateIds(new Set(shopifyRates.map(r => r.id)));
    }
  };

  const handleImport = () => {
    const selectedRates = shopifyRates.filter(r => selectedRateIds.has(r.id));
    
    // Convert to ShippingMethod format
    const methods: ShippingMethod[] = selectedRates.map(rate => ({
      id: `shopify-${rate.id}-${Date.now()}`, // Unique ID
      name: rate.name,
      price: rate.price.toFixed(2),
      duration: rate.type === 'carrier' ? '3-7' : '5-10', // Default estimate
      regionIds: ['united-states'], // Default to all regions
    }));

    onImport(methods);
    onClose();
  };

  const getRateTypeLabel = (type: string) => {
    switch (type) {
      case 'flat': return 'Flat rate';
      case 'weight_based': return 'Weight-based';
      case 'price_based': return 'Price-based';
      case 'carrier': return 'Carrier calculated';
      default: return type;
    }
  };

  const isAlreadyImported = (rateName: string) => {
    return existingMethodNames.some(name => 
      name.toLowerCase() === rateName.toLowerCase()
    );
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-[480px]"
      title="Import from Shopify"
    >
      <div className="flex flex-col h-full">
        {/* Header Info */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#96bf48]/10 flex items-center justify-center">
              <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Shopify Shipping Rates</p>
              <p className="text-xs text-slate-500">Select rates to import into Loviq</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!storeId ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="w-8 h-8 opacity-50 grayscale" />
              </div>
              <h4 className="text-base font-medium text-slate-800 mb-2">No Shopify Store Connected</h4>
              <p className="text-sm text-slate-500 text-center max-w-xs mb-4">
                Connect your Shopify store first to import shipping methods.
              </p>
              <p className="text-xs text-slate-400 text-center">
                Go to <span className="font-medium">Integrations</span> tab to connect your store.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
              <p className="text-sm text-slate-500">Loading shipping rates...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center mb-3">{error}</p>
              <button
                onClick={fetchRates}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Try Again
              </button>
            </div>
          ) : shopifyRates.length > 0 ? (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  {selectedRateIds.size} of {shopifyRates.length} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  {selectedRateIds.size === shopifyRates.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Rates List */}
              <div className="space-y-2">
                {shopifyRates.map(rate => {
                  const isSelected = selectedRateIds.has(rate.id);
                  const alreadyExists = isAlreadyImported(rate.name);
                  
                  return (
                    <button
                      key={rate.id}
                      onClick={() => !alreadyExists && handleToggleRate(rate.id)}
                      disabled={alreadyExists}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                        alreadyExists
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        alreadyExists
                          ? 'border-slate-300 bg-slate-100'
                          : isSelected
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-slate-300'
                      }`}>
                        {isSelected && !alreadyExists && <Check className="w-3 h-3 text-white" />}
                        {alreadyExists && <X className="w-3 h-3 text-slate-400" />}
                      </div>

                      {/* Rate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{rate.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{getRateTypeLabel(rate.type)}</span>
                          {alreadyExists && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Already exists
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1 text-slate-700 font-semibold flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        {rate.price.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 text-center">No shipping rates found</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={selectedRateIds.size === 0 || isLoading}
            className="px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
          >
            <Check className="w-4 h-4" />
            Import {selectedRateIds.size > 0 ? `(${selectedRateIds.size})` : ''}
          </button>
        </div>
      </div>
    </Sheet>
  );
};


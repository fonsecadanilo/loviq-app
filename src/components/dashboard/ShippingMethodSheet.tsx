import React, { useState, useEffect } from 'react';
import { Truck, DollarSign, Clock, Check, Globe, X } from 'lucide-react';
import { Sheet } from '../ui/Sheet';

export interface DeliveryRegion {
  id: string;
  name: string;
  fullName: string;
}

export interface ShippingMethod {
  id: number | string;
  name: string;
  price: string;
  duration: string;
  regionIds: string[]; // IDs of regions this method applies to
}

interface ShippingMethodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  method?: ShippingMethod | null;
  onSave: (method: ShippingMethod) => void;
  availableRegions: DeliveryRegion[]; // Available delivery regions to select from
}

export const ShippingMethodSheet: React.FC<ShippingMethodSheetProps> = ({
  isOpen,
  onClose,
  method,
  onSave,
  availableRegions,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);

  // Reset or populate form when opening
  useEffect(() => {
    if (isOpen) {
      if (method) {
        setName(method.name);
        setPrice(method.price);
        setDuration(method.duration);
        setSelectedRegionIds(method.regionIds || []);
      } else {
        setName('');
        setPrice('');
        setDuration('');
        // Default: select all available regions
        setSelectedRegionIds(availableRegions.map(r => r.id));
      }
    }
  }, [isOpen, method, availableRegions]);

  const handleRegionToggle = (regionId: string) => {
    setSelectedRegionIds(prev => 
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const handleSelectAllRegions = () => {
    if (selectedRegionIds.length === availableRegions.length) {
      setSelectedRegionIds([]);
    } else {
      setSelectedRegionIds(availableRegions.map(r => r.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRegionIds.length === 0) {
      return; // Require at least one region
    }
    onSave({
      id: method?.id || Date.now(), // Generate ID for new, keep for edit
      name,
      price,
      duration,
      regionIds: selectedRegionIds,
    });
    onClose();
  };

  // Get display name for a region
  const getRegionDisplayName = (region: DeliveryRegion) => {
    return region.id === 'united-states' ? region.name : region.fullName;
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-[500px]"
      title={method ? 'Edit Shipping Method' : 'Add Shipping Method'}
    >
      <div className="flex flex-col h-full">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {/* Method Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                Method Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Standard Shipping, Express"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="text"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    // Mask: only numbers and one decimal point, max 2 decimal places
                    const value = e.target.value;
                    const cleaned = value.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) return; // Don't allow multiple dots
                    if (parts[1] && parts[1].length > 2) return; // Max 2 decimal places
                    setPrice(cleaned);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Estimated Duration (days)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Min"
                    value={duration.split('-')[0] || ''}
                    onChange={(e) => {
                      const minDays = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                      const maxDays = duration.split('-')[1] || '';
                      setDuration(maxDays ? `${minDays}-${maxDays}` : minDays);
                    }}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">days</span>
                </div>
                <span className="text-slate-400 font-medium">to</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Max"
                    value={duration.split('-')[1] || ''}
                    onChange={(e) => {
                      const minDays = duration.split('-')[0] || '';
                      const maxDays = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                      setDuration(minDays ? `${minDays}-${maxDays}` : maxDays);
                    }}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">days</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">Enter minimum and maximum delivery days (e.g., 3 to 5)</p>
            </div>

            {/* Delivery Regions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Delivery Regions
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllRegions}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {selectedRegionIds.length === availableRegions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {availableRegions.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No delivery regions configured. Add regions in Store Settings first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableRegions.map(region => {
                    const isSelected = selectedRegionIds.includes(region.id);
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => handleRegionToggle(region.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-all ${
                          isSelected
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        {getRegionDisplayName(region)}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {selectedRegionIds.length === 0 && availableRegions.length > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                  Select at least one region for this shipping method
                </p>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div className="mt-8 p-4 bg-slate-50 rounded-md border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Preview</h4>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900">{name || 'Method Name'}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {duration ? `${duration} business days` : 'Duration'}
                  </p>
                </div>
                <span className="font-semibold text-slate-900">${price || '0.00'}</span>
              </div>
              {selectedRegionIds.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1.5">Available in:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegionIds.slice(0, 3).map(regionId => {
                      const region = availableRegions.find(r => r.id === regionId);
                      if (!region) return null;
                      return (
                        <span key={regionId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                          <Globe className="w-3 h-3" />
                          {getRegionDisplayName(region)}
                        </span>
                      );
                    })}
                    {selectedRegionIds.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                        +{selectedRegionIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

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
            onClick={handleSubmit}
            disabled={selectedRegionIds.length === 0 || !name || !price || !duration}
            className="px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
          >
            <Check className="w-4 h-4" />
            {method ? 'Save Changes' : 'Add Method'}
          </button>
        </div>
      </div>
    </Sheet>
  );
};



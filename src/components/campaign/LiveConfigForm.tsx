import React from 'react';
import { Calendar, MapPin, Clock, Package, Video, User, Globe, Type } from 'lucide-react';
import type { Step2LiveConfig, ContentFormat, AgeRange, USRegion, Platform, LiveDuration, MockProduct } from '../../lib/campaigns/types';
import {
    getContentFormats,
    getAgeRanges,
    getUSRegions,
    getPlatforms,
    getLiveDurations,
    getMockProducts,
    formatLiveDuration,
} from '../../lib/campaigns/step2Utils';

interface LiveConfigFormProps {
    liveIndex: number;
    config: Step2LiveConfig;
    onChange: (config: Step2LiveConfig) => void;
}

export const LiveConfigForm: React.FC<LiveConfigFormProps> = ({ liveIndex, config, onChange }) => {
    const contentFormats = getContentFormats();
    const ageRanges = getAgeRanges();
    const usRegions = getUSRegions();
    const platforms = getPlatforms();
    const durations = getLiveDurations();
    const products = getMockProducts();

    const updateConfig = (updates: Partial<Step2LiveConfig>) => {
        onChange({ ...config, ...updates });
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Configure Live {liveIndex}</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the details for this live stream</p>
            </div>

            {/* Live Title */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Type className="w-4 h-4" />
                    Live Title
                </label>
                <input
                    type="text"
                    value={config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Enter live title"
                />
            </div>

            {/* Content Format */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Video className="w-4 h-4" />
                    Content Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {contentFormats.map((format) => (
                        <button
                            key={format}
                            onClick={() => updateConfig({ contentFormat: format })}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${config.contentFormat === format
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                                }`}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </div>

            {/* Creator Age Range */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    Creator Age Range
                </label>
                <select
                    value={config.creatorAgeRange || ''}
                    onChange={(e) => updateConfig({ creatorAgeRange: e.target.value as AgeRange || null })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                >
                    <option value="">Select age range</option>
                    {ageRanges.map((range) => (
                        <option key={range} value={range}>
                            {range}
                        </option>
                    ))}
                </select>
            </div>

            {/* Focus on Local Creators */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="w-4 h-4" />
                        Focus on Local Creators
                    </label>
                    <button
                        onClick={() => updateConfig({ focusLocal: !config.focusLocal, region: !config.focusLocal ? config.region : null })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.focusLocal ? 'bg-purple-500' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.focusLocal ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {config.focusLocal && (
                    <select
                        value={config.region || ''}
                        onChange={(e) => updateConfig({ region: e.target.value as USRegion || null })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                    >
                        <option value="">Select US region</option>
                        {usRegions.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Platform Preference */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4" />
                    Platform Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => (
                        <button
                            key={platform}
                            onClick={() => updateConfig({ platformPreference: platform })}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${config.platformPreference === platform
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                                }`}
                        >
                            {platform}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4" />
                    Select Product
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => updateConfig({ selectedProduct: product })}
                            className={`p-3 rounded-lg border text-left transition-all ${config.selectedProduct?.id === product.id
                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                                }`}
                        >
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-24 object-cover rounded-md mb-2"
                            />
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                            <p className="text-sm text-purple-600 font-semibold mt-1">${product.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Live Duration */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4" />
                    Average Expected Live Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {durations.map((duration) => (
                        <button
                            key={duration}
                            onClick={() => updateConfig({ liveDuration: duration })}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${config.liveDuration === duration
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                                }`}
                        >
                            {formatLiveDuration(duration)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Define Live Date */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4" />
                        Define Live Date
                    </label>
                    <button
                        onClick={() => updateConfig({ defineDate: !config.defineDate, preferredDate: !config.defineDate ? config.preferredDate : null })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.defineDate ? 'bg-purple-500' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.defineDate ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {config.defineDate && (
                    <input
                        type="date"
                        value={config.preferredDate || ''}
                        onChange={(e) => updateConfig({ preferredDate: e.target.value || null })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                )}
            </div>
        </div>
    );
};

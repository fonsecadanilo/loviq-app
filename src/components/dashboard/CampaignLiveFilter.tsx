import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check, Filter } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
}

interface Live {
    id: string;
    name: string;
    campaignId: string;
    influencerImage: string;
}

interface CampaignLiveFilterProps {
    campaigns: Campaign[];
    lives: Live[];
    selectedCampaigns: string[]; // Names
    selectedLives: string[]; // Names
    onCampaignChange: (campaigns: string[]) => void;
    onLiveChange: (lives: string[]) => void;
}

export const CampaignLiveFilter: React.FC<CampaignLiveFilterProps> = ({
    campaigns,
    lives,
    selectedCampaigns,
    selectedLives,
    onCampaignChange,
    onLiveChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter logic
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [campaigns, searchQuery]);

    const filteredLives = useMemo(() => {
        return lives.filter(l => {
            const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCampaign = selectedCampaigns.length === 0 || selectedCampaigns.some(cName => {
                const campaign = campaigns.find(c => c.name === cName);
                return campaign?.id === l.campaignId;
            });
            return matchesSearch && matchesCampaign;
        });
    }, [lives, searchQuery, selectedCampaigns, campaigns]);

    const toggleCampaign = (name: string) => {
        const newSelection = selectedCampaigns.includes(name)
            ? selectedCampaigns.filter(c => c !== name)
            : [...selectedCampaigns, name];
        onCampaignChange(newSelection);
    };

    const toggleLive = (name: string) => {
        const newSelection = selectedLives.includes(name)
            ? selectedLives.filter(l => l !== name)
            : [...selectedLives, name];
        onLiveChange(newSelection);
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCampaignChange([]);
        onLiveChange([]);
        setSearchQuery('');
    };

    const totalFilters = selectedCampaigns.length + selectedLives.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-[44px] items-center gap-2 rounded-md px-4 border transition-colors min-w-[240px] justify-between ${
                    isOpen || totalFilters > 0 
                        ? 'bg-white border-[#7D2AE8] ring-1 ring-[#7D2AE8]/20' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Filter className={`w-4 h-4 ${totalFilters > 0 ? 'text-[#7D2AE8]' : 'text-gray-400'}`} />
                    <span className={`text-sm truncate ${totalFilters > 0 ? 'text-[#7D2AE8] font-medium' : 'text-gray-600'}`}>
                        {totalFilters > 0 
                            ? `${selectedCampaigns.length} Campaigns, ${selectedLives.length} Lives` 
                            : 'Filter Campaign & Live'}
                    </span>
                </div>
                
                <div className="flex items-center gap-1">
                    {totalFilters > 0 && (
                        <div
                            role="button"
                            onClick={clearAll}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-[360px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-[500px]">
                    {/* Search Header */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search campaigns or lives..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#7D2AE8] focus:ring-1 focus:ring-[#7D2AE8]"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-4">
                        {/* Campaigns Section */}
                        <div>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Campaigns</span>
                                {selectedCampaigns.length > 0 && (
                                    <span className="bg-[#7D2AE8]/10 text-[#7D2AE8] px-1.5 py-0.5 rounded text-[10px]">
                                        {selectedCampaigns.length} selected
                                    </span>
                                )}
                            </div>
                            <div className="space-y-0.5">
                                {filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => (
                                    <button
                                        key={campaign.id}
                                        onClick={() => toggleCampaign(campaign.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                            selectedCampaigns.includes(campaign.name)
                                                ? 'bg-[#7D2AE8]/5 text-[#7D2AE8] font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="truncate">{campaign.name}</span>
                                        {selectedCampaigns.includes(campaign.name) && (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                )) : (
                                    <div className="px-3 py-2 text-sm text-gray-400 italic">No campaigns found</div>
                                )}
                            </div>
                        </div>

                        {/* Lives Section */}
                        <div>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                                <span>Lives</span>
                                {selectedLives.length > 0 && (
                                    <span className="bg-[#7D2AE8]/10 text-[#7D2AE8] px-1.5 py-0.5 rounded text-[10px]">
                                        {selectedLives.length} selected
                                    </span>
                                )}
                            </div>
                            <div className="space-y-0.5">
                                {filteredLives.length > 0 ? filteredLives.map(live => (
                                    <button
                                        key={live.id}
                                        onClick={() => toggleLive(live.name)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors group ${
                                            selectedLives.includes(live.name)
                                                ? 'bg-[#7D2AE8]/5 text-[#7D2AE8] font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <img 
                                            src={live.influencerImage} 
                                            alt="" 
                                            className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                        />
                                        <div className="flex-1 text-left truncate">
                                            <div className="truncate">{live.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate">
                                                {campaigns.find(c => c.id === live.campaignId)?.name}
                                            </div>
                                        </div>
                                        {selectedLives.includes(live.name) && (
                                            <Check className="w-4 h-4 flex-shrink-0" />
                                        )}
                                    </button>
                                )) : (
                                    <div className="px-3 py-2 text-sm text-gray-400 italic">
                                        {selectedCampaigns.length > 0 
                                            ? 'No lives found for selected campaigns' 
                                            : 'No lives found'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    {(selectedCampaigns.length > 0 || selectedLives.length > 0) && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between items-center">
                            <span className="text-xs text-gray-500 px-2">
                                {totalFilters} filters active
                            </span>
                            <button
                                onClick={(e) => clearAll(e)}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-200 rounded transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


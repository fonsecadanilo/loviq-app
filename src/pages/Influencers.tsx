import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Search, ArrowUp, Instagram, Youtube, Twitter, ExternalLink, UserPlus, ChevronDown, X, Check, Menu } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { parseInfluencerSearch, searchParamsToTags } from '../lib/influencers/search';
import type { SearchParams, SearchTag } from '../lib/influencers/types';
import { useSidebar } from '../contexts/SidebarContext';

// ... (keep interfaces and mock data)
interface Influencer {
    id: string;
    name: string;
    username: string;
    image: string;
    category: 'Micro' | 'Mid' | 'Top';
    followers: string;
    platforms: ('instagram' | 'youtube' | 'tiktok' | 'twitter')[];
    totalSales: string;
    avgTicket: string;
    segments: string[];
    campaignIds: string[];
}

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

const mockCampaigns: Campaign[] = [
    { id: 'camp-1', name: 'Lançamento Verão 2025' },
    { id: 'camp-2', name: 'Live Shopping Night' },
    { id: 'camp-3', name: 'Organic' },
    { id: 'camp-4', name: 'Black Friday Antecipada' },
];

const mockLives: Live[] = [
    { id: 'live-1', name: 'Lançamento Verão 2025', campaignId: 'camp-1', influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80' },
    { id: 'live-2', name: 'Live Shopping Night', campaignId: 'camp-2', influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80' },
    { id: 'live-3', name: 'Organic', campaignId: 'camp-3', influencerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
];

const mockInfluencers: Influencer[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        username: '@sarahchen_style',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        category: 'Mid',
        followers: '125k',
        platforms: ['instagram', 'tiktok'],
        totalSales: 'R$ 45.230,00',
        avgTicket: 'R$ 185,90',
        segments: ['Fashion', 'Beauty'],
        campaignIds: ['camp-1', 'camp-4']
    },
    {
        id: '2',
        name: 'Mike Johnson',
        username: '@tech_mike',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        category: 'Micro',
        followers: '45k',
        platforms: ['youtube', 'twitter'],
        totalSales: 'R$ 28.450,00',
        avgTicket: 'R$ 450,00',
        segments: ['Tech', 'Gadgets'],
        campaignIds: ['camp-2']
    },
    {
        id: '3',
        name: 'Emma Wilson',
        username: '@emma.lifestyle',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
        category: 'Top',
        followers: '1.2M',
        platforms: ['instagram', 'youtube', 'tiktok'],
        totalSales: 'R$ 156.780,00',
        avgTicket: 'R$ 120,50',
        segments: ['Lifestyle', 'Travel'],
        campaignIds: ['camp-1', 'camp-3']
    },
    {
        id: '4',
        name: 'Alex Rivera',
        username: '@alexfit',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
        category: 'Mid',
        followers: '350k',
        platforms: ['instagram', 'tiktok'],
        totalSales: 'R$ 89.120,00',
        avgTicket: 'R$ 95,00',
        segments: ['Fitness', 'Health'],
        campaignIds: ['camp-3']
    }
];

export const Influencers: React.FC = () => {
    const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
    
    const [activeTab, setActiveTab] = useState<'search' | 'my_influencers'>('search');

    // Modal state (temporary, not applied until submit)
    const [modalSearchQuery, setModalSearchQuery] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Applied search state (only after submit)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
    const [searchTags, setSearchTags] = useState<SearchTag[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Animated placeholder
    const placeholderWords = ['niche', 'platform', 'followers', 'age range'];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [fadeClass, setFadeClass] = useState('opacity-100');

    // Filters State
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
    const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
    const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

    const [selectedLives, setSelectedLives] = useState<string[]>([]);
    const [liveDropdownOpen, setLiveDropdownOpen] = useState(false);
    const [liveSearchQuery, setLiveSearchQuery] = useState('');

    // Refs for click outside
    const profileDropdownRef = React.useRef<HTMLDivElement>(null);
    const campaignDropdownRef = React.useRef<HTMLDivElement>(null);
    const liveDropdownRef = React.useRef<HTMLDivElement>(null);

    // Animated placeholder rotation
    useEffect(() => {
        const intervalId = setInterval(() => {
            setFadeClass('translate-y-2 opacity-0');
            setTimeout(() => {
                setCurrentWordIndex((prev) => (prev + 1) % placeholderWords.length);
                setFadeClass('translate-y-0 opacity-100');
            }, 400);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    // Parse modal search query with debouncing (for tag preview in modal)
    const [modalSearchParams, setModalSearchParams] = useState<SearchParams | null>(null);
    const [modalSearchTags, setModalSearchTags] = useState<SearchTag[]>([]);

    useEffect(() => {
        if (modalSearchQuery.trim().length === 0) {
            setModalSearchParams(null);
            setModalSearchTags([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            const params = parseInfluencerSearch(modalSearchQuery);
            setModalSearchParams(params);
            setModalSearchTags(searchParamsToTags(params));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [modalSearchQuery]);

    // Handle search submission
    const handleSearchSubmit = async () => {
        // If modalSearchQuery is empty, clear the search
        if (modalSearchQuery.trim().length === 0) {
            setSearchQuery('');
            setSearchParams(null);
            setSearchTags([]);
            setIsSearchModalOpen(false);
            return;
        }

        if (!modalSearchParams?.isValid) return;

        setIsSearching(true);
        setIsSearchModalOpen(false);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Apply the search
        setSearchQuery(modalSearchQuery);
        setSearchParams(modalSearchParams);
        setSearchTags(modalSearchTags);
        setIsSearching(false);
    };

    // Handle Enter key in modal
    const handleModalKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearchSubmit();
        }
    };

    // Open modal and preserve current search
    const handleOpenModal = () => {
        setModalSearchQuery(searchQuery);
        setIsSearchModalOpen(true);
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
            if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(event.target as Node)) {
                setCampaignDropdownOpen(false);
            }
            if (liveDropdownRef.current && !liveDropdownRef.current.contains(event.target as Node)) {
                setLiveDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCampaigns = mockCampaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(campaignSearchQuery.toLowerCase())
    );

    const filteredLives = mockLives.filter(live => {
        const matchesSearch = live.name.toLowerCase().includes(liveSearchQuery.toLowerCase());
        const matchesCampaign = selectedCampaigns.length === 0 || selectedCampaigns.some(campName => {
            const campaign = mockCampaigns.find(c => c.name === campName);
            return campaign && campaign.id === live.campaignId;
        });
        return matchesSearch && matchesCampaign;
    });

    const toggleProfile = (profile: string) => {
        setSelectedProfiles(prev =>
            prev.includes(profile)
                ? prev.filter(p => p !== profile)
                : [...prev, profile]
        );
    };

    const toggleCampaign = (campaignName: string) => {
        setSelectedCampaigns(prev =>
            prev.includes(campaignName)
                ? prev.filter(name => name !== campaignName)
                : [...prev, campaignName]
        );
    };

    const toggleLive = (liveName: string) => {
        setSelectedLives(prev =>
            prev.includes(liveName)
                ? prev.filter(name => name !== liveName)
                : [...prev, liveName]
        );
    };

    const filteredInfluencers = mockInfluencers.filter(influencer => {
        // 1. Intelligent Search (if searchParams exist and are valid)
        if (searchParams && searchParams.isValid) {
            // Check segments
            if (searchParams.segments.length > 0) {
                const hasMatchingSegment = searchParams.segments.some(seg =>
                    influencer.segments.some(infSeg => infSeg.toLowerCase().includes(seg.toLowerCase()))
                );
                if (!hasMatchingSegment) return false;
            }

            // Check followers
            const followerCount = parseInt(influencer.followers.replace(/[^0-9]/g, ''));
            const followerMultiplier = influencer.followers.toLowerCase().includes('m') ? 1000 :
                influencer.followers.toLowerCase().includes('k') ? 1 : 1;
            const actualFollowers = followerCount * followerMultiplier;

            if (searchParams.followerMin !== null && actualFollowers < searchParams.followerMin) {
                return false;
            }
            if (searchParams.followerMax !== null && actualFollowers > searchParams.followerMax) {
                return false;
            }

            // Check platforms
            if (searchParams.platforms.length > 0) {
                const hasMatchingPlatform = searchParams.platforms.some(plat => {
                    const platLower = plat.toLowerCase();
                    return influencer.platforms.some(p => p === platLower || p.includes(platLower));
                });
                if (!hasMatchingPlatform) return false;
            }
        } else if (searchQuery.trim() !== '') {
            // Fallback to simple text search if no valid params extracted
            const matchesSearch = influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                influencer.segments.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                influencer.platforms.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
            if (!matchesSearch) return false;
        }

        // 2. Profile Filter
        if (selectedProfiles.length > 0 && !selectedProfiles.includes(influencer.category)) {
            return false;
        }

        // 3. Campaign Filter
        if (selectedCampaigns.length > 0) {
            const influencerCampaignNames = influencer.campaignIds.map(id => mockCampaigns.find(c => c.id === id)?.name);
            const hasCampaign = selectedCampaigns.some(selected => influencerCampaignNames.includes(selected));
            if (!hasCampaign) return false;
        }

        // 4. Live Filter
        if (selectedLives.length > 0) {
            const selectedLiveObjects = mockLives.filter(l => selectedLives.includes(l.name));
            const campaignsOfSelectedLives = selectedLiveObjects.map(l => l.campaignId);

            const influencerCampaignIds = influencer.campaignIds;
            const hasLiveCampaign = campaignsOfSelectedLives.some(id => influencerCampaignIds.includes(id));

            if (!hasLiveCampaign) return false;
        }

        return true;
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Micro': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Mid': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Top': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'instagram': return <Instagram className="w-4 h-4" />;
            case 'youtube': return <Youtube className="w-4 h-4" />;
            case 'tiktok': return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
            );
            case 'twitter': return <Twitter className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white w-full">
            <Sidebar 
                isCollapsed={isCollapsed} 
                toggleCollapse={toggleCollapse}
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
            />

            <main className="flex-1 bg-[#FAFAFA] flex flex-col h-full overflow-hidden relative">
                <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
                    {/* Mobile Toggle */}
                    <div className="lg:hidden mb-4">
                        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-gray-600">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Influencers</h1>
                        <p className="text-gray-600 text-sm sm:text-base">Find and manage creators for your campaigns</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            className={`pb-2 px-1 text-sm font-medium mr-8 transition-colors relative ${activeTab === 'search'
                                ? 'text-[#7D2AE8]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('search')}
                        >
                            Search Influencers
                            {activeTab === 'search' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7D2AE8]" />
                            )}
                        </button>
                        <button
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'my_influencers'
                                ? 'text-[#7D2AE8]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('my_influencers')}
                        >
                            My Influencers
                            {activeTab === 'my_influencers' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7D2AE8]" />
                            )}
                        </button>
                    </div>

                    {activeTab === 'search' && (
                        <>
                            {/* Simple Search Input (triggers modal) */}
                            <div className="mb-6">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-2">
                                    <div className="relative max-w-md w-full" onClick={handleOpenModal}>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchTags.length > 0 ? '' : ''}
                                            onFocus={handleOpenModal}
                                            placeholder=""
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7D2AE8] focus:border-[#7D2AE8] sm:text-sm transition duration-150 ease-in-out cursor-pointer"
                                            readOnly
                                        />
                                        {/* Animated Placeholder */}
                                        {searchTags.length === 0 && (
                                            <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none overflow-hidden">
                                                <span className="text-gray-500 text-sm">
                                                    Search by <span className={`inline-block font-semibold text-gray-700 transition-all duration-400 ease-out ${fadeClass}`}>{placeholderWords[currentWordIndex]}</span>
                                                </span>
                                            </div>
                                        )}
                                        {/* Tags inside input */}
                                        {searchTags.length > 0 && (
                                            <div className="absolute inset-y-0 left-10 right-3 flex items-center gap-1.5 overflow-x-auto pointer-events-none">
                                                {searchTags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F3E8FF] text-[#7D2AE8] text-xs font-medium rounded-full border border-[#E9D5FF] whitespace-nowrap"
                                                    >
                                                        {tag.type === 'segment' && <span className="text-[10px]">🎯</span>}
                                                        {tag.type === 'platform' && <span className="text-[10px]">📱</span>}
                                                        {tag.type === 'followers' && <span className="text-[10px]">👥</span>}
                                                        {tag.type === 'age' && <span className="text-[10px]">🎂</span>}
                                                        {tag.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-wrap gap-3 items-center">
                                        {/* Profile Filter */}
                                        <div className="relative" ref={profileDropdownRef}>
                                            <button
                                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <p className="text-sm font-normal text-gray-600">
                                                    Profile {selectedProfiles.length > 0 && `(${selectedProfiles.length})`}
                                                </p>
                                                {selectedProfiles.length > 0 ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProfiles([]);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>

                                            {profileDropdownOpen && (
                                                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                                                    {['Micro', 'Mid', 'Top'].map((profile) => (
                                                        <label key={profile} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProfiles.includes(profile)}
                                                                onChange={() => toggleProfile(profile)}
                                                                className="w-4 h-4 text-[#7D2AE8] border-gray-300 rounded focus:ring-[#7D2AE8]"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm text-gray-900">{profile}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    {profile === 'Micro' ? '10k - 100k' : profile === 'Mid' ? '100k - 500k' : '500k+'}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Campaign Filter */}
                                        <div className="relative" ref={campaignDropdownRef}>
                                            <button
                                                onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
                                                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <p className="text-sm font-normal text-gray-600">
                                                    Campaigns {selectedCampaigns.length > 0 && `(${selectedCampaigns.length})`}
                                                </p>
                                                {selectedCampaigns.length > 0 ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCampaigns([]);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>

                                            {campaignDropdownOpen && (
                                                <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                    <div className="p-3 border-b border-gray-100">
                                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                            <Search className="w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search campaigns..."
                                                                value={campaignSearchQuery}
                                                                onChange={(e) => setCampaignSearchQuery(e.target.value)}
                                                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-64 overflow-y-auto p-2">
                                                        {filteredCampaigns.map((campaign) => (
                                                            <label key={campaign.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCampaigns.includes(campaign.name)}
                                                                    onChange={() => toggleCampaign(campaign.name)}
                                                                    className="w-4 h-4 text-[#7D2AE8] border-gray-300 rounded focus:ring-[#7D2AE8]"
                                                                />
                                                                <span className="text-sm text-gray-900">{campaign.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Live Filter */}
                                        <div className="relative" ref={liveDropdownRef}>
                                            <button
                                                onClick={() => setLiveDropdownOpen(!liveDropdownOpen)}
                                                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <p className="text-sm font-normal text-gray-600">
                                                    Lives {selectedLives.length > 0 && `(${selectedLives.length})`}
                                                </p>
                                                {selectedLives.length > 0 ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedLives([]);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>

                                            {liveDropdownOpen && (
                                                <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                                    <div className="p-3 border-b border-gray-100">
                                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                            <Search className="w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search lives..."
                                                                value={liveSearchQuery}
                                                                onChange={(e) => setLiveSearchQuery(e.target.value)}
                                                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-64 overflow-y-auto p-2">
                                                        {filteredLives.map((live) => (
                                                            <label key={live.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedLives.includes(live.name)}
                                                                    onChange={() => toggleLive(live.name)}
                                                                    className="w-4 h-4 text-[#7D2AE8] border-gray-300 rounded focus:ring-[#7D2AE8]"
                                                                />
                                                                <span className="text-sm text-gray-900">{live.name}</span>
                                                            </label>
                                                        ))}
                                                        {filteredLives.length === 0 && (
                                                            <div className="p-4 text-center text-sm text-gray-500">
                                                                No lives found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Clear Filters Button - Below input */}
                                {searchTags.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery('');
                                            setSearchParams(null);
                                            setSearchTags([]);
                                            setModalSearchQuery('');
                                        }}
                                        className="text-sm text-gray-600 hover:text-[#7D2AE8] transition-colors flex items-center gap-1.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Clear search
                                    </button>
                                )}
                            </div>

                            {/* Search Modal */}
                            {isSearchModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsSearchModalOpen(false)}>
                                    <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">Smart Influencer Search</h2>
                                            <button
                                                onClick={() => setIsSearchModalOpen(false)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {/* Search Input (Large) */}
                                        <div className="mb-6">
                                            <div className="relative bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm transition-shadow focus-within:border-[#7D2AE8]/30 focus-within:shadow-[0_8px_24px_rgba(125,42,232,0.12)]">
                                                <textarea
                                                    value={modalSearchQuery}
                                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                                    onKeyPress={handleModalKeyPress}
                                                    placeholder="Describe the influencer profile you're looking for. Ex: 'Instagram fitness influencer, young audience, 10k+ followers'"
                                                    className="w-full min-h-[120px] p-4 pr-14 pb-14 rounded-[16px] border-none outline-none ring-0 focus:outline-none focus:ring-0 bg-white text-gray-900 text-sm leading-5 placeholder:text-[#D1D5DB] resize-none"
                                                    autoFocus
                                                />
                                                <button
                                                    disabled={!modalSearchParams?.isValid}
                                                    onClick={handleSearchSubmit}
                                                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-[12px] flex items-center justify-center transition-all ${modalSearchParams?.isValid
                                                        ? 'bg-[#7D2AE8] text-white hover:bg-[#6d24ca] cursor-pointer shadow-sm'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <ArrowUp className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {modalSearchTags.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-3">Detected parameters:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {modalSearchTags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3E8FF] text-[#7D2AE8] text-sm font-medium rounded-full border border-[#E9D5FF]"
                                                        >
                                                            {tag.type === 'segment' && <span className="text-xs">🎯</span>}
                                                            {tag.type === 'platform' && <span className="text-xs">📱</span>}
                                                            {tag.type === 'followers' && <span className="text-xs">👥</span>}
                                                            {tag.type === 'age' && <span className="text-xs">🎂</span>}
                                                            {tag.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Helper Text */}
                                        <p className="text-xs text-gray-500 text-center">
                                            Describe characteristics such as niche, followers, platform, and age
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Search Results Grid */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {searchTags.length > 0 ? 'Search Results' : 'Suggested for you'}
                                </h2>

                                {/* Loading State */}
                                {isSearching ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-16 h-16 border-4 border-[#7D2AE8] border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-600 font-medium">Searching influencers...</p>
                                        <p className="text-gray-500 text-sm">Analyzing your search parameters</p>
                                    </div>
                                ) : filteredInfluencers.length === 0 ? (
                                    /* Empty State */
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No influencers found</h3>
                                        <p className="text-gray-500 text-sm text-center max-w-md mb-6">
                                            {searchTags.length > 0
                                                ? "We couldn't find any influencers matching your search criteria. Try adjusting your filters or search terms."
                                                : "No influencers available at the moment. Try different filters or check back later."
                                            }
                                        </p>
                                        {searchTags.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSearchParams(null);
                                                    setSearchTags([]);
                                                    setModalSearchQuery('');
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7D2AE8] text-white text-sm font-medium rounded-lg hover:bg-[#6d24ca] transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredInfluencers.map((influencer) => (
                                            <Card key={influencer.id} className="border-[#E2E8F0] hover:shadow-md transition-shadow">
                                                <CardContent className="p-6">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={influencer.image}
                                                                alt={influencer.name}
                                                                className="w-14 h-14 rounded-full object-cover border border-gray-200"
                                                            />
                                                            <div>
                                                                <h3 className="text-base font-semibold text-gray-900">{influencer.name}</h3>
                                                                <p className="text-sm text-gray-500">{influencer.username}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(influencer.category)}`}>
                                                            {influencer.category}
                                                        </span>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                                                            <p className="text-sm font-bold text-gray-900">{influencer.totalSales}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Avg. Ticket</p>
                                                            <p className="text-sm font-bold text-gray-900">{influencer.avgTicket}</p>
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="space-y-3 mb-6">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-500">Followers</span>
                                                            <span className="font-medium text-gray-900">{influencer.followers}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-500">Platforms</span>
                                                            <div className="flex gap-2 text-gray-400">
                                                                {influencer.platforms.map(p => (
                                                                    <span key={p} title={p}>{getPlatformIcon(p)}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {influencer.segments.map(segment => (
                                                                <span key={segment} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                                    {segment}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#7D2AE8] text-white text-sm font-medium rounded-lg hover:bg-[#6d24ca] transition-colors">
                                                            <UserPlus className="w-4 h-4" />
                                                            Invite
                                                        </button>
                                                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                            <ExternalLink className="w-4 h-4" />
                                                            Profile
                                                        </button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'my_influencers' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <UserPlus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers yet</h3>
                            <p className="text-gray-500 max-w-sm">
                                Start by searching and inviting influencers to join your network.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

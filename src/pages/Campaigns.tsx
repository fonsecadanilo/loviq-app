import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Instagram,
  Youtube,
  Globe,
  Smartphone,
  ShoppingBag,
  Users,
  TrendingUp,
  CreditCard,
  Activity,
  Video
} from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { SlidingTabsTransition, SlideDirection } from '../components/dashboard/SlidingTabsTransition';
import { useSidebar } from '../contexts/SidebarContext';
import { MetricsGridSkeleton, CampaignTableSkeleton } from '../components/ui/PageSkeletons';
import { UserMenu } from '../components/dashboard/UserMenu';
import { useUserProfile } from '../hooks/useUserProfile';

// Mock Data Types
interface Campaign {
  id: string;
  name: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Multi-platform';
  livesCount: number;
  productsCount: number;
  status: 'Active' | 'Scheduled' | 'Draft' | 'Completed';
  influencers: string[];
  budget: number;
  spent: number;
  roi: number;
  revenue: number;
}

// Mock Data
const campaignsData: Campaign[] = [
  {
    id: '1',
    name: 'Summer Glow 2024',
    platform: 'Instagram',
    livesCount: 3,
    productsCount: 12,
    status: 'Active',
    influencers: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3'],
    budget: 15000,
    spent: 12500,
    roi: 420,
    revenue: 52400
  },
  {
    id: '2',
    name: 'Tech Review Series',
    platform: 'YouTube',
    livesCount: 1,
    productsCount: 4,
    status: 'Scheduled',
    influencers: ['https://i.pravatar.cc/150?u=4'],
    budget: 8000,
    spent: 0,
    roi: 0,
    revenue: 0
  },
  {
    id: '3',
    name: 'Holiday Gift Guide',
    platform: 'Multi-platform',
    livesCount: 0,
    productsCount: 24,
    status: 'Draft',
    influencers: [],
    budget: 25000,
    spent: 0,
    roi: 0,
    revenue: 0
  },
  {
    id: '4',
    name: 'Fitness Challenge',
    platform: 'TikTok',
    livesCount: 5,
    productsCount: 3,
    status: 'Completed',
    influencers: ['https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6'],
    budget: 5000,
    spent: 5000,
    roi: 210,
    revenue: 10500
  },
  {
    id: '5',
    name: 'Autumn Essentials',
    platform: 'Instagram',
    livesCount: 2,
    productsCount: 8,
    status: 'Active',
    influencers: ['https://i.pravatar.cc/150?u=7', 'https://i.pravatar.cc/150?u=8', 'https://i.pravatar.cc/150?u=9', 'https://i.pravatar.cc/150?u=10'],
    budget: 12000,
    spent: 8200,
    roi: 185,
    revenue: 23400
  }
];

type CampaignsTab = 'campaigns' | 'lives-shops' | 'search-influencers';

const TAB_CONFIG: Record<CampaignsTab, { label: string; index: number }> = {
  'campaigns': { label: 'Campaigns', index: 0 },
  'lives-shops': { label: 'Live Shops', index: 1 },
  'search-influencers': { label: 'Search Influencers', index: 2 },
};

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const { profile, brand, influencer } = useUserProfile();

  const userProfileData = profile ? {
    profile,
    brand: brand || undefined,
    influencer: influencer || undefined
  } : null;
  
  // Tab state
  const [activeTab, setActiveTab] = useState<CampaignsTab>('campaigns');
  const previousTabRef = useRef<CampaignsTab>(activeTab);

  // Track scroll state for header styling
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filters = ['All', 'Active', 'Scheduled', 'Drafts', 'Completed'];

  const tabs = [
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'lives-shops', label: 'Live Shops' },
    { id: 'search-influencers', label: 'Search Influencers' },
  ] as const;

  // Monitor scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Direction logic for sliding tabs
  const getDirection = (): SlideDirection => {
    const currentIndex = TAB_CONFIG[activeTab].index;
    const previousIndex = TAB_CONFIG[previousTabRef.current].index;
    return currentIndex > previousIndex ? 'left' : 'right';
  };

  const handleTabChange = (newTab: CampaignsTab) => {
    if (newTab !== activeTab) {
      previousTabRef.current = activeTab;
      setActiveTab(newTab);
    }
  };

  const direction = getDirection();

  // Platform Icon Helper
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Instagram className="w-3.5 h-3.5" />;
      case 'YouTube': return <Youtube className="w-3.5 h-3.5" />;
      case 'TikTok': return <Smartphone className="w-3.5 h-3.5" />;
      default: return <Globe className="w-3.5 h-3.5" />;
    }
  };

  // Status Badge Helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Draft':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Filter logic
  const filteredCampaigns = activeFilter === 'All' 
    ? campaignsData 
    : campaignsData.filter(c => {
        if (activeFilter === 'Drafts') return c.status === 'Draft';
        return c.status === activeFilter;
      });

  // Campaigns List Component (defined inside to access state)
  const CampaignsList = () => {
    if (isLoading) {
      return (
        <>
          <MetricsGridSkeleton />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="h-10 w-full md:w-96 bg-slate-100 rounded-xl animate-pulse"></div>
             <div className="flex gap-3">
                <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-32 bg-slate-900/10 rounded-xl animate-pulse"></div>
             </div>
          </div>
          <CampaignTableSkeleton />
        </>
      );
    }

    return (
    <>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 gap-x-4 gap-y-4">
        {/* Active Campaigns */}
        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Active Campaigns
            </p>
            <div className="p-2 bg-purple-50 rounded-md">
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              12
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-green-500">+2</span>
              <span className="text-xs text-slate-400 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Lives Reach */}
        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Lives Reach
            </p>
            <div className="p-2 bg-blue-50 rounded-md">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              45.2k
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-green-500">+15%</span>
              <span className="text-xs text-slate-400 ml-1">new audiences</span>
            </div>
          </div>
        </div>

        {/* AVG ROI */}
        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              AVG ROI
            </p>
            <div className="p-2 bg-emerald-50 rounded-md">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              320%
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-slate-400">Return on ad spend</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
              <span className="text-xs text-purple-600 font-medium">
                High
              </span>
            </div>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Average Ticket
            </p>
            <div className="p-2 bg-orange-50 rounded-md">
              <CreditCard className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
              $85.40
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-medium text-slate-500">0.8%</span>
              <span className="text-xs text-slate-400 ml-1">stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100/50 p-1 rounded-xs overflow-x-auto no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xs text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => navigate('/campaigns/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Campaign Details</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Influencers</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Budget / Spent</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Performance (ROI)</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Campaign Details */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-slate-900 text-sm">{campaign.name}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(campaign.platform)}
                          <span>{campaign.platform}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          <span>{campaign.livesCount} Lives</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{campaign.productsCount} Products</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(campaign.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        campaign.status === 'Active' ? 'bg-green-500' :
                        campaign.status === 'Scheduled' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}></span>
                      {campaign.status}
                    </div>
                  </td>

                  {/* Influencers */}
                  <td className="px-6 py-5">
                    {campaign.influencers.length > 0 ? (
                      <div className="flex items-center -space-x-2">
                        {campaign.influencers.slice(0, 3).map((img, i) => (
                          <img key={i} src={img} alt="Influencer" className="w-8 h-8 rounded-full border-2 border-white object-cover bg-slate-100" />
                        ))}
                        {campaign.influencers.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-medium text-slate-500">
                            +{campaign.influencers.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-purple-600 border border-dashed border-slate-300 rounded-full px-3 py-1 hover:border-purple-200 hover:bg-purple-50 transition-all">
                        <Users className="w-3.5 h-3.5" />
                        Assign
                      </button>
                    )}
                  </td>

                  {/* Budget / Spent */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          ${(campaign.spent / 1000).toFixed(1)}k
                        </span>
                        <span className="text-xs text-slate-400">
                          of ${(campaign.budget / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Performance (ROI) */}
                  <td className="px-6 py-5">
                    {campaign.roi > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="text-xs">↗</span>
                          <span className="text-sm font-bold">{campaign.roi}%</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          ${(campaign.revenue / 1000).toFixed(1)}k Revenue
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">--</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-5 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing <span className="font-medium">1-{filteredCampaigns.length}</span> of <span className="font-medium">{campaignsData.length}</span> campaigns
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
    );
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white w-full">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content */}
      <main className="flex-1 bg-[#FAFAFA] flex flex-col h-full relative overflow-hidden">
        
        {/* Header with Tabs - Fixed */}
        <header className={`flex-shrink-0 flex z-30 pt-4 pr-8 pb-2 pl-8 sticky top-0 items-center justify-between transition-all duration-200 ${
          isScrolled ? 'bg-white shadow-sm' : 'bg-[#FAFAFA]'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <Menu size={24} />
            </button>
            
            {/* Tab Navigation with Sliding Indicator */}
            <div className="grid grid-cols-3 bg-violet-50/80 rounded-xs p-1 items-center relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as CampaignsTab)}
                  className={`relative z-10 px-4 py-2 text-center text-xs font-semibold transition-colors duration-300 whitespace-nowrap rounded-xs ${
                    activeTab === tab.id
                      ? 'text-slate-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="campaigns-active-pill"
                      className="absolute inset-0 bg-slate-900 rounded-xs shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ zIndex: -1 }} // Ensure it stays behind text (which is z-10) but above container
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 flex-shrink-0">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <UserMenu userProfile={userProfileData} />
          </div>
        </header>

        {/* Main Content with Transition */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-8 py-6"
        >
          <SlidingTabsTransition
            tabKey={activeTab}
            direction={direction}
            duration={0.25}
            offset={50}
            className="h-full"
          >
            {activeTab === 'campaigns' && <CampaignsList />}
            {activeTab === 'lives-shops' && (
              <div className="flex items-center justify-center h-64 text-slate-400">
                Lives Shops Content Coming Soon
              </div>
            )}
            {activeTab === 'search-influencers' && (
              <div className="flex items-center justify-center h-64 text-slate-400">
                Search Influencers Content Coming Soon
              </div>
            )}
          </SlidingTabsTransition>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;

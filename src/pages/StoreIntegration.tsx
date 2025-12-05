import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  Store, 
  CreditCard, 
  Search, 
  Plus, 
  MoreVertical, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  X,
  Settings,
  Upload,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Truck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Trash2,
  Edit2,
  Info,
  Check,
  Clock,
  Lock,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { UserMenu } from '../components/dashboard/UserMenu';
import { useUserProfile } from '../hooks/useUserProfile';
import { SlidingTabsTransition, SlideDirection } from '../components/dashboard/SlidingTabsTransition';
import { ShopifyConnectButton } from '../components/shopify/ShopifyConnectButton';
import { ShopifyImportModal } from '../components/shopify/ShopifyImportModal';
import { type ConnectionStatus } from '../services/shopify';
import { Card, CardContent } from '../components/ui/Card';
import { Sheet } from '../components/ui/Sheet';
import { 
  searchRegions as searchGoogleRegions, 
  resetSessionToken,
  type RegionSuggestion 
} from '../services/googlePlaces';
import { OrderDetails, OrderDetailsData } from '../components/dashboard/OrderDetails';
import { useSidebar } from '../contexts/SidebarContext';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { CampaignLiveFilter } from '../components/dashboard/CampaignLiveFilter';
import { 
    MetricsGridSkeleton, 
    RecentOrdersSkeleton, 
    ProductTableSkeleton, 
    IntegrationCardSkeleton, 
    StoreDetailsSkeleton 
} from '../components/ui/PageSkeletons';

import { supabase } from '../lib/supabase';

// Types
type MyStoreTab = 'orders' | 'products' | 'integrations' | 'settings';

// Product interface matching database
interface Product {
    id: number;
    name: string;
    price: number | string;
    description?: string | null;
    image_url?: string | null;
    external_product_id?: string | null;
    product_source_type?: string | null;
    store_id?: number | null;
    stock_quantity?: number;
    created_at?: string;
}

interface Order {
    id: string;
    customer: string;
    date: string;
    total: string;
    status: 'Completed' | 'Pending' | 'Cancelled' | 'Processing';
    sourceLive: string;
    influencerImage: string;
    productName: string;
    productImage: string;
    additionalItems?: number;
}

interface Integration {
    id: string;
    name: string;
    description: string;
    logo: string;
    status: 'Connected' | 'Available' | 'Coming Soon';
    category: 'Ecommerce' | 'Payment';
}

const mockIntegrations: Integration[] = [
    {
        id: 'shopify',
        name: 'Shopify',
        description: 'Sync products, inventory and orders automatically.',
        logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg',
        status: 'Available',
        category: 'Ecommerce'
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        description: 'Open-source e-commerce solution for WordPress.',
        logo: 'https://cdn.worldvectorlogo.com/logos/woocommerce.svg',
        status: 'Coming Soon',
        category: 'Ecommerce'
    },
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Accept payments securely during your live streams.',
        logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
        status: 'Connected',
        category: 'Payment'
    }
];

// Added missing mocks for enrichment
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
    { id: 'camp-5', name: 'Liquidação de Inverno' },
];

const mockLives: Live[] = [
    { id: 'live-1', name: 'Lançamento Verão 2025', campaignId: 'camp-1', influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80' },
    { id: 'live-2', name: 'Live Shopping Night', campaignId: 'camp-2', influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80' },
    { id: 'live-3', name: 'Organic', campaignId: 'camp-3', influencerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
    { id: 'live-4', name: 'Black Friday Antecipada', campaignId: 'camp-4', influencerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80' },
    { id: 'live-5', name: 'Liquidação de Inverno', campaignId: 'camp-5', influencerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80' },
];

const mockOrders: Order[] = [
    { id: '#ORD-7829', customer: 'Ana Silva', date: '21 Nov, 2025', total: 'R$ 299,70', status: 'Completed', sourceLive: 'Lançamento Verão 2025', influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', productName: 'Vestido Floral Verão', productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=150&q=80' },
    { id: '#ORD-7830', customer: 'Carlos Souza', date: '21 Nov, 2025', total: 'R$ 89,90', status: 'Processing', sourceLive: 'Live Shopping Night', influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', productName: 'Camiseta Básica Premium', productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&q=80' },
    { id: '#ORD-7831', customer: 'Mariana Oliveira', date: '20 Nov, 2025', total: 'R$ 450,00', status: 'Completed', sourceLive: 'Lançamento Verão 2025', influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', productName: 'Conjunto Alfaiataria', productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&q=80', additionalItems: 2 },
    { id: '#ORD-7832', customer: 'Pedro Santos', date: '20 Nov, 2025', total: 'R$ 119,90', status: 'Pending', sourceLive: 'Organic', influencerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', productName: 'Boné Streetwear', productImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=150&q=80' },
    { id: '#ORD-7833', customer: 'Julia Lima', date: '19 Nov, 2025', total: 'R$ 75,50', status: 'Cancelled', sourceLive: 'Live Shopping Night', influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', productName: 'Acessório Colar Prata', productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=150&q=80' },
];


const TAB_CONFIG: Record<MyStoreTab, { label: string; index: number }> = {
  orders: { label: 'Orders', index: 0 },
  products: { label: 'Products', index: 1 },
  integrations: { label: 'Integrations', index: 2 },
  settings: { label: 'Store Settings', index: 3 },
};

const tabs = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'settings', label: 'Store Settings' },
] as const;

const parseMockDate = (dateStr: string): Date => {
    return new Date(dateStr);
};

interface OrdersViewProps {
  isLoading: boolean;
  filteredOrders: Order[];
  orderProductSearch: string;
  setOrderProductSearch: (value: string) => void;
  dateRange: { from: Date | null; to: Date | null };
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  handleExportCSV: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  selectedCampaigns: string[];
  setSelectedCampaigns: (campaigns: string[]) => void;
  selectedLives: string[];
  setSelectedLives: (lives: string[]) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  statusDropdownOpen: boolean;
  setStatusDropdownOpen: (open: boolean) => void;
  statusDropdownRef: React.RefObject<HTMLDivElement>;
  paginatedOrders: Order[];
  ordersCurrentPage: number;
  ordersPerPage: number;
  ordersTotalPages: number;
  handleOrdersPageChange: (page: number) => void;
  handleOrderClick: (order: Order) => void;
  getStatusColor: (status: string) => string;
  isExporting: boolean;
}

const OrdersView: React.FC<OrdersViewProps> = ({
  isLoading,
  filteredOrders,
  orderProductSearch,
  setOrderProductSearch,
  dateRange,
  setDateRange,
  handleExportCSV,
  activeFilter,
  setActiveFilter,
  selectedCampaigns,
  setSelectedCampaigns,
  selectedLives,
  setSelectedLives,
  statusFilter,
  setStatusFilter,
  statusDropdownOpen,
  setStatusDropdownOpen,
  statusDropdownRef,
  paginatedOrders,
  ordersCurrentPage,
  ordersPerPage,
  ordersTotalPages,
  handleOrdersPageChange,
  handleOrderClick,
  getStatusColor,
  isExporting
}) => {
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const advancedFiltersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (advancedFiltersRef.current && !advancedFiltersRef.current.contains(event.target as Node)) {
            setAdvancedFiltersOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    if (isLoading) {
        return (
            <>
                <MetricsGridSkeleton />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="h-10 w-full md:w-96 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
                <RecentOrdersSkeleton />
            </>
        )
    }

    return (
    <>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 gap-x-4 gap-y-4">
            {/* Total Sales */}
            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Total Sales
                    </p>
                    <div className="p-2 bg-purple-50 rounded-md">
                        <ShoppingBag className="w-4 h-4 text-purple-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                      {filteredOrders.length}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">+12.5%</span>
                        <span className="text-xs text-slate-400 ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Total Revenue
                    </p>
                    <div className="p-2 bg-green-50 rounded-md">
                        <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                      R$ {filteredOrders.reduce((acc, order) => {
                          const val = parseFloat(order.total.replace('R$ ', '').replace(',', '.'));
                          return acc + val;
                      }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">+8.2%</span>
                        <span className="text-xs text-slate-400 ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Avg. Ticket */}
            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Avg. Ticket
                    </p>
                    <div className="p-2 bg-blue-50 rounded-md">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                      R$ {filteredOrders.length > 0 ? (filteredOrders.reduce((acc, order) => {
                          const val = parseFloat(order.total.replace('R$ ', '').replace(',', '.'));
                          return acc + val;
                      }, 0) / filteredOrders.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-slate-500">0.8%</span>
                        <span className="text-xs text-slate-400 ml-1">stable</span>
                    </div>
                </div>
            </div>

             {/* Conversion Rate */}
             <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Conversion Rate
                    </p>
                    <div className="p-2 bg-orange-50 rounded-md">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                        3.2%
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">+0.5%</span>
                        <span className="text-xs text-slate-400 ml-1">vs last month</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            {/* Quick Filters (Button Group) */}
            <div className="flex items-center bg-slate-100/50 p-1 rounded-md overflow-hidden self-start xl:self-auto">
                {['All', "Today's Orders", 'Top Products'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 h-[36px] text-sm font-medium transition-all whitespace-nowrap rounded-sm flex items-center ${
                            activeFilter === filter
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                {/* Product Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by product..."
                        value={orderProductSearch}
                        onChange={(e) => setOrderProductSearch(e.target.value)}
                        className="block w-64 pl-9 pr-3 h-[44px] border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                    />
                </div>

                {/* Filters Dropdown */}
                <div className="relative" ref={advancedFiltersRef}>
                    <button
                        onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                        className={`flex h-[44px] items-center gap-2 px-4 border rounded-md text-sm font-medium transition-colors ${
                            advancedFiltersOpen || (dateRange.from || selectedCampaigns.length > 0 || selectedLives.length > 0 || statusFilter !== 'All')
                                ? 'bg-white border-purple-500 text-purple-700 ring-1 ring-purple-500/20'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                    <Filter className="w-4 h-4" />
                        Filters
                        {(dateRange.from || selectedCampaigns.length > 0 || selectedLives.length > 0 || statusFilter !== 'All') && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-600">
                                {(dateRange.from ? 1 : 0) + (selectedCampaigns.length > 0 || selectedLives.length > 0 ? 1 : 0) + (statusFilter !== 'All' ? 1 : 0)}
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${advancedFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                    {advancedFiltersOpen && (
                        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-lg shadow-xl z-40 p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Date Range
                                </label>
                                <div className="flex items-center w-full">
                                    <DateRangePicker 
                                        onRangeChange={setDateRange}
                                        placeholder="Select dates"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Campaign & Live
                                </label>
                                <div className="flex items-center w-full">
                                    <CampaignLiveFilter 
                                        campaigns={mockCampaigns}
                                        lives={mockLives}
                                        selectedCampaigns={selectedCampaigns}
                                        selectedLives={selectedLives}
                                        onCampaignChange={setSelectedCampaigns}
                                        onLiveChange={setSelectedLives}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Status
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setStatusSelectOpen(!statusSelectOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <span className={statusFilter === 'All' ? 'text-slate-500' : 'text-slate-900'}>
                                            {statusFilter === 'All' ? 'Select Status' : statusFilter}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${statusSelectOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {statusSelectOpen && (
                                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto p-1">
                                            {['All', 'Completed', 'Processing', 'Pending', 'Cancelled'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setStatusFilter(status);
                                                        setStatusSelectOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors flex items-center justify-between ${
                                                        statusFilter === status
                                                        ? 'bg-purple-50 text-purple-700 font-medium'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>{status === 'All' ? 'All Statuses' : status}</span>
                                                    {statusFilter === status && (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Export CSV (Last on the right) */}
                <button 
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="flex h-[44px] items-center gap-2 px-4 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 text-sm font-medium relative z-10">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOrderClick(order);
                                        }}
                                        className="text-purple-600 hover:text-purple-700 hover:underline cursor-pointer font-semibold transition-colors"
                                    >
                                        {order.id}
                                    </button>
                                </td>
                                <td className="px-6 py-5 text-sm text-slate-900 font-medium">{order.customer}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={order.productImage} alt={order.productName} className="w-10 h-10 rounded-md object-cover border border-slate-100 bg-white" />
                                            {order.additionalItems && order.additionalItems > 0 && (
                                                <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                                                    +{order.additionalItems}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{order.productName}</span>
                                            {order.additionalItems && order.additionalItems > 0 && (
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    + {order.additionalItems} more items
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-xs text-slate-500">{order.date}</td>
                                <td className="px-6 py-5 text-sm font-bold text-slate-900">{order.total}</td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-500' :
                                            order.status === 'Processing' ? 'bg-blue-500' :
                                            order.status === 'Pending' ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}></span>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                      {paginatedOrders.length === 0 && (
                          <tr>
                              <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-sm">
                                  No orders found matching the filters.
                              </td>
                          </tr>
                      )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Showing <span className="font-medium">{Math.min((ordersCurrentPage - 1) * ordersPerPage + 1, filteredOrders.length)}</span> to <span className="font-medium">{Math.min(ordersCurrentPage * ordersPerPage, filteredOrders.length)}</span> of <span className="font-medium">{filteredOrders.length}</span> orders
                </div>
                <div className="flex gap-2">
                  <button 
                      onClick={() => handleOrdersPageChange(ordersCurrentPage - 1)}
                      disabled={ordersCurrentPage === 1}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                  <button 
                      onClick={() => handleOrdersPageChange(ordersCurrentPage + 1)}
                      disabled={ordersCurrentPage === ordersTotalPages}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </>
    );
};

// ProductsView extracted as separate component to prevent re-mounting on parent re-renders
interface ProductsViewProps {
  isLoading: boolean;
  onOpenImportModal: () => void;
}

const ProductsView: React.FC<ProductsViewProps> = ({ isLoading, onOpenImportModal }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  
  // Pagination State
  const [productsCurrentPage, setProductsCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Fetch products from database
  useEffect(() => {
      const fetchProducts = async () => {
          setProductsLoading(true);
          try {
              const { data, error } = await supabase
                  .from('products')
                  .select('id, name, price, description, image_url, external_product_id, product_source_type, store_id, stock_quantity, created_at')
                  .order('created_at', { ascending: false })
                  .limit(50);

              if (error) {
                  console.error('Error fetching products:', error);
              } else {
                  setProducts(data || []);
              }
          } catch (err) {
              console.error('Error fetching products:', err);
          } finally {
              setProductsLoading(false);
          }
      };

      fetchProducts();
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
      setProductsCurrentPage(1);
  }, [productSearch]);

  // Filter products by search
  const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.external_product_id && product.external_product_id.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Pagination Logic
  const productsTotalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
      (productsCurrentPage - 1) * productsPerPage,
      productsCurrentPage * productsPerPage
  );

  const handleProductsPageChange = (page: number) => {
      if (page >= 1 && page <= productsTotalPages) {
          setProductsCurrentPage(page);
      }
  };

  // Format price
  const formatPrice = (price: number | string) => {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return `R$ ${numPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get source badge
  const getSourceBadge = (source: string | null | undefined) => {
      if (source === 'shopify') {
          return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="h-3 w-3" />
                  Shopify
              </span>
          );
      }
      return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
              Manual
          </span>
      );
  };

  if (isLoading || productsLoading) {
      return (
          <div className="space-y-6">
              <div className="flex justify-between gap-4">
                  <div className="h-10 w-96 bg-slate-100 rounded-xl animate-pulse"></div>
                  <div className="h-10 w-32 bg-slate-900/10 rounded-xl animate-pulse"></div>
              </div>
              <ProductTableSkeleton />
          </div>
      )
  }

  return (
  <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all shadow-sm"
              />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
              <button 
                  onClick={onOpenImportModal}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-md hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm"
              >
                  <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="h-4 w-4" />
                  Import Shopify
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm">
                  <Plus className="h-4 w-4" />
                  Add Product
              </button>
          </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                          <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {paginatedProducts.length > 0 ? (
                          paginatedProducts.map((product) => (
                              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          {product.image_url ? (
                                              <img 
                                                  src={product.image_url} 
                                                  alt={product.name} 
                                                  className="w-10 h-10 rounded-md object-cover border border-slate-100 shadow-sm bg-white" 
                                              />
                                          ) : (
                                              <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                                                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                                              </div>
                                          )}
                                          <div className="flex flex-col">
                                              <span className="text-sm font-medium text-slate-900 truncate max-w-[250px]">{product.name}</span>
                                              {product.description && (
                                                  <span className="text-xs text-slate-400 truncate max-w-[250px]">{product.description}</span>
                                              )}
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatPrice(product.price)}</td>
                                  <td className="px-6 py-4">
                                      {(() => {
                                          const stock = product.stock_quantity ?? 0;
                                          if (stock === 0) {
                                              return (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                      Out of stock
                                                  </span>
                                              );
                                          } else if (stock <= 10) {
                                              return (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                      {stock} units
                                                  </span>
                                              );
                                          } else {
                                              return (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                      {stock} units
                                                  </span>
                                              );
                                          }
                                      })()}
                                  </td>
                                  <td className="px-6 py-4">
                                      {getSourceBadge(product.product_source_type)}
                                  </td>
                                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                      {product.external_product_id ? `#${product.external_product_id.slice(-8)}` : `#${product.id}`}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors">
                                          <MoreVertical className="w-4 h-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan={6} className="px-6 py-12 text-center">
                                  <div className="flex flex-col items-center gap-3">
                                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                          <ShoppingBag className="w-6 h-6 text-slate-400" />
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-slate-600">No products found</p>
                                          <p className="text-xs text-slate-400 mt-1">
                                              {productSearch ? 'Try a different search term' : 'Import products from Shopify or add them manually'}
                                          </p>
                                      </div>
                                      {!productSearch && (
                                          <button 
                                              onClick={onOpenImportModal}
                                              className="mt-2 flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                                          >
                                              <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="h-4 w-4" />
                                              Import from Shopify
                                          </button>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing <span className="font-medium">{Math.min((productsCurrentPage - 1) * productsPerPage + 1, filteredProducts.length)}</span> to <span className="font-medium">{Math.min(productsCurrentPage * productsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> products
              </div>
              <div className="flex gap-2">
                <button 
                    onClick={() => handleProductsPageChange(productsCurrentPage - 1)}
                    disabled={productsCurrentPage === 1}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                      <ChevronLeft className="w-4 h-4" />
                  </button>
                <button 
                    onClick={() => handleProductsPageChange(productsCurrentPage + 1)}
                    disabled={productsCurrentPage === productsTotalPages}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                      <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </div>
  </div>
  );
};

// SettingsStoreView extracted as separate component to prevent re-mounting on parent re-renders
interface SettingsStoreViewProps {
  isLoading: boolean;
  activeSettingsTab: 'general' | 'shipping';
  setActiveSettingsTab: (tab: 'general' | 'shipping') => void;
}

const SettingsStoreView: React.FC<SettingsStoreViewProps> = ({ 
  isLoading, 
  activeSettingsTab, 
  setActiveSettingsTab 
}) => {
  const [regionSearch, setRegionSearch] = useState('');
  const [deliveryRegions, setDeliveryRegions] = useState<Array<{ id: string; name: string; fullName: string }>>([
    { id: 'united-states', name: 'United States', fullName: 'United States (All)' }
  ]);
  const [shippingMethods, setShippingMethods] = useState([
    { id: 1, name: 'Standard Shipping', price: '5.90', duration: '5-7 business days' },
    { id: 2, name: 'Express Shipping', price: '12.90', duration: '2-3 business days' }
  ]);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingRegions, setFreeShippingRegions] = useState<string[]>([]);
  const [regionSuggestions, setRegionSuggestions] = useState<RegionSuggestion[]>([]);
  const [isSearchingRegions, setIsSearchingRegions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Google Places API search for regions with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Reset suggestions if query is too short
    if (regionSearch.length < 2) {
      setRegionSuggestions([]);
      setIsSearchingRegions(false);
      return;
    }

    setIsSearchingRegions(true);

    // Debounce the API call (300ms)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await searchGoogleRegions(regionSearch);
        // Filter out already added regions
        const filteredSuggestions = suggestions.filter(
          s => !deliveryRegions.some(r => r.id === s.id || r.fullName === s.fullName)
        );
        setRegionSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error searching regions:', error);
        setRegionSuggestions([]);
      } finally {
        setIsSearchingRegions(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [regionSearch, deliveryRegions]);

  // Helper function to check if a region represents the entire USA
  const isEntireUSA = (name: string, fullName: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    const normalizedFullName = fullName.toLowerCase().trim();
    
    // All possible ways to refer to the entire United States
    const usaVariations = [
      'united states',
      'united states of america',
      'usa',
      'u.s.a',
      'u.s.a.',
      'u.s.',
      'us',
      'america',
      'estados unidos',
    ];
    
    return usaVariations.some(variation => 
      normalizedName === variation || 
      normalizedFullName === variation ||
      normalizedFullName.startsWith(variation + ',') ||
      normalizedName.startsWith(variation + ',')
    );
  };

  const addRegion = (suggestion: RegionSuggestion) => {
    // Rule 1: Don't add if already exists
    if (deliveryRegions.some(r => r.id === suggestion.id || r.fullName === suggestion.fullName)) {
      setRegionSearch('');
      setRegionSuggestions([]);
      return;
    }

    // Check if selecting "United States" (entire country)
    const isSelectingEntireCountry = isEntireUSA(suggestion.name, suggestion.fullName) || 
                                      suggestion.id === 'united-states';

    if (isSelectingEntireCountry) {
      // Rule 2b: When selecting USA, remove all other specific regions
      setDeliveryRegions([{
        id: 'united-states',
        name: 'United States',
        fullName: 'United States (All)'
      }]);
    } else {
      // Rule 2a: When selecting a specific region, remove "United States (All)" if present
      const filteredRegions = deliveryRegions.filter(r => r.id !== 'united-states');
      setDeliveryRegions([...filteredRegions, {
        id: suggestion.id,
        name: suggestion.name,
        fullName: suggestion.fullName
      }]);
    }

    setRegionSearch('');
    setRegionSuggestions([]);
    // Reset session token after selection (billing optimization)
    resetSessionToken();
  };

  // Function to select entire USA (removes all specific regions)
  const selectEntireUSA = () => {
    setDeliveryRegions([{
      id: 'united-states',
      name: 'United States',
      fullName: 'United States (All)'
    }]);
  };

  const removeRegion = (regionId: string) => {
    // Prevent removing the last region - must have at least one delivery region
    if (deliveryRegions.length === 1) return;
    setDeliveryRegions(deliveryRegions.filter(r => r.id !== regionId));
  };

  // Get region type badge color
  const getRegionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'state': return 'bg-blue-100 text-blue-700';
      case 'city': return 'bg-green-100 text-green-700';
      case 'county': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) {
    return <StoreDetailsSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:ml-72">
      {/* Mobile/Tablet Submenu (visible on screens smaller than lg) */}
      <div className="lg:hidden mb-6">
        <div className="space-y-1">
          <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Settings
          </h3>
          <button
            onClick={() => setActiveSettingsTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeSettingsTab === 'general'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            General Information
          </button>
          <button
            onClick={() => setActiveSettingsTab('shipping')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeSettingsTab === 'shipping'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            Shipping
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {activeSettingsTab === 'general' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Logo Section */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-6">Store Logo</h3>
              <div className="flex items-center gap-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 bg-slate-50 rounded-full border-2 border-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80" 
                      alt="Store Logo" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div>
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors mb-2">
                    Change Logo
                  </button>
                  <p className="text-xs text-slate-500">Recommended 400x400px. JPG or PNG.</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Store Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                    defaultValue="My Awesome Store"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Segment</label>
                  <select className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm bg-white">
                    <option>Fashion & Apparel</option>
                    <option>Beauty & Cosmetics</option>
                    <option>Electronics</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="url" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                    defaultValue="https://myawesomestore.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="contact@store.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Address (Private) */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Business Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="123 Business Ave, Suite 100"
                      placeholder="Street and number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="San Francisco"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">State / Province</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="CA"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Zip / Postal Code</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="94107"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Country</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                      defaultValue="United States"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3" />
                  This address will not be publicly displayed on your store profile.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSettingsTab === 'shipping' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Delivery Regions */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Delivery Regions</h3>
                  <p className="text-sm text-slate-500 mt-1">Where do you ship your products?</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 flex items-start gap-2 max-w-xs">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Customers outside these regions will be unable to complete their purchase.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search US states, cities, or regions..." 
                    className="w-full pl-10 pr-10 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                    value={regionSearch}
                    onChange={(e) => setRegionSearch(e.target.value)}
                  />
                  {/* Loading indicator */}
                  {isSearchingRegions && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                  )}
                  {/* Suggestions Dropdown */}
                  {regionSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {regionSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => addRegion(suggestion)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center justify-between group border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">{suggestion.name}</p>
                              <p className="text-xs text-slate-500">{suggestion.fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRegionTypeBadgeColor(suggestion.type)}`}>
                              {suggestion.type}
                            </span>
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* No results message */}
                  {regionSearch.length >= 2 && !isSearchingRegions && regionSuggestions.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-4 text-center">
                      <p className="text-sm text-slate-500">No regions found for "{regionSearch}"</p>
                      <p className="text-xs text-slate-400 mt-1">Try searching for a US state or city</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {deliveryRegions.map((region) => (
                    <span key={region.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-700 border border-slate-200">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {/* Show fullName for specific regions (includes state), name for USA */}
                      <span className="font-medium">
                        {region.id === 'united-states' ? region.name : region.fullName}
                      </span>
                      {/* Allow removing if not the last region */}
                      {deliveryRegions.length > 1 && (
                        <button 
                          onClick={() => removeRegion(region.id)} 
                          className="ml-1 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {/* Show "Select Entire USA" button when specific regions are selected */}
                  {!deliveryRegions.some(r => r.id === 'united-states') && (
                    <button
                      onClick={selectEntireUSA}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="font-medium">Entire USA</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Shipping Methods</h3>
                  <p className="text-sm text-slate-500 mt-1">Define your shipping rates and times</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Method
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">Method Name</th>
                      <th className="px-4 py-3">Cost</th>
                      <th className="px-4 py-3">Estimated Time</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {shippingMethods.map((method) => (
                      <tr key={method.id} className="group hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{method.name}</td>
                        <td className="px-4 py-3">R$ {method.price}</td>
                        <td className="px-4 py-3 text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {method.duration}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 text-slate-400 hover:text-slate-600">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Free Shipping */}
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-md">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Free Shipping</h3>
                    <p className="text-sm text-slate-500 mt-1">Offer free shipping to specific regions</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={freeShippingEnabled}
                    onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {freeShippingEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-4 border-t border-slate-100"
                >
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Select Regions for Free Shipping</label>
                  <div className="flex flex-wrap gap-2">
                    {deliveryRegions.map(region => (
                      <label key={region.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          checked={freeShippingRegions.includes(region.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFreeShippingRegions([...freeShippingRegions, region.id]);
                            } else {
                              setFreeShippingRegions(freeShippingRegions.filter(id => id !== region.id));
                            }
                          }}
                        />
                        <span className="text-sm text-slate-700">{region.name}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const StoreIntegration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);
  const { profile, brand, influencer } = useUserProfile();

  const userProfileData = profile ? {
    profile,
    brand: brand || undefined,
    influencer: influencer || undefined
  } : null;
  
  // Track scroll state for header styling
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Tab state - initialize from URL param if available
  const initialTab = (searchParams.get('tab') as MyStoreTab) || 'orders';
  const [activeTab, setActiveTab] = useState<MyStoreTab>(
    ['orders', 'products', 'integrations', 'settings'].includes(initialTab) ? initialTab : 'orders'
  );
  const previousTabRef = useRef<MyStoreTab>(activeTab);
  
  // Advanced Filters State (Moved from OrdersProducts)
  const [activeFilter, setActiveFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedLives, setSelectedLives] = useState<string[]>([]);

  // Date Range State
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  // Product Search State (for Orders tab)
  const [orderProductSearch, setOrderProductSearch] = useState('');

  // Pagination for Orders
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const ordersPerPage = 10;
    
  const [activeIntegrationFilter, setActiveIntegrationFilter] = useState('All');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Sheet State
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Store Settings Tab State (lifted up for fixed submenu)
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'shipping'>('general');

  // Monitor scroll position for header styling
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
            setStatusDropdownOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Direction logic
  const getDirection = (): SlideDirection => {
    const currentIndex = TAB_CONFIG[activeTab].index;
    const previousIndex = TAB_CONFIG[previousTabRef.current].index;
    return currentIndex > previousIndex ? 'left' : 'right';
  };

  const handleTabChange = (newTab: MyStoreTab) => {
    if (newTab !== activeTab) {
      previousTabRef.current = activeTab;
      setActiveTab(newTab);
    }
  };

  const direction = getDirection();

  // Top Products simulation
  const topProductsList = useMemo(() => {
    return [...mockOrders]
        .sort((a, b) => parseFloat(b.total.replace('R$ ', '').replace(',', '.')) - parseFloat(a.total.replace('R$ ', '').replace(',', '.')))
        .slice(0, 3)
        .map(o => o.productName);
  }, []);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
        const orderDate = parseMockDate(order.date);
        
        // 1. Status Filter
        if (statusFilter !== 'All' && order.status !== statusFilter) {
            return false;
        }

        // 2. Quick Filters
        if (activeFilter === "Today's Orders") {
            const today = new Date('2025-11-21'); 
            if (orderDate.toDateString() !== today.toDateString()) return false;
        } else if (activeFilter === 'Top Products') {
            if (!topProductsList.includes(order.productName)) return false;
        }

        // 3. Date Range Filter
        if (dateRange.from) {
            if (orderDate < dateRange.from) return false;
        }
        if (dateRange.to) {
            if (orderDate > dateRange.to) return false;
        }

        // 4. Product Search Filter
        if (orderProductSearch) {
            if (!order.productName.toLowerCase().includes(orderProductSearch.toLowerCase())) {
                return false;
            }
        }

        // 5. Campaign & Live Filter
        if (selectedLives.length > 0) {
            if (!selectedLives.includes(order.sourceLive)) return false;
        }
        
        if (selectedCampaigns.length > 0 && selectedLives.length === 0) {
            // Get lives for selected campaigns
            const campaignLives = mockLives
                .filter(live => {
                    const campaign = mockCampaigns.find(c => c.id === live.campaignId);
                    return campaign && selectedCampaigns.includes(campaign.name);
                })
                .map(live => live.name);
            
            if (!campaignLives.includes(order.sourceLive)) return false;
        }

        return true;
    });
  }, [activeFilter, statusFilter, dateRange, orderProductSearch, selectedCampaigns, selectedLives, topProductsList]);

  // Pagination Logic
  const ordersTotalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
      (ordersCurrentPage - 1) * ordersPerPage,
      ordersCurrentPage * ordersPerPage
  );

  const handleOrdersPageChange = (page: number) => {
      if (page >= 1 && page <= ordersTotalPages) {
          setOrdersCurrentPage(page);
      }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const headers = ['Order ID', 'Customer', 'Product', 'Date', 'Total', 'Status', 'Source Live'];
    const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
            order.id,
            `"${order.customer}"`,
            `"${order.productName}"`,
            `"${order.date}"`,
            `"${order.total}"`,
            order.status,
            `"${order.sourceLive}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
        case 'Ativo': return 'bg-green-50 text-green-700 border-green-100';
        case 'Inativo': return 'bg-red-50 text-red-700 border-red-100';
        case 'Pausado': 
        case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'Completed': return 'bg-green-50 text-green-700 border-green-100';
        case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getIntegrationStatusStyles = (status: string) => {
    switch (status) {
      case 'Connected': return 'bg-green-50 text-green-700 border-green-100';
      case 'Available': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Coming Soon': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Mock data enhancement for sheet
  const handleOrderClick = (order: Order) => {
      // Find related live info
      const live = mockLives.find(l => l.name === order.sourceLive);
      const campaignName = live 
          ? mockCampaigns.find(c => c.id === live.campaignId)?.name 
          : 'Direct';

      // Generate items - some orders have multiple items for testing
      const baseItem = {
          name: order.productName,
          image: order.productImage,
          price: order.total,
          quantity: 1,
          sku: `LOV-${Math.floor(Math.random() * 1000)}`,
      };

      // Add extra items for orders with higher totals (simulating multi-item orders)
      const extraItems = order.id === '#ORD-7831' ? [
          {
              name: 'Blusa Cropped Verão',
              image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=150&q=80',
              price: 'R$ 89,90',
              quantity: 2,
              sku: 'LOV-221',
          },
          {
              name: 'Calça Wide Leg Premium',
              image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&q=80',
              price: 'R$ 159,90',
              quantity: 1,
              sku: 'LOV-445',
          }
      ] : [];

      const enrichedOrder: OrderDetailsData = {
          id: order.id,
          customer: {
              name: order.customer,
              email: `${order.customer.toLowerCase().replace(' ', '.')}@example.com`,
              phone: '(11) 99999-9999',
          },
          date: order.date,
          total: order.total,
          status: order.status,
          items: [baseItem, ...extraItems],
          source: {
              liveName: order.sourceLive,
              campaignName: campaignName || 'Unknown Campaign',
              date: order.date,
          },
          influencer: {
              name: 'Mariana Oliveira',
              image: order.influencerImage,
              handle: '@mariana_loviq',
              commission: 'R$ 29,90',
              commissionRate: '10%',
          },
          payment: {
              method: 'Credit Card',
              installments: '3x',
          },
      };
      
      setSelectedOrder(enrichedOrder);
      setIsSheetOpen(true);
  };

  const IntegrationsView = () => {
    const filteredIntegrations = activeIntegrationFilter === 'All' 
      ? mockIntegrations 
      : mockIntegrations.filter(i => i.category === activeIntegrationFilter || (activeIntegrationFilter === 'Connected' && i.status === 'Connected'));

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="h-10 w-96 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <IntegrationCardSkeleton />
                    <IntegrationCardSkeleton />
                    <IntegrationCardSkeleton />
                </div>
            </div>
        )
    }

    return (
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xs overflow-x-auto no-scrollbar">
                {['All', 'Connected', 'Ecommerce', 'Payment', 'Marketing'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveIntegrationFilter(filter)}
                        className={`px-4 py-2 rounded-xs text-sm font-medium transition-all whitespace-nowrap ${
                            activeIntegrationFilter === filter
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
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        className="block w-64 pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all shadow-sm"
                    />
                </div>
            </div>
        </div>

        {/* Integrations List: Horizontal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIntegrations.map((integration) => {
                const isShopify = integration.id === 'shopify';
                
                return (
                    <div 
                        key={integration.id} 
                        className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:border-purple-100 transition-all group"
                    >
                        {/* Header Row: Logo + Info + Status */}
                        <div className="flex items-start gap-4">
                            {/* Logo Container */}
                            <div className="w-14 h-14 flex-shrink-0 bg-slate-50 rounded-md flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                                <img 
                                    src={integration.logo} 
                                    alt={integration.name} 
                                    className="w-9 h-9 object-contain"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-slate-900">{integration.name}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wide border border-slate-200">
                                        {integration.category}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-1">
                                    {integration.description}
                                </p>
                            </div>

                            {/* Status Badge - Only show for non-Shopify integrations */}
                            {!isShopify && (
                                <div className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getIntegrationStatusStyles(integration.status)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        integration.status === 'Connected' ? 'bg-green-500' :
                                        integration.status === 'Available' ? 'bg-slate-400' :
                                        'bg-yellow-500'
                                    }`}></span>
                                    {integration.status}
                                </div>
                            )}
                        </div>

                        {/* Action Row */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            {isShopify ? (
                                <ShopifyConnectButton />
                            ) : integration.status === 'Connected' ? (
                                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                                    <Settings className="w-4 h-4" />
                                    Manage
                                </button>
                            ) : integration.status === 'Coming Soon' ? (
                                <button disabled className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-md cursor-not-allowed">
                                    Coming Soon
                                </button>
                            ) : (
                                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                    Connect
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
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
            <div className="grid grid-cols-4 bg-violet-50/80 rounded-xs p-1 items-center relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as MyStoreTab)}
                  className={`relative z-10 px-4 py-2 text-center text-xs font-semibold transition-colors duration-300 whitespace-nowrap rounded-xs ${
                    activeTab === tab.id
                      ? 'text-slate-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="mystore-active-pill"
                      className="absolute inset-0 bg-slate-900 rounded-xs shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ zIndex: -1 }}
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

            <UserMenu userProfile={userProfileData} isScrolled={isScrolled} />
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
            {activeTab === 'orders' && (
              <OrdersView 
                isLoading={isLoading}
                filteredOrders={filteredOrders}
                orderProductSearch={orderProductSearch}
                setOrderProductSearch={setOrderProductSearch}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleExportCSV={handleExportCSV}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                selectedCampaigns={selectedCampaigns}
                setSelectedCampaigns={setSelectedCampaigns}
                selectedLives={selectedLives}
                setSelectedLives={setSelectedLives}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                statusDropdownOpen={statusDropdownOpen}
                setStatusDropdownOpen={setStatusDropdownOpen}
                statusDropdownRef={statusDropdownRef}
                paginatedOrders={paginatedOrders}
                ordersCurrentPage={ordersCurrentPage}
                ordersPerPage={ordersPerPage}
                ordersTotalPages={ordersTotalPages}
                handleOrdersPageChange={handleOrdersPageChange}
                handleOrderClick={handleOrderClick}
                getStatusColor={getStatusColor}
                isExporting={isExporting}
              />
            )}
            {activeTab === 'products' && <ProductsView isLoading={isLoading} onOpenImportModal={() => setIsImportModalOpen(true)} />}
            {activeTab === 'integrations' && <IntegrationsView />}
            {activeTab === 'settings' && (
              <SettingsStoreView 
                isLoading={isLoading} 
                activeSettingsTab={activeSettingsTab} 
                setActiveSettingsTab={setActiveSettingsTab} 
              />
            )}
          </SlidingTabsTransition>
        </div>

        {/* Order Details Sheet */}
        <Sheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            className="sm:max-w-[600px]"
            hideHeader={true}
            noPadding={true}
        >
            {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setIsSheetOpen(false)} />}
        </Sheet>

        {/* Shopify Import Modal */}
        <ShopifyImportModal 
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImportComplete={() => {
                // In a real app, we would refresh the product list here
                console.log('Products imported successfully');
            }}
        />
      </main>

      {/* Store Settings Fixed Submenu - Outside main scroll container */}
      <AnimatePresence>
        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.2 } }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            className={`hidden lg:block fixed top-24 w-64 z-30 transition-all duration-300 ${isCollapsed ? 'left-[120px]' : 'left-80'}`}
          >
            <div className="space-y-1">
              <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Settings
              </h3>
              <button
                onClick={() => setActiveSettingsTab('general')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
                  activeSettingsTab === 'general'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4" />
                General Information
              </button>
              <button
                onClick={() => setActiveSettingsTab('shipping')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
                  activeSettingsTab === 'shipping'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4" />
                Shipping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store Settings Fixed Save Button - Outside main scroll container */}
      <AnimatePresence>
        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-8 z-40"
          >
            <button className="px-8 py-3 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoreIntegration;

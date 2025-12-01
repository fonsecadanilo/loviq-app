import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  ChevronDown, 
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
  SlidersHorizontal
} from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { SlidingTabsTransition, SlideDirection } from '../components/dashboard/SlidingTabsTransition';
import { ShopifyConnectButton } from '../components/shopify/ShopifyConnectButton';
import { ShopifyImportModal } from '../components/shopify/ShopifyImportModal';
import { type ConnectionStatus } from '../services/shopify';
import { Card, CardContent } from '../components/ui/Card';
import { Sheet } from '../components/ui/Sheet';
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
type MyStoreTab = 'orders' | 'products' | 'integrations' | 'details';

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
  details: { label: 'Store Details', index: 3 },
};

const tabs = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'details', label: 'Store Details' },
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
  getStatusColor
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
                    className="flex h-[44px] items-center gap-2 px-4 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
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

export const StoreIntegration: React.FC = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<MyStoreTab>('orders');
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

  // Sheet State
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const handleExportCSV = () => {
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

  const ProductsView = () => {
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
                    onClick={() => setIsImportModalOpen(true)}
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
                                                onClick={() => setIsImportModalOpen(true)}
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

  const StoreDetailsView = () => {
    if (isLoading) {
        return <StoreDetailsSkeleton />
    }

    return (
    <div className="max-w-5xl mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your store profile and public information</p>
            </div>
            <div className="flex gap-3">
                <button className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                    Cancel
                </button>
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200">
                    Save Changes
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Logo & Branding */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900 mb-6">Brand Assets</h3>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-4">
                            <div className="w-40 h-40 bg-slate-50 rounded-full border-4 border-white shadow-md flex items-center justify-center text-slate-400 overflow-hidden relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80" 
                                    alt="Store Logo" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0" />
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-md border border-slate-100 hover:bg-slate-50 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Store Logo</h4>
                        <p className="text-xs text-slate-500 mt-1 px-4">Recommended 400x400px. Supports JPG, PNG up to 2MB.</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                        <div className="p-2 bg-slate-50 rounded-md">
                            <Settings className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                            <p className="text-sm text-slate-500">Basic details about your business</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Store Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Store className="h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white placeholder-slate-400"
                                        placeholder="e.g. Fashion Boutique"
                                        defaultValue="My Awesome Store"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Segment</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <ShoppingBag className="h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    </div>
                                    <select className="w-full pl-10 pr-10 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white appearance-none text-slate-700">
                                        <option>Fashion & Apparel</option>
                                        <option>Beauty & Cosmetics</option>
                                        <option>Electronics</option>
                                        <option>Home & Living</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <div className="relative">
                                <textarea 
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white resize-none placeholder-slate-400"
                                    placeholder="Tell your customers about your store..."
                                    defaultValue="We sell the best fashion items for summer. Our products are sourced from sustainable materials and crafted with care."
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium bg-white pl-2">
                                    124/500
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                        <div className="p-2 bg-slate-50 rounded-md">
                            <CheckCircle2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
                            <p className="text-sm text-slate-500">How customers can reach you</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Public Email</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white"
                                placeholder="contact@store.com"
                                defaultValue="contact@myawesomestore.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Website</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white pr-10"
                                    placeholder="https://store.com"
                                    defaultValue="https://myawesomestore.com"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ExternalLink className="h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
      <main className="flex-1 bg-[#FAFAFA] flex flex-col h-full relative overflow-y-auto">
        
        {/* Header with Tabs */}
        <header className="flex-shrink-0 flex z-30 pt-4 pr-8 pb-2 pl-8 relative backdrop-blur-xl items-center justify-between">
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
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-px bg-slate-200 h-6 my-1"></div>
            <button className="flex hover:bg-slate-50 transition-all group rounded-xl pt-1 pr-1 pb-1 pl-1 gap-y-3 items-center gap-x-2">
              <div className="relative flex-shrink-0">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Marcus" className="w-8 h-8 rounded-full bg-slate-100 object-cover ring-2 ring-white shadow-sm" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </header>

        {/* Main Content with Transition */}
        <div className="flex-1">
          <SlidingTabsTransition
            tabKey={activeTab}
            direction={direction}
            duration={0.25}
            offset={50}
            className="h-full overflow-y-auto px-8 py-6"
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
              />
            )}
            {activeTab === 'products' && <ProductsView />}
            {activeTab === 'integrations' && <IntegrationsView />}
            {activeTab === 'details' && <StoreDetailsView />}
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
    </div>
  );
};

export default StoreIntegration;

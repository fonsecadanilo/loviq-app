import React, { useState, useRef } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { SlidingTabsTransition, SlideDirection } from '../components/dashboard/SlidingTabsTransition';
import { ShopifyConnectButton } from '../components/shopify/ShopifyConnectButton';
import { type ConnectionStatus } from '../services/shopify';
import { Card, CardContent } from '../components/ui/Card';
import { useSidebar } from '../contexts/SidebarContext';

// Types
type MyStoreTab = 'orders' | 'products' | 'integrations' | 'details';

// Mock Data (from OrdersProducts)
interface Product {
    id: string;
    name: string;
    price: string;
    sku: string;
    status: 'Ativo' | 'Inativo' | 'Pausado';
    image: string;
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

// ... (keep mockOrders, mockProducts, mockCampaigns, mockLives as they were)
const mockOrders: Order[] = [
    { id: '#ORD-7829', customer: 'Ana Silva', date: '21 Nov, 2025', total: 'R$ 299,70', status: 'Completed', sourceLive: 'Lançamento Verão 2025', influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', productName: 'Vestido Floral Verão', productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=150&q=80' },
    { id: '#ORD-7830', customer: 'Carlos Souza', date: '21 Nov, 2025', total: 'R$ 89,90', status: 'Processing', sourceLive: 'Live Shopping Night', influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', productName: 'Camiseta Básica Premium', productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&q=80' },
    { id: '#ORD-7831', customer: 'Mariana Oliveira', date: '20 Nov, 2025', total: 'R$ 450,00', status: 'Completed', sourceLive: 'Lançamento Verão 2025', influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', productName: 'Conjunto Alfaiataria', productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&q=80' },
    { id: '#ORD-7832', customer: 'Pedro Santos', date: '20 Nov, 2025', total: 'R$ 119,90', status: 'Pending', sourceLive: 'Organic', influencerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', productName: 'Boné Streetwear', productImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=150&q=80' },
    { id: '#ORD-7833', customer: 'Julia Lima', date: '19 Nov, 2025', total: 'R$ 75,50', status: 'Cancelled', sourceLive: 'Live Shopping Night', influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', productName: 'Acessório Colar Prata', productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=150&q=80' },
];

const mockProducts: Product[] = [
    { id: '1', name: 'Sérum Facial Vitamina C', price: 'R$ 89,90', sku: 'LOV-SERUM-01', status: 'Ativo', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&q=80' },
    { id: '2', name: 'Creme Hidratante Noturno', price: 'R$ 119,90', sku: 'LOV-CREME-03', status: 'Ativo', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=150&q=80' },
    { id: '3', name: 'Kit Verão (Ed. Limitada)', price: 'R$ 249,00', sku: 'LOV-KIT-SUMMER24', status: 'Inativo', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&q=80' },
    { id: '4', name: 'Protetor Solar FPS 50', price: 'R$ 75,50', sku: 'LOV-SUN-02', status: 'Pausado', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=150&q=80' },
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

export const StoreIntegration: React.FC = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<MyStoreTab>('orders');
  const previousTabRef = useRef<MyStoreTab>(activeTab);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeIntegrationFilter, setActiveIntegrationFilter] = useState('All');

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

  // Sub-components for Tabs
  const OrdersView = () => (
    <>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 gap-x-4 gap-y-4">
            {/* Total Sales */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Total Sales
                    </p>
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <ShoppingBag className="w-4 h-4 text-purple-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                        1,234
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">+12.5%</span>
                        <span className="text-xs text-slate-400 ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Total Revenue
                    </p>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                        R$ 125.4k
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">+8.2%</span>
                        <span className="text-xs text-slate-400 ml-1">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Avg. Ticket */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Avg. Ticket
                    </p>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                </div>
                <div className="">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                        R$ 101,64
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-slate-500">0.8%</span>
                        <span className="text-xs text-slate-400 ml-1">stable</span>
                    </div>
                </div>
            </div>

             {/* Conversion Rate */}
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-purple-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Conversion Rate
                    </p>
                    <div className="p-2 bg-orange-50 rounded-lg">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
                {['All', "Today's Orders", 'Top Products'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
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
                        {mockOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 text-sm font-medium text-purple-600">{order.id}</td>
                                <td className="px-6 py-5 text-sm text-slate-900 font-medium">{order.customer}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <img src={order.productImage} alt={order.productName} className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-white" />
                                        <span className="text-sm text-slate-600 truncate max-w-[150px]">{order.productName}</span>
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
                                    <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
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
                    Showing <span className="font-medium">1-{mockOrders.length}</span> of <span className="font-medium">{mockOrders.length}</span> orders
                </div>
                <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </>
  );

  const ProductsView = () => (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar produtos..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all shadow-sm"
                />
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm">
                <Plus className="h-4 w-4" />
                Cadastrar Produto
            </button>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {mockProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
                                        <span className="text-sm font-medium text-slate-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{product.price}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{product.sku}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const IntegrationsView = () => {
    const filteredIntegrations = activeIntegrationFilter === 'All' 
      ? mockIntegrations 
      : mockIntegrations.filter(i => i.category === activeIntegrationFilter || (activeIntegrationFilter === 'Connected' && i.status === 'Connected'));

    return (
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
                {['All', 'Connected', 'Ecommerce', 'Payment', 'Marketing'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveIntegrationFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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
                        className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 hover:border-purple-100 transition-all group"
                    >
                        {/* Header Row: Logo + Info + Status */}
                        <div className="flex items-start gap-4">
                            {/* Logo Container */}
                            <div className="w-14 h-14 flex-shrink-0 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
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
                                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                                    <Settings className="w-4 h-4" />
                                    Manage
                                </button>
                            ) : integration.status === 'Coming Soon' ? (
                                <button disabled className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-xl cursor-not-allowed">
                                    Coming Soon
                                </button>
                            ) : (
                                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
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

  const StoreDetailsView = () => (
    <div className="max-w-5xl mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your store profile and public information</p>
            </div>
            <div className="flex gap-3">
                <button className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    Cancel
                </button>
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200">
                    Save Changes
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Logo & Branding */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
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
                <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                        <div className="p-2 bg-slate-50 rounded-xl">
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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white placeholder-slate-400"
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
                                    <select className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white appearance-none text-slate-700">
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
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white resize-none placeholder-slate-400"
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

                <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                        <div className="p-2 bg-slate-50 rounded-xl">
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
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white"
                                placeholder="contact@store.com"
                                defaultValue="contact@myawesomestore.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Website</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm transition-all bg-white pr-10"
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
            <div className="grid grid-cols-4 bg-violet-50/80 rounded-lg p-1 items-center relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as MyStoreTab)}
                  className={`relative z-10 px-4 py-2 text-center text-xs font-semibold transition-colors duration-300 whitespace-nowrap rounded-[6px] ${
                    activeTab === tab.id
                      ? 'text-slate-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="mystore-active-pill"
                      className="absolute inset-0 bg-slate-900 rounded-[6px] shadow-sm"
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
            {activeTab === 'orders' && <OrdersView />}
            {activeTab === 'products' && <ProductsView />}
            {activeTab === 'integrations' && <IntegrationsView />}
            {activeTab === 'details' && <StoreDetailsView />}
          </SlidingTabsTransition>
        </div>
      </main>
    </div>
  );
};

export default StoreIntegration;

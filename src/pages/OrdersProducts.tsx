import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Search, Plus, MoreVertical, ShoppingBag, DollarSign, TrendingUp, ChevronDown, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

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

interface Live {
    id: string;
    name: string;
    campaignId: string;
    influencerImage: string;
}

interface Campaign {
    id: string;
    name: string;
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

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Sérum Facial Vitamina C',
        price: 'R$ 89,90',
        sku: 'LOV-SERUM-01',
        status: 'Ativo',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&q=80',
    },
    {
        id: '2',
        name: 'Creme Hidratante Noturno',
        price: 'R$ 119,90',
        sku: 'LOV-CREME-03',
        status: 'Ativo',
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=150&q=80',
    },
    {
        id: '3',
        name: 'Kit Verão (Ed. Limitada)',
        price: 'R$ 249,00',
        sku: 'LOV-KIT-SUMMER24',
        status: 'Inativo',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&q=80',
    },
    {
        id: '4',
        name: 'Protetor Solar FPS 50',
        price: 'R$ 75,50',
        sku: 'LOV-SUN-02',
        status: 'Pausado',
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=150&q=80',
    },
];

const mockOrders: Order[] = [
    {
        id: '#ORD-7829',
        customer: 'Ana Silva',
        date: '21 Nov, 2025',
        total: 'R$ 299,70',
        status: 'Completed',
        sourceLive: 'Lançamento Verão 2025',
        influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        productName: 'Vestido Floral Verão',
        productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=150&q=80',
    },
    {
        id: '#ORD-7830',
        customer: 'Carlos Souza',
        date: '21 Nov, 2025',
        total: 'R$ 89,90',
        status: 'Processing',
        sourceLive: 'Live Shopping Night',
        influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
        productName: 'Camiseta Básica Premium',
        productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&q=80',
    },
    {
        id: '#ORD-7831',
        customer: 'Mariana Oliveira',
        date: '20 Nov, 2025',
        total: 'R$ 450,00',
        status: 'Completed',
        sourceLive: 'Lançamento Verão 2025',
        influencerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        productName: 'Conjunto Alfaiataria',
        productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&q=80',
    },
    {
        id: '#ORD-7832',
        customer: 'Pedro Santos',
        date: '20 Nov, 2025',
        total: 'R$ 119,90',
        status: 'Pending',
        sourceLive: 'Organic',
        influencerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
        productName: 'Boné Streetwear',
        productImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=150&q=80',
    },
    {
        id: '#ORD-7833',
        customer: 'Julia Lima',
        date: '19 Nov, 2025',
        total: 'R$ 75,50',
        status: 'Cancelled',
        sourceLive: 'Live Shopping Night',
        influencerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
        productName: 'Acessório Colar Prata',
        productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=150&q=80',
    },
];

export const OrdersProducts: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
    const [activeFilter, setActiveFilter] = useState('All');

    // Advanced Filters State
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
    const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
    const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

    const [selectedLives, setSelectedLives] = useState<string[]>([]);
    const [liveDropdownOpen, setLiveDropdownOpen] = useState(false);
    const [liveSearchQuery, setLiveSearchQuery] = useState('');

    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    // Refs for click outside (simple implementation for now, ideally use a hook)
    const campaignDropdownRef = React.useRef<HTMLDivElement>(null);
    const liveDropdownRef = React.useRef<HTMLDivElement>(null);
    const statusDropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(event.target as Node)) {
                setCampaignDropdownOpen(false);
            }
            if (liveDropdownRef.current && !liveDropdownRef.current.contains(event.target as Node)) {
                setLiveDropdownOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setStatusDropdownOpen(false);
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

    const toggleCampaign = (campaignName: string) => {
        setSelectedCampaigns(prev =>
            prev.includes(campaignName)
                ? prev.filter(name => name !== campaignName)
                : [...prev, campaignName]
        );
        // Reset live selection when campaign changes if needed, or keep it. 
        // For now, let's keep it simple.
    };

    const toggleLive = (liveName: string) => {
        setSelectedLives(prev =>
            prev.includes(liveName)
                ? prev.filter(name => name !== liveName)
                : [...prev, liveName]
        );
    };

    const filteredOrders = mockOrders.filter(order => {
        // 1. Status Filter
        if (statusFilter !== 'All' && order.status !== statusFilter) {
            return false;
        }

        // 2. Quick Filters
        if (activeFilter === "Today's Orders") {
            // Mock logic: check if date is "21 Nov, 2025" (assuming today is 21 Nov for mock data)
            // In a real app, we'd compare Date objects
            if (order.date !== '21 Nov, 2025') return false;
        }
        // "Top Products" logic omitted for simplicity, or could just be a sort

        // 3. Live Filter
        if (selectedLives.length > 0) {
            if (!selectedLives.includes(order.sourceLive)) {
                return false;
            }
        }

        // 4. Campaign Filter
        // If lives are selected, we assume they are already filtered by campaign if needed.
        // But if ONLY campaign is selected (and no specific lives), we should show all orders from that campaign's lives.
        if (selectedCampaigns.length > 0 && selectedLives.length === 0) {
            // Find lives for selected campaigns
            const campaignLives = mockLives
                .filter(live => selectedCampaigns.includes(
                    mockCampaigns.find(c => c.id === live.campaignId)?.name || ''
                ))
                .map(live => live.name);

            if (!campaignLives.includes(order.sourceLive)) {
                return false;
            }
        }

        return true;
    });

    const clearCampaignFilter = () => {
        setSelectedCampaigns([]);
    };

    const clearLiveFilter = () => {
        setSelectedLives([]);
    };

    // Pagination for Orders
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Pagination for Products
    const [productsCurrentPage, setProductsCurrentPage] = useState(1);
    const productsPerPage = 10;

    // Paginated Orders
    const ordersTotalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = filteredOrders.slice(
        (ordersCurrentPage - 1) * ordersPerPage,
        ordersCurrentPage * ordersPerPage
    );

    // Paginated Products
    const productsTotalPages = Math.ceil(mockProducts.length / productsPerPage);
    const paginatedProducts = mockProducts.slice(
        (productsCurrentPage - 1) * productsPerPage,
        productsCurrentPage * productsPerPage
    );

    const handleOrdersPageChange = (page: number) => {
        if (page >= 1 && page <= ordersTotalPages) {
            setOrdersCurrentPage(page);
        }
    };

    const handleProductsPageChange = (page: number) => {
        if (page >= 1 && page <= productsTotalPages) {
            setProductsCurrentPage(page);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ativo':
                return 'bg-green-100 text-green-700';
            case 'Inativo':
                return 'bg-red-100 text-red-700';
            case 'Pausado':
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'Completed':
                return 'bg-green-100 text-green-700';
            case 'Processing':
                return 'bg-blue-100 text-blue-700';
            case 'Cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] lg:pl-[280px]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="px-4 py-8 sm:px-6 lg:px-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Orders & Products</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Manage your orders and product inventory</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        className={`pb-2 px-1 text-sm font-medium mr-8 transition-colors relative ${activeTab === 'orders'
                            ? 'text-[#7D2AE8]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                        {activeTab === 'orders' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7D2AE8]" />
                        )}
                    </button>
                    <button
                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'products'
                            ? 'text-[#7D2AE8]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                        {activeTab === 'products' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7D2AE8]" />
                        )}
                    </button>
                </div>

                {activeTab === 'products' && (
                    <>
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7D2AE8] focus:border-[#7D2AE8] sm:text-sm"
                                />
                            </div>
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7D2AE8] text-white px-4 py-2 rounded-lg hover:bg-[#6d24ca] transition-colors font-medium text-sm">
                                <Plus className="h-4 w-4" />
                                Cadastrar Produto
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                NOME
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                PREÇO
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                STATUS
                                            </th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="h-10 w-10 rounded-lg object-cover border border-gray-100"
                                                        />
                                                        <span>{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.sku}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Products Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(productsCurrentPage - 1) * productsPerPage + 1}</span> to <span className="font-medium">{Math.min(productsCurrentPage * productsPerPage, mockProducts.length)}</span> of <span className="font-medium">{mockProducts.length}</span> results
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleProductsPageChange(productsCurrentPage - 1)}
                                        disabled={productsCurrentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: productsTotalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handleProductsPageChange(page)}
                                            className={`px-3 py-1 border rounded-md text-sm font-medium ${productsCurrentPage === page
                                                ? 'bg-[#7D2AE8] text-white border-[#7D2AE8]'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleProductsPageChange(productsCurrentPage + 1)}
                                        disabled={productsCurrentPage === productsTotalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'orders' && (
                    <>
                        {/* Quick Filters & Advanced Filters */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                                {['All', "Today's Orders", 'Top Products'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === filter
                                            ? 'bg-[#7D2AE8] text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 items-center w-full lg:w-auto">
                                {/* Campaign Filter */}
                                <div className="relative" ref={campaignDropdownRef}>
                                    <button
                                        onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
                                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors min-w-[200px]"
                                    >
                                        <p className="text-sm font-normal text-gray-600">
                                            Filter by Campaign {selectedCampaigns.length > 0 && `(${selectedCampaigns.length})`}
                                        </p>
                                        {selectedCampaigns.length > 0 ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearCampaignFilter();
                                                }}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {campaignDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
                                                    <label
                                                        key={campaign.id}
                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                    >
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

                                            {selectedCampaigns.length > 0 && (
                                                <div className="p-3 border-t border-gray-100">
                                                    <button
                                                        onClick={clearCampaignFilter}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Clear filter
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Live Filter */}
                                <div className="relative" ref={liveDropdownRef}>
                                    <button
                                        onClick={() => setLiveDropdownOpen(!liveDropdownOpen)}
                                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors min-w-[200px]"
                                    >
                                        <p className="text-sm font-normal text-gray-600">
                                            Filter by Live {selectedLives.length > 0 && `(${selectedLives.length})`}
                                        </p>
                                        {selectedLives.length > 0 ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearLiveFilter();
                                                }}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {liveDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
                                                    <label
                                                        key={live.id}
                                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200 group"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLives.includes(live.name)}
                                                            onChange={() => toggleLive(live.name)}
                                                            className="w-4 h-4 text-[#7D2AE8] border-gray-300 rounded focus:ring-[#7D2AE8]"
                                                        />
                                                        <img
                                                            src={live.influencerImage}
                                                            alt={live.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                        />
                                                        <span className="text-sm text-gray-900 group-hover:text-[#7D2AE8] transition-colors">{live.name}</span>
                                                    </label>
                                                ))}
                                                {filteredLives.length === 0 && (
                                                    <div className="p-4 text-center text-sm text-gray-500">
                                                        No lives found
                                                    </div>
                                                )}
                                            </div>

                                            {selectedLives.length > 0 && (
                                                <div className="p-3 border-t border-gray-100">
                                                    <button
                                                        onClick={clearLiveFilter}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Clear filter
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Status Filter */}
                                <div className="relative" ref={statusDropdownRef}>
                                    <button
                                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white px-4 border border-gray-200 hover:bg-gray-50 transition-colors min-w-[160px]"
                                    >
                                        <p className="text-sm font-normal text-gray-600">
                                            {statusFilter === 'All' ? 'Filter by Status' : statusFilter}
                                        </p>
                                        {statusFilter !== 'All' ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setStatusFilter('All');
                                                }}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {statusDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <div className="p-2">
                                                {['All', 'Completed', 'Processing', 'Pending', 'Cancelled'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setStatusFilter(status);
                                                            setStatusDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === status
                                                            ? 'bg-[#7D2AE8] text-white'
                                                            : 'text-gray-900 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {status === 'All' ? 'All Statuses' : status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <Card className="border-[#E2E8F0]">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Sales</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
                                    </div>
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <ShoppingBag className="w-5 h-5 text-[#7D2AE8]" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-[#E2E8F0]">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">R$ 125.430,00</p>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-[#E2E8F0]">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Avg. Ticket</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">R$ 101,64</p>
                                    </div>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ORDER ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                CUSTOMER
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                PRODUCT
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                DATE
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                TOTAL
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                STATUS
                                            </th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#7D2AE8]">
                                                    {order.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.customer}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={order.productImage}
                                                            alt={order.productName}
                                                            className="h-8 w-8 rounded-lg object-cover border border-gray-100"
                                                        />
                                                        <span className="font-medium text-gray-900">{order.productName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.total}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Orders Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(ordersCurrentPage - 1) * ordersPerPage + 1}</span> to <span className="font-medium">{Math.min(ordersCurrentPage * ordersPerPage, filteredOrders.length)}</span> of <span className="font-medium">{filteredOrders.length}</span> results
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOrdersPageChange(ordersCurrentPage - 1)}
                                        disabled={ordersCurrentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handleOrdersPageChange(page)}
                                            className={`px-3 py-1 border rounded-md text-sm font-medium ${ordersCurrentPage === page
                                                    ? 'bg-[#7D2AE8] text-white border-[#7D2AE8]'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleOrdersPageChange(ordersCurrentPage + 1)}
                                        disabled={ordersCurrentPage === ordersTotalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

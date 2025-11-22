import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Card, CardContent } from '../components/ui/Card';
import { DollarSign, TrendingUp, Ticket, Plus, Search, ChevronDown, MoreVertical, Video, Package, X, FolderX, Inbox } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Pending';
  products: string;
  productIds: string[];
  influencers: string[];
  lives: number;
  sales: number;
  revenue: string;
  scheduledLives: number;
}

interface Product {
  id: string;
  name: string;
}

const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Fall Collection Launch',
    status: 'Active',
    products: '3 products',
    productIds: ['prod-1', 'prod-2', 'prod-3'],
    lives: 5,
    sales: 127,
    revenue: '$8,450',
    scheduledLives: 3,
    influencers: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpMz_cLwka22cjXHV7KiWVgu6tZyKSwUSthOgRpzPpep667j8Sju0aVeazxM2aeK-q1Yk_HGAygf9-bSWtPFiC5dJ5eFVhljjvcj4Py0S7jVFVwA48Tsi0uXmM47xHJCJKNJxzZscGV3HCpl9WkPTPN3C9XVxFRCulo3yWKLSnHJbEHpoz9visJnOqbhOwG9jt0-7zhx8Y2SofvWLebt0r4IiCw93qGKO3dBOV8TrxaZqSWOk9uPZ_j2EcPRJVxgsRyGI-eShN3_3v',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBytLbeKvZW_P67huebQW0bolAwVNpG38HJU3v2R8UnCTPDJaUB7zRTB0QmZqwtzblRvkdeu6AuEy59NISytAASWNVgDKnoei4qe3-zOUDPccP3vajwwtPUlr7pg3r4d0qey0DOaL3rrtx1b7lQrFB30BlLK-afp3enf9VHplT1F8R4wBUB2p8MrFkzye9LP_I-pxmiuPO-Ym2Haxgsfqd0AerVh-mdznJalUbEd2h9MRsu5pVd_9zsd_o4r8tqvIwfcIvsRXArqB0e',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsR-fUax_dmokKp0NBUcCQb2BIDD6BFYMwn5d8AZO_NSLPUkvoLGU_oGOyBP-_YOhYhgI4H9wmEblbndwNFTasPunUq8jrVQzUSrZqeet-lj4QRTjInvX-d0_6D1FnigicPdPte_j2Te41CK24TNEYx9tKuTIQH2GqSlltoMOcU0mnfPI96GUA3F-5qL44pBw5PDTWGMRhaZSBgs-RJk7HhHnAdC7RKUzXIgVpfZZeVddGb0_KJYi5mZLgTWTdRooPtXUiUyKCAJce'
    ]
  },
  {
    id: '2',
    name: 'New Facial Serum Review',
    status: 'Completed',
    products: '1 product',
    productIds: ['prod-4'],
    lives: 2,
    sales: 89,
    revenue: '$3,280',
    scheduledLives: 0,
    influencers: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4OzoUsM8iv_XzLHVOt8rF18brVM1rngYBHIhObkIMb1bb89mCrsUuQlFTKofxUwemkl981Vr_MUKu52WSylYKy-cUaxTUZ4O9QArnYdcQA1-VmDf8QkL2KXdQzBSwJGtrWEt2ilUNKJ31YMdgtLtI6Py85TMAFwtymIiqntgRZyXjaqPYM0bJxEEpEDK10bNea1RO5FoYSy9wT-0ANJiNdOVvuyN3z3fK4ZTdTMH8SfyIaQXP2rXNDKszqF2rWDD2T7ioTB7ss0Zf'
    ]
  },
  {
    id: '3',
    name: 'Beta Test New Feature',
    status: 'Pending',
    products: '2 products',
    productIds: ['prod-2', 'prod-5'],
    lives: 0,
    sales: 0,
    revenue: '$0',
    scheduledLives: 5,
    influencers: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwpkW04GqsSWPOyrKbTGAm3WwtAmgaBmNJLxqNS3UfeXpYP34-EHuNWI2bwDvhLJQ45T5XrQl298D7TRsBlM-smviDgteYyV04MUjtfIB404DWySlCQ31jKrOACsj5m22GAsKsIOn28pEtCx4nkXb4r4btAANYFTLVl6M4W15pyznOW_foH8EjTHHiRQPuaCv9XZitZvMncoASfCrGOEW28TYgpVwv4oEs9jfZgadrLjQ40ll-ky7mYAeG90dStZdXr5VnuKFPIlET',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC68_n5jcMZ97JLsLV9CE0NpE-CvCTXNnYWb3WAuGEEK3qjq-aZeqyz4dEf-6yvQS0NG_XykKwZxdRr8oVuE8iIgIQ98iwzPIRpx5cD9_6Q1ZxC4x2qZQ0I-iR6VPPKBFGmB38wtbu4IxCH9V7nsfkw6uW1L0Ej_8WlA7uf7KWLAns8efJNH50fZ2WlWf9MCNlwhBgTwZwW3eW_4x6ubxYYItzgaBWlGB3SETYFqMMvSD3c3cZIWFtB6gl8E5-Y2IdqKLZqFceDlM5N'
    ]
  }
];

const availableProducts: Product[] = [
  { id: 'prod-1', name: 'Winter Jacket' },
  { id: 'prod-2', name: 'Running Shoes' },
  { id: 'prod-3', name: 'Casual Shirt' },
  { id: 'prod-4', name: 'Facial Serum Pro' },
  { id: 'prod-5', name: 'Smart Watch' },
  { id: 'prod-6', name: 'Yoga Mat' },
  { id: 'prod-7', name: 'Protein Powder' },
];

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const stats = [
    {
      title: 'Sales last month',
      value: '$12,435.20',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Products sold last month',
      value: '245',
      icon: Package,
      bgColor: 'bg-purple-100',
      iconColor: 'text-[#7D2AE8]'
    },
    {
      title: 'Average ticket',
      value: '$189.50',
      icon: Ticket,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setProductDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter(product =>
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [productSearchQuery]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter;
      const matchesProduct = selectedProducts.length === 0 ||
        selectedProducts.some(productId => campaign.productIds.includes(productId));

      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [searchQuery, statusFilter, selectedProducts]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const clearProductFilter = () => {
    setSelectedProducts([]);
  };

  const getStatusBadgeClass = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'Completed':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:pl-[280px]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and track your live commerce campaigns</p>
          </div>
          <button
            onClick={() => navigate('/campaigns/create')}
            className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg h-11 px-5 bg-[#7D2AE8] text-white text-sm font-bold shadow-sm hover:bg-[#6920C7] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="truncate">Create New Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border-[#E2E8F0]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white dark:bg-background-dark dark:border dark:border-white/20 border border-border-soft">
                <div className="text-text-secondary-dark dark:text-white/60 flex items-center justify-center pl-4">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-dark dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-text-secondary-dark dark:placeholder:text-white/60 px-2 text-base font-normal leading-normal"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </label>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative" ref={productDropdownRef}>
              <button
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-background-dark dark:border dark:border-white/20 px-4 border border-border-soft hover:bg-gray-50 transition-colors min-w-[200px]"
              >
                <p className="text-sm font-normal text-text-primary-dark dark:text-white">
                  Filter by Product {selectedProducts.length > 0 && `(${selectedProducts.length})`}
                </p>
                {selectedProducts.length > 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearProductFilter();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary-dark dark:text-white/60" />
                )}
              </button>

              {productDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-background-dark border border-border-soft dark:border-white/20 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-border-soft dark:border-white/10">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredProducts.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 text-[#7D2AE8] border-gray-300 rounded focus:ring-[#7D2AE8]"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{product.name}</span>
                      </label>
                    ))}
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="p-3 border-t border-border-soft dark:border-white/10">
                      <button
                        onClick={clearProductFilter}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-white/60 dark:hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-background-dark dark:border dark:border-white/20 px-4 border border-border-soft hover:bg-gray-50 transition-colors min-w-[160px]"
              >
                <p className="text-sm font-normal text-text-primary-dark dark:text-white">
                  {statusFilter === 'All' ? 'Filter by Status' : statusFilter}
                </p>
                {statusFilter !== 'All' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFilter('All');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary-dark dark:text-white/60" />
                )}
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-background-dark border border-border-soft dark:border-white/20 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setStatusFilter('All');
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'All'
                        ? 'bg-[#7D2AE8] text-white'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('Active');
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'Active'
                        ? 'bg-[#7D2AE8] text-white'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('Completed');
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'Completed'
                        ? 'bg-[#7D2AE8] text-white'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('Pending');
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'Pending'
                        ? 'bg-[#7D2AE8] text-white'
                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500">
            Campaigns ({filteredCampaigns.length})
          </h2>
        </div>

        <div className="space-y-3">
          {campaigns.length === 0 ? (
            // Empty state - No campaigns at all
            <Card className="border-[#E2E8F0]">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Get started by creating your first live commerce campaign and reach your audience.
                  </p>
                  <button
                    onClick={() => navigate('/campaigns/create')}
                    className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-[#7D2AE8] text-white text-sm font-bold shadow-sm hover:bg-[#6920C7] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Campaign
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : filteredCampaigns.length === 0 ? (
            // Empty state - No results from filters
            <Card className="border-[#E2E8F0]">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <FolderX className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    No campaigns match your current filters. Try adjusting your search or filters.
                  </p>
                  <div className="flex gap-3">
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={clearProductFilter}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear Product Filter
                      </button>
                    )}
                    {statusFilter !== 'All' && (
                      <button
                        onClick={() => setStatusFilter('All')}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear Status Filter
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Campaign list
            filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="border-[#E2E8F0] hover:shadow-md transition-shadow">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side - Campaign info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{campaign.name}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5 text-[#7D2AE8]">
                          <Video className="w-4 h-4" />
                          <span className="font-medium">{campaign.lives} Lives</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-medium">Products:</span> {campaign.products}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">Influencers:</span>
                          <div className="flex -space-x-2">
                            {campaign.influencers.map((avatar, idx) => (
                              <div
                                key={idx}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-background-dark bg-cover bg-center"
                                style={{ backgroundImage: `url('${avatar}')` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Metrics */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Sales</p>
                        <p className="text-base font-bold text-gray-900">{campaign.sales}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Revenue</p>
                        <p className="text-base font-bold text-green-600">{campaign.revenue}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Scheduled</p>
                        <p className="text-base font-bold text-blue-600">{campaign.scheduledLives}</p>
                      </div>
                      <button className="ml-2 text-gray-400 hover:text-[#7D2AE8] transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Campaigns;
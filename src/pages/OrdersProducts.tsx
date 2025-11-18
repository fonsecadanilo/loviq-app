import React, { useEffect, useMemo, useState } from 'react';
import BrandLayout from '../components/dashboard/BrandLayout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SortAsc, SortDesc, Search as SearchIcon, FilterX } from 'lucide-react';
import { t } from '../lib/i18n';

type OrderStatus = 'Pending' | 'Paid' | 'Fulfilled' | 'Cancelled';
type ProductStatus = 'Active' | 'Inactive';

type Order = {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: OrderStatus;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string;
};

const initialOrders: Order[] = [
  { id: 'ORD-1001', date: '2025-11-10', customer: 'Alice Johnson', amount: 129.9, status: 'Pending' },
  { id: 'ORD-1002', date: '2025-11-11', customer: 'Michael Chen', amount: 276.0, status: 'Paid' },
  { id: 'ORD-1003', date: '2025-11-11', customer: 'Emily Rodriguez', amount: 89.0, status: 'Fulfilled' },
  { id: 'ORD-1004', date: '2025-11-12', customer: 'John Smith', amount: 54.5, status: 'Cancelled' },
  { id: 'ORD-1005', date: '2025-11-12', customer: 'Sarah Lee', amount: 199.0, status: 'Paid' },
  { id: 'ORD-1006', date: '2025-11-13', customer: 'David Kim', amount: 72.3, status: 'Pending' },
  { id: 'ORD-1007', date: '2025-11-13', customer: 'Laura Martinez', amount: 512.5, status: 'Fulfilled' },
  { id: 'ORD-1008', date: '2025-11-14', customer: 'Robert Brown', amount: 38.9, status: 'Cancelled' },
  { id: 'ORD-1009', date: '2025-11-14', customer: 'Julia Davis', amount: 86.0, status: 'Paid' },
  { id: 'ORD-1010', date: '2025-11-15', customer: 'Chris Wilson', amount: 145.2, status: 'Pending' },
  { id: 'ORD-1011', date: '2025-11-15', customer: 'Emma Thompson', amount: 320.0, status: 'Fulfilled' },
  { id: 'ORD-1012', date: '2025-11-16', customer: 'Noah Walker', amount: 64.7, status: 'Cancelled' },
  { id: 'ORD-1013', date: '2025-11-16', customer: 'Olivia Hall', amount: 98.3, status: 'Paid' },
  { id: 'ORD-1014', date: '2025-11-17', customer: 'Liam Young', amount: 210.5, status: 'Pending' },
  { id: 'ORD-1015', date: '2025-11-17', customer: 'Ava Hernandez', amount: 450.9, status: 'Fulfilled' },
  { id: 'ORD-1016', date: '2025-11-18', customer: 'Ethan Robinson', amount: 73.4, status: 'Cancelled' },
];

const initialProducts: Product[] = [
  { id: 'PRD-2001', name: 'Wireless Headphones', sku: 'WH-01', price: 129.9, stock: 42, status: 'Active', imageUrl: 'https://picsum.photos/seed/headphones/200/200' },
  { id: 'PRD-2002', name: 'Smartwatch Pro', sku: 'SW-PRO', price: 276.0, stock: 12, status: 'Active', imageUrl: 'https://picsum.photos/seed/smartwatch/200/200' },
  { id: 'PRD-2003', name: 'Organic Face Cream', sku: 'OF-CR', price: 89.0, stock: 0, status: 'Inactive', imageUrl: 'https://picsum.photos/seed/facecream/200/200' },
  { id: 'PRD-2004', name: 'Gaming Mouse', sku: 'GM-200', price: 59.9, stock: 120, status: 'Active', imageUrl: 'https://picsum.photos/seed/mouse/200/200' },
  { id: 'PRD-2005', name: 'Mechanical Keyboard', sku: 'MK-450', price: 149.0, stock: 35, status: 'Active', imageUrl: 'https://picsum.photos/seed/keyboard/200/200' },
  { id: 'PRD-2006', name: 'USB-C Hub', sku: 'USBC-HB', price: 34.5, stock: 200, status: 'Active', imageUrl: 'https://picsum.photos/seed/hub/200/200' },
  { id: 'PRD-2007', name: '4K Webcam', sku: 'CAM-4K', price: 89.9, stock: 58, status: 'Active', imageUrl: 'https://picsum.photos/seed/webcam/200/200' },
  { id: 'PRD-2008', name: 'Noise Cancelling Earbuds', sku: 'NCB-10', price: 99.0, stock: 0, status: 'Inactive', imageUrl: 'https://picsum.photos/seed/earbuds/200/200' },
  { id: 'PRD-2009', name: 'Portable SSD 1TB', sku: 'SSD-1TB', price: 129.0, stock: 85, status: 'Active', imageUrl: 'https://picsum.photos/seed/ssd/200/200' },
  { id: 'PRD-2010', name: 'Bluetooth Speaker', sku: 'BTS-50', price: 69.0, stock: 64, status: 'Active', imageUrl: 'https://picsum.photos/seed/speaker/200/200' },
  { id: 'PRD-2011', name: 'Fitness Tracker', sku: 'FT-20', price: 49.0, stock: 110, status: 'Active', imageUrl: 'https://picsum.photos/seed/tracker/200/200' },
  { id: 'PRD-2012', name: 'Smart Lamp', sku: 'LAMP-SM', price: 39.0, stock: 73, status: 'Active', imageUrl: 'https://picsum.photos/seed/lamp/200/200' },
  { id: 'PRD-2013', name: 'Drone Mini', sku: 'DRONE-M', price: 199.0, stock: 15, status: 'Active', imageUrl: 'https://picsum.photos/seed/drone/200/200' },
  { id: 'PRD-2014', name: 'VR Headset', sku: 'VR-SET', price: 299.0, stock: 22, status: 'Active', imageUrl: 'https://picsum.photos/seed/vr/200/200' },
  { id: 'PRD-2015', name: 'Action Camera', sku: 'ACAM-5', price: 159.0, stock: 41, status: 'Active', imageUrl: 'https://picsum.photos/seed/actioncam/200/200' },
  { id: 'PRD-2016', name: 'Smart Plug', sku: 'SPLUG-2', price: 19.0, stock: 300, status: 'Active', imageUrl: 'https://picsum.photos/seed/plug/200/200' },
];

export const OrdersProducts: React.FC = () => {
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<'date' | 'amount' | 'price' | 'stock'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const orders = useMemo(() => initialOrders, []);
  const products = useMemo(() => initialProducts, []);

  const filteredOrders = useMemo(() => {
    let data = orders.filter(o => {
      const q = search.toLowerCase();
      const match = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      const statusOk = statusFilter === 'All' || o.status === statusFilter;
      return match && statusOk;
    });
    data = data.sort((a, b) => {
      if (sortKey === 'date') {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortDir === 'asc' ? da - db : db - da;
      }
      if (sortKey === 'amount') {
        return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });
    return data;
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const filteredProducts = useMemo(() => {
    let data = products.filter(p => {
      const q = search.toLowerCase();
      const match = p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const statusOk = statusFilter === 'All' || p.status === statusFilter;
      return match && statusOk;
    });
    data = data.sort((a, b) => {
      if (sortKey === 'price') {
        return sortDir === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sortKey === 'stock') {
        return sortDir === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0;
    });
    return data;
  }, [products, search, statusFilter, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [tab, search, statusFilter, sortKey, sortDir]);

  useEffect(() => {
    if (tab === 'products' && (sortKey === 'date' || sortKey === 'amount')) {
      setSortKey('price');
    }
    if (tab === 'orders' && (sortKey === 'price' || sortKey === 'stock')) {
      setSortKey('date');
    }
  }, [tab]);

  const onDelete = (id: string) => {
    // Stub delete action
    alert(`Delete ${id}`);
  };

  const onEdit = (id: string) => {
    // Stub edit action
    alert(`Edit ${id}`);
  };

  const list = tab === 'orders' ? filteredOrders : filteredProducts;
  const filtersActive = search.trim() !== '' || statusFilter !== 'All';
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = list.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('ordersProducts')}</h1>
            <p className="text-gray-600 text-sm sm:text-base">{t('manageOrdersProducts')}</p>
          </div>
        </div>

        <div role="tablist" aria-label="Orders and Products" className="flex items-center gap-3 border-b border-[#E2E8F0] mb-6">
          {(['orders', 'products'] as const).map(s => {
            const active = s === tab;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${s}`}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? 'text-[#7D2AE8] bg-[#7D2AE8]/10' : 'text-gray-700 hover:bg-[#F8FAFC]'
                }`}
                onClick={() => setTab(s)}
              >
                {s === 'orders' ? t('tabOrders') : t('tabProducts')}
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
            <div className="md:col-span-6">
              <div className="w-full">
                <Input
                  label={undefined}
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 min-w-[300px] w-full sm:max-w-[640px] lg:max-w-[800px]"
                  startIcon={<SearchIcon className="w-5 h-5" aria-hidden="true" />}
                  unstyled
                />
              </div>
            </div>
            <div className="md:col-span-3 grid grid-cols-2 gap-3 md:gap-4">
              <div className="w-full">
                  <select
                    aria-label="Status filter"
                    className="w-full h-12 px-4 py-2 rounded-none shadow-none border bg-white text-gray-900 border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>{t('statusAll')}</option>
                    {tab === 'orders' ? (
                      <>
                        <option>{t('statusPending')}</option>
                        <option>{t('statusPaid')}</option>
                        <option>{t('statusFulfilled')}</option>
                        <option>{t('statusCancelled')}</option>
                      </>
                    ) : (
                      <>
                        <option>{t('productStatusActive')}</option>
                        <option>{t('productStatusInactive')}</option>
                      </>
                    )}
                  </select>
                </div>
              <div className="w-full">
                  <select
                    aria-label="Sort key"
                    className="w-full h-12 px-4 py-2 rounded-none shadow-none border bg-white text-gray-900 border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as any)}
                  >
                    {tab === 'orders' ? (
                      <>
                        <option value="date">{t('sortDateDesc')}</option>
                        <option value="amount">{t('sortAmountDesc')}</option>
                      </>
                    ) : (
                      <>
                        <option value="price">Price (high → low)</option>
                        <option value="stock">Stock (high → low)</option>
                      </>
                    )}
                  </select>
                </div>
            </div>
            <div className="md:col-span-3 flex items-end md:justify-end gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                aria-label="Clear filters"
                className={`transition-all duration-200 ease-out ${filtersActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                aria-hidden={!filtersActive}
                tabIndex={filtersActive ? 0 : -1}
              >
                <FilterX className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl mt-4">
          <CardContent>
            <div className="text-sm font-medium text-gray-900 mb-2">{tab === 'orders' ? 'Orders list' : 'Products list'}</div>
            {list.length === 0 ? (
              <div className="text-center text-gray-700" role="status" aria-live="polite">{t('noResults')}</div>
            ) : tab === 'orders' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" role="table" aria-label="Orders table">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="text-left py-2 pr-4">ID</th>
                      <th className="text-left py-2 pr-4">Date</th>
                      <th className="text-left py-2 pr-4">Customer</th>
                      <th className="text-left py-2 pr-4">Amount</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((o: Order) => (
                      <tr key={o.id} className="border-t border-[#E2E8F0]">
                        <td className="py-2 pr-4">
                          <button className="text-[#7D2AE8] hover:underline" onClick={() => setDetailId(o.id)} aria-label={`View details for ${o.id}`}>{o.id}</button>
                        </td>
                        <td className="py-2 pr-4">{o.date}</td>
                        <td className="py-2 pr-4">{o.customer}</td>
                        <td className="py-2 pr-4">${o.amount.toFixed(2)}</td>
                        <td className="py-2 pr-4">{o.status}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(o.id)}>{t('edit')}</Button>
                            <Button variant="destructive" size="sm" onClick={() => onDelete(o.id)}>{t('delete')}</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" role="table" aria-label="Products table">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="text-left py-2 pr-4">Product</th>
                      <th className="text-left py-2 pr-4">ID</th>
                      <th className="text-left py-2 pr-4">Name</th>
                      <th className="text-left py-2 pr-4">SKU</th>
                      <th className="text-left py-2 pr-4">Price</th>
                      <th className="text-left py-2 pr-4">Stock</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((p: Product) => (
                      <tr key={p.id} className="border-t border-[#E2E8F0]">
                        <td className="py-2 pr-4">
                          <img src={p.imageUrl || '/src/assets/react.svg'} alt={p.name} className="w-8 h-8 rounded object-cover border border-[#E2E8F0]" loading="lazy" />
                        </td>
                        <td className="py-2 pr-4">
                          <button className="text-[#7D2AE8] hover:underline" onClick={() => setDetailId(p.id)} aria-label={`View details for ${p.id}`}>{p.id}</button>
                        </td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4">{p.sku}</td>
                        <td className="py-2 pr-4">${p.price.toFixed(2)}</td>
                        <td className="py-2 pr-4">{p.stock}</td>
                        <td className="py-2 pr-4">{p.status}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setDetailId(p.id)}>{t('view')}</Button>
                            <Button variant="outline" size="sm" onClick={() => onEdit(p.id)}>{t('edit')}</Button>
                            <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)}>{t('delete')}</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-3">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <div className="text-sm text-gray-700">{page} / {totalPages}</div>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </CardContent>
        </Card>

        {detailId && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={() => setDetailId(null)} aria-hidden="true" />
        )}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('details')}
          className={`fixed z-50 w-[90%] sm:w-[480px] bg-white border border-[#E2E8F0] rounded-2xl shadow-lg transition-[opacity,transform] duration-300 ease-out ${detailId ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'}`}
          style={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('details')}</h3>
              <Button variant="outline" size="sm" onClick={() => setDetailId(null)} aria-label={t('close')}>{t('close')}</Button>
            </div>
            <div className="text-sm text-gray-700">
              Selected ID: {detailId}
            </div>
          </div>
        </div>
      </div>
    </BrandLayout>
  );
};

export default OrdersProducts;
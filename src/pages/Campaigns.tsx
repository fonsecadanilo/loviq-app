import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Megaphone, CheckCircle2, Clock } from 'lucide-react';
import BrandLayout from '../components/dashboard/BrandLayout';
import { useCampaignMetrics } from '../store/metrics';

type CampaignStatus = 'active' | 'scheduled' | 'completed';

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  sales: number;
  clicks: number;
  minutesSpent: number;
  orders: number;
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  completed: 'Completed',
};

const STATUS_STYLE: Record<CampaignStatus, string> = {
  active: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-700',
};

export const Campaigns: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>('active');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { metricsById, initCampaignMetrics } = useCampaignMetrics();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const campaigns: Campaign[] = useMemo(
    () => [
      { id: '1', name: 'Summer Fashion', status: 'active', sales: 8450, clicks: 12340, minutesSpent: 90, orders: 31 },
      { id: '2', name: 'Tech Launch', status: 'active', sales: 6230, clicks: 8920, minutesSpent: 60, orders: 22 },
      { id: '3', name: 'Beauty Essentials', status: 'completed', sales: 9900, clicks: 24150, minutesSpent: 120, orders: 36 },
      { id: '4', name: 'Home & Garden Week', status: 'scheduled', sales: 0, clicks: 0, minutesSpent: 0, orders: 0 },
      { id: '5', name: 'Sports Deals', status: 'active', sales: 4150, clicks: 7340, minutesSpent: 45, orders: 15 },
      { id: '6', name: 'Jewelry Flash', status: 'scheduled', sales: 0, clicks: 0, minutesSpent: 0, orders: 0 },
      { id: '7', name: 'Books & Media', status: 'completed', sales: 5200, clicks: 15210, minutesSpent: 75, orders: 19 },
      { id: '8', name: 'Pet Supplies Live', status: 'active', sales: 3100, clicks: 6900, minutesSpent: 30, orders: 11 },
      { id: '9', name: 'Wellness Festival', status: 'completed', sales: 7600, clicks: 18900, minutesSpent: 110, orders: 27 },
    ],
    []
  );

  const filtered = useMemo(() => campaigns.filter(c => c.status === statusFilter), [campaigns, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    campaigns.forEach(c => {
      initCampaignMetrics(c.id, { sales: c.sales, orders: c.orders, clicks: c.clicks, minutesSpent: c.minutesSpent });
    });
  }, [campaigns, initCampaignMetrics]);

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your live commerce campaigns</p>
          </div>
          <Button variant="glow" size="lg" className="inline-flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Create New Campaign
          </Button>
        </div>

        <div role="tablist" aria-label="Campaign status" className="flex items-center gap-3 border-b border-[#E2E8F0] mb-6">
          {(['active', 'scheduled', 'completed'] as CampaignStatus[]).map(s => {
            const active = s === statusFilter;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${s}`}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? 'text-[#7D2AE8] bg-[#7D2AE8]/10' : 'text-gray-700 hover:bg-[#F8FAFC]'
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40" role="status" aria-label="Loading campaigns">
            <div className="w-6 h-6 border-2 border-[#7D2AE8]/30 border-t-[#7D2AE8] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div id={`panel-${statusFilter}`} className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center">
            <p className="text-gray-700">No campaigns found for the selected filter.</p>
          </div>
        ) : (
          <div id={`panel-${statusFilter}`} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {pageItems.map(c => (
              <Card key={c.id} className="border-[#E2E8F0] rounded-2xl hover:shadow-md transition-shadow loviq-main-card-interactive">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>{c.name}</CardTitle>
                    <CardDescription>Campaign status</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLE[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{
                        (() => {
                          const m = metricsById[c.id] ?? { sales: c.sales, orders: c.orders, clicks: c.clicks, minutesSpent: c.minutesSpent };
                          const aov = m.orders > 0 ? m.sales / m.orders : 0;
                          return `$${Math.round(aov).toLocaleString()}`;
                        })()
                      }</div>
                      <div className="text-xs text-gray-600">Average Order</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{
                        (() => {
                          const m = metricsById[c.id] ?? { sales: c.sales, orders: c.orders, clicks: c.clicks, minutesSpent: c.minutesSpent };
                          return `$${m.sales.toLocaleString()}`;
                        })()
                      }</div>
                      <div className="text-xs text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{
                        (() => {
                          const m = metricsById[c.id] ?? { sales: c.sales, orders: c.orders, clicks: c.clicks, minutesSpent: c.minutesSpent };
                          return m.clicks.toLocaleString();
                        })()
                      }</div>
                      <div className="text-xs text-gray-600">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{
                        (() => {
                          const m = metricsById[c.id] ?? { sales: c.sales, orders: c.orders, clicks: c.clicks, minutesSpent: c.minutesSpent };
                          return `${Math.round(m.minutesSpent)} min`;
                        })()
                      }</div>
                      <div className="text-xs text-gray-600">Minutes spent</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs">View</Button>
                      <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}
      </div>
    </BrandLayout>
  );
}

export default Campaigns;

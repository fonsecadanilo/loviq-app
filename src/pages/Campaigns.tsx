import React, { useMemo, useState } from 'react';
import { Plus, CalendarDays, Users, Layers, DollarSign, Radio } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';

type CampaignStatus = 'Active' | 'Draft' | 'Completed';

interface CampaignItem {
  id: string;
  name: string;
  status: CampaignStatus;
  segments: string[];
  lives: number;
  creators: number;
  revenue: string;
  date: string;
}

export const Campaigns: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CampaignStatus | 'All'>('All');
  const [segment, setSegment] = useState<string | 'All'>('All');

  const campaigns: CampaignItem[] = useMemo(() => ([
    { id: 'cmp-001', name: 'Summer Fashion Collection', status: 'Active', segments: ['Fashion', 'Lifestyle'], lives: 3, creators: 5, revenue: '$8,450', date: '2025-07-04' },
    { id: 'cmp-002', name: 'Tech Gadgets Launch', status: 'Draft', segments: ['Tech'], lives: 2, creators: 3, revenue: '$0', date: '2025-12-01' },
    { id: 'cmp-003', name: 'Beauty Essentials', status: 'Completed', segments: ['Beauty'], lives: 4, creators: 6, revenue: '$9,900', date: '2025-05-24' },
  ]), []);

  const availableSegments = useMemo(() => Array.from(new Set(campaigns.flatMap(c => c.segments))), [campaigns]);

  const filtered = useMemo(() => campaigns.filter(c => {
    const matchesQuery = query.trim().length === 0 || c.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'All' || c.status === status;
    const matchesSegment = segment === 'All' || c.segments.includes(segment);
    return matchesQuery && matchesStatus && matchesSegment;
  }), [campaigns, query, status, segment]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8" role="main" aria-label="Campaigns page">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage and track your live commerce campaigns</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/campaigns/create" aria-label="Create new campaign">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-6" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <Input 
                  label="Search"
                  placeholder="Search campaigns by name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="sr-only" aria-live="polite">{filtered.length} campaigns found</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                  {(['All','Active','Draft','Completed'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${status===s? 'border-[#7D2AE8] bg-[#7D2AE8]/10 text-[#7D2AE8]':'border-[#E2E8F0] bg-white text-gray-700 hover:border-[#7D2AE8]/40'}`}
                      aria-pressed={status===s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Segment</label>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter by segment">
                  {(['All', ...availableSegments] as const).map(seg => (
                    <button
                      key={seg}
                      onClick={() => setSegment(seg as string)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${segment===seg? 'border-[#7D2AE8] bg-[#7D2AE8]/10 text-[#7D2AE8]':'border-[#E2E8F0] bg-white text-gray-700 hover:border-[#7D2AE8]/40'}`}
                      aria-pressed={segment===seg}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="border-[#E2E8F0]" padding="md" aria-label={`${c.name} campaign`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{c.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    c.status==='Active' ? 'bg-green-100 text-green-700' : c.status==='Completed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{c.status}</span>
                </div>
                <CardDescription>Segments: {c.segments.join(', ')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Radio className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    <span>{c.lives} lives</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span>{c.creators} creators</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Layers className="w-4 h-4 text-green-600" aria-hidden="true" />
                    <span>{c.segments[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <DollarSign className="w-4 h-4 text-orange-600" aria-hidden="true" />
                    <span>{c.revenue}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                  <span>{new Date(c.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/campaigns/create`} aria-label={`Open ${c.name}`}>
                    <Button variant="outline" size="sm">Open</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
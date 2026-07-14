'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

type Deal = {
  id: string;
  title: string;
  property: string;
  value: number;
  client: string;
  status: string;
};

type Tab = 'buy' | 'sell';

type Stage = {
  id: string;
  title: string;
  count: number;
};

const pipelineStages = [
  { id: 'enquiries', title: 'Enquiries' },
  { id: 'viewings', title: 'Viewings' },
  { id: 'offers', title: 'Offers' },
  { id: 'agreements', title: 'Agreements' },
  { id: 'closed', title: 'Closed' },
] as const;

const statusToStage: Record<string, string> = {
  draft: 'enquiries',
  pending_landlord: 'viewings',
  pending_tenant: 'offers',
  tenant_signed: 'agreements',
  landlord_signed: 'agreements',
  fully_signed: 'closed',
  terminated: 'closed',
  expired: 'closed',
};

export default function DealsClient({ initialDeals }: { initialDeals: Deal[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [searchQuery, setSearchQuery] = useState('');

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    pipelineStages.forEach((s) => (map[s.id] = []));
    initialDeals.forEach((d) => {
      const stage = statusToStage[d.status] || 'enquiries';
      if (stage in map) map[stage].push(d);
    });
    return map;
  }, [initialDeals]);

  const currentDeals = activeTab === 'buy' ? dealsByStage : dealsByStage;

  const totalValue = useMemo(() => {
    const all = Object.values(currentDeals).flat();
    return all.reduce((sum, d) => sum + d.value, 0);
  }, [currentDeals]);

  const filteredStages = useMemo(() => {
    if (!searchQuery) return pipelineStages.map((s) => ({ ...s, count: currentDeals[s.id]?.length || 0 }));
    const q = searchQuery.toLowerCase();
    return pipelineStages
      .map((stage) => {
        const deals = (currentDeals[stage.id] || []).filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.client.toLowerCase().includes(q) ||
            d.property.toLowerCase().includes(q)
        );
        return { ...stage, count: deals.length };
      })
      .filter((stage) => stage.count > 0);
  }, [currentDeals, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-headline-sm text-primary" >
            Deal Pipeline
          </h1>
          <p className="text-sm text-on-surface-variant mt-1" >
            Track your buy and sell deals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"  />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-10 w-64"
            />
          </div>
          <Button>+ New Deal</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-outline-variant" >
        <button
          onClick={() => {
            setActiveTab('buy');
            setSearchQuery('');
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'buy' ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
          )}
        >
          Buy Pipeline
        </button>
        <button
          onClick={() => {
            setActiveTab('sell');
            setSearchQuery('');
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'sell' ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
          )}
        >
          Sell Pipeline
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium mb-1 text-on-surface-variant" >
              Total Value
            </p>
            <p className="text-2xl font-heading font-bold text-primary" >
              ₦{(totalValue / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        {filteredStages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="p-6">
              <p className="text-sm font-medium mb-1 text-on-surface-variant" >{stage.title}</p>
              <p className="text-2xl font-heading font-bold text-primary" >{stage.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredStages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col" style={{ minWidth: '320px' }}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-primary" >
                    {stage.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs font-bold">{stage.count}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="p-3 space-y-3 min-h-[400px] bg-surface-container" >
                  {(currentDeals[stage.id] || []).map((deal) => (
                    <Link key={deal.id} href={`/dashboard/agent/deals/${deal.id}`} className="block">
                      <Card className="p-3 cursor-pointer transition-all hover:shadow-md bg-surface-container-low border border-outline-variant" >
                        <p className="font-medium text-sm truncate text-primary" >{deal.title}</p>
                        <p className="text-xs text-on-surface-variant" >Client: {deal.client}</p>
                        <p className="text-sm font-bold mt-2 text-primary" >₦{deal.value.toLocaleString()}</p>
                      </Card>
                    </Link>
                  ))}
                  {(currentDeals[stage.id] || []).length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-outline-variant" >
                      <span className="text-sm text-on-surface-variant" >No deals here</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

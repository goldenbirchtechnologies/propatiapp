'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

type Tab = 'buy' | 'sell';

const LISTING_TYPE_SALE = 'sale';

const pipelineStages = [
  { id: 'enquiries', title: 'Enquiries', count: 0 },
  { id: 'viewings', title: 'Viewings', count: 0 },
  { id: 'offers', title: 'Offers', count: 0 },
  { id: 'agreements', title: 'Agreements', count: 0 },
  { id: 'closed', title: 'Closed', count: 0 },
] as const;

const mockBuyDeals: Record<string, Array<{ id: string; title: string; property: string; value: number; client: string }>> = {
  enquiries: [
    { id: 'b1', title: 'John Doe - 3 Bed', property: 'Lekki Phase 1', value: 2500000, client: 'John Doe' },
  ],
  viewings: [],
  offers: [],
  agreements: [],
  closed: [],
};

const mockSellDeals: Record<string, Array<{ id: string; title: string; property: string; value: number; client: string }>> = {
  enquiries: [],
  viewings: [],
  offers: [],
  agreements: [],
  closed: [],
};

export default function DealsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [searchQuery, setSearchQuery] = useState('');

  const currentDeals = activeTab === 'buy' ? mockBuyDeals : mockSellDeals;

  const totalValue = useMemo(() => {
    const all = Object.values(currentDeals).flat();
    return all.reduce((sum, d) => sum + d.value, 0);
  }, [activeTab]);

  const filteredStages = useMemo(() => {
    if (!searchQuery) return pipelineStages;
    const q = searchQuery.toLowerCase();
    return pipelineStages
      .map((stage) => {
        const deals = (currentDeals[stage.id] || []).filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.client.toLowerCase().includes(q) ||
            d.property.toLowerCase().includes(q)
        );
        return { ...stage, deals, count: deals.length };
      })
      .filter((stage) => stage.count > 0 || !searchQuery);
  }, [currentDeals, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Deal Pipeline
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Track your buy and sell deals. Listing type: {LISTING_TYPE_SALE}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-10 w-64"
            />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => {
            setActiveTab('buy');
            setSearchQuery('');
          }}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'buy' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-blue-500'
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
            activeTab === 'sell' ? 'border-residential-teal text-residential-teal' : 'border-transparent hover:text-residential-teal'
          )}
        >
          Sell Pipeline
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
              Total Value
            </p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
              ₦{(totalValue / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        {pipelineStages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="p-6">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{stage.title}</p>
              <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
                {filteredStages.find((s) => s.id === stage.id)?.count ?? stage.count}
              </p>
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
                  <CardTitle className="text-base" style={{ color: 'var(--text)' }}>
                    {stage.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {stage.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div
                  className="p-3 space-y-3 min-h-[400px]"
                  style={{ background: 'var(--surface)' }}
                >
                  {(currentDeals[stage.id] || []).map((deal) => (
                    <Card
                      key={deal.id}
                      className="p-3 cursor-pointer transition-all hover:shadow-md"
                      style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
                    >
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                        {deal.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Client: {deal.client}
                      </p>
                      <p className="text-sm font-bold mt-2" style={{ color: 'var(--text)' }}>
                        ₦{deal.value.toLocaleString()}
                      </p>
                    </Card>
                  ))}
                  {(currentDeals[stage.id] || []).length === 0 && (
                    <div className="h-32 flex items-center justify-center" style={{ border: '2px dashed var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>No deals here</span>
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

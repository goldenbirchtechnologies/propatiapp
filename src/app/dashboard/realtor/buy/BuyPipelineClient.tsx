'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

type Deal = {
  id: string;
  title: string;
  property: string;
  value: number;
  client: string;
};

const stages = ['New Lead', 'Viewing', 'Offer', 'Negotiation', 'Closed'] as const;

export default function BuyPipelineClient({ initialDeals }: { initialDeals: Deal[] }) {
  const [search, setSearch] = useState('');

  const dealByStage: Record<string, Deal[]> = {};
  stages.forEach((s) => (dealByStage[s] = []));
  initialDeals.forEach((d) => {
    const idx = Math.floor(Math.random() * stages.length);
    dealByStage[stages[idx]].push(d);
  });

  const filteredStages = Object.fromEntries(
    Object.entries(dealByStage).map(([stage, deals]) => [
      stage,
      search ? deals.filter((d) => d.title.toLowerCase().includes(search.toLowerCase())) : deals,
    ])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-headline-sm text-primary" >Buy Pipeline</h1>
          <p className="text-on-surface-variant mt-1">Track buyer deals across stages</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"  />
          <input type="text" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="inp-field pl-9 w-64" />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage} className="min-w-[280px] w-80 card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-on-surface-variant" >{stage}</p>
              <span className="text-xs px-2 py-0.5 rounded-full border text-on-surface-variant" >{filteredStages[stage].length}</span>
            </div>
            <div className="space-y-3">
              {filteredStages[stage].map((deal) => (
                <div key={deal.id} className="p-3 rounded-lg border border-outline-variant" >
                  <p className="text-sm font-medium truncate text-primary" >{deal.title}</p>
                  <p className="text-xs text-on-surface-variant" >₦{deal.value.toLocaleString()}</p>
                </div>
              ))}
              {filteredStages[stage].length === 0 && <p className="text-xs text-center py-4 text-on-surface-variant" >No deals</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

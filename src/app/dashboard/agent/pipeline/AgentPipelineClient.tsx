'use client'

import AppIcon from '@/components/icons/app-icon';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, DollarSign, Eye, Mail, Phone, MapPin, Edit, CheckCircle, GripVertical } from 'lucide-react';


type Deal = {
  id: string;
  title: string;
  property: string;
  value: number;
  client: string;
  lastContact: string;
  type: 'buy' | 'sell';
};

type Stage = {
  id: string;
  title: string;
  color: string;
  deals: Deal[];
};

const STAGE_COLORS: Record<string, string> = {
  enquiries: 'var(--blue)',
  viewings: 'var(--amber)',
  offers: 'var(--green)',
  agreements: 'var(--accent)',
  closed: 'var(--green)',
};

export default function AgentPipelineClient({ initialData }: { initialData: { stages: Stage[]; stats: { totalValue: number; enquiries: number; viewings: number; offers: number; closed: number } } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allDeals = (initialData.stages || []).flatMap((s) => s.deals || []);
  const filteredDeals = searchQuery
    ? allDeals.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.property.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDeals;

  const getDealsForStage = (stageId: string) => {
    const stage = initialData.stages.find((s) => s.id === stageId);
    if (!stage) return [];
    if (!searchQuery) return stage.deals;
    return stage.deals.filter((d) => filteredDeals.some((fd) => fd.id === d.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: '#ffffff' }}>
            Deal Pipeline
          </h1>
          <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500 mt-1">
            Track deals across enquiries, viewings, offers, agreements, and closed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Value" value={`₦${(initialData.stats.totalValue / 1_000_000).toFixed(1)}M`} icon={<DollarSign />} />
        <StatCard label="Enquiries" value={String(initialData.stats.enquiries)} icon={<Mail />} />
        <StatCard label="Viewings" value={String(initialData.stats.viewings)} icon={<Eye />} />
        <StatCard label="Offers" value={String(initialData.stats.offers)} icon={<DollarSign />} />
        <StatCard label="Closed" value={String(initialData.stats.closed)} icon={<CheckCircle />} trend="+12% this month" trendPositive />
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {initialData.stages.map((stage) => (
          <PipelineColumn key={stage.id} stage={stage} deals={getDealsForStage(stage.id)} color={STAGE_COLORS[stage.id] || 'var(--accent)'} />
        ))}
      </div>
    </div>
  );
}

function PipelineColumn({ stage, deals, color }: { stage: Stage; deals: Deal[]; color: string }) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col" style={{ minWidth: '320px' }}>
      <div className="glass-card h-full flex flex-col bg-[rgba(23,23,23,0.4)] backdrop-blur border border-white/[0.08] rounded-xl">
        <div className="px-6 py-5 border-b border-white/[0.08] pb-3" style={{ background: `${color}15` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white text-base" style={{ color }}>{stage.title}</h3>
            <Badge variant="secondary" className="text-xs font-bold" style={{ background: color, color: 'white' }}>{deals.length}</Badge>
          </div>
        </div>
        <div className="p-6 flex-1 p-0">
          <div className="p-3 space-y-3 min-h-[400px]" style={{ background: 'rgba(10,10,10,0.3)' }}>
            {deals.length === 0 ? (
              <div className="h-32 flex items-center justify-center" style={{ border: '2px dashed #262626', borderRadius: '0.75rem' }}>
                <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">No deals in this stage</span>
              </div>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} color={color} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, color }: { deal: Deal; color: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="p-3 rounded-xl cursor-pointer transition-all"
      style={{
        background: 'bg-zinc-950/50',
        border: '1px solid border-white/[0.08]',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate text-white">{deal.title}</span>
            <Badge variant="outline" className="text-xs">{deal.property}</Badge>
          </div>
          <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Client: {deal.client}</p>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4 text-zinc-500" style={{ cursor: 'grab' }} />
        </div>
      </div>

      <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs font-label-sm uppercase tracking-wider border-white/[0.08] text-zinc-500">
        <AppIcon name="₦{deal.value.toLocaleString()}" className="lucide" />
        <AppIcon name={deal.lastContact} className="lucide" />
      </div>

      {expanded && (
        <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(10,10,10,0.3)', border: '1px solid #262626' }}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Property:</span>
              <span className="text-white">{deal.property}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Client:</span>
              <span className="text-white">{deal.client}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Value:</span>
              <span className="text-sm font-medium text-white">₦{deal.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Last Contact:</span>
              <span className="text-white">{deal.lastContact}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.08]">
            <Button variant="ghost" size="sm" className="flex-1"><Phone className="w-3 h-3 mr-1" /> Call</Button>
            <Button variant="ghost" size="sm" className="flex-1"><Mail className="w-3 h-3 mr-1" /> Message</Button>
            <Button variant="ghost" size="sm" className="flex-1"><MapPin className="w-3 h-3 mr-1" /> View</Button>
            <Button variant="ghost" size="sm" className="flex-1"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendPositive = true }: { label: string; value: string; icon: React.ReactNode; trend?: string; trendPositive?: boolean }) {
  return (
    <div className="glass-card">
      <div className="p-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="text-2xl font-headline-sm font-bold text-white">{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(0,255,102,0.1)', color: '#ffffff' }}>{Icon}</div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs font-label-sm uppercase tracking-wider" style={{ color: trendPositive ? '#00ff66' : '#ef4444' }}>
              {trendPositive ? '↑' : '↓'}
            </span>
            <span className="text-xs" style={{ color: trendPositive ? '#00ff66' : '#ef4444' }}>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

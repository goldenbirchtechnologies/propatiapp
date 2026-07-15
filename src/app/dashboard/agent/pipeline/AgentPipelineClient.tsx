'use client';

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
  color: string;
  deals: Deal[];
const STAGE_COLORS: Record<string, string> = {
  enquiries: 'var(--blue)',
  viewings: 'var(--amber)',
  offers: 'var(--green)',
  agreements: 'var(--accent)',
  closed: 'var(--green)',
export default function AgentPipelineClient({ initialData }: { initialData: { stages: Stage[]; stats: { totalValue: number; enquiries: number; viewings: number; offers: number; closed: number } } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const allDeals = initialData.stages.flatMap((s) => s.deals);
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>
            Deal Pipeline
          </h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>
            Track deals across enquiries, viewings, offers, agreements, and closed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'text-on-surface-variant' }} />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-10 w-64"
            />
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" /> New Deal
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Value" value={`₦${(initialData.stats.totalValue / 1_000_000).toFixed(1)}M`} icon={<DollarSign />} />
        <StatCard label="Enquiries" value={String(initialData.stats.enquiries)} icon={<Mail />} />
        <StatCard label="Viewings" value={String(initialData.stats.viewings)} icon={<Eye />} />
        <StatCard label="Offers" value={String(initialData.stats.offers)} icon={<DollarSign />} />
        <StatCard label="Closed" value={String(initialData.stats.closed)} icon={<CheckCircle />} trend="+12% this month" trendPositive />
      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {initialData.stages.map((stage) => (
          <PipelineColumn key={stage.id} stage={stage} deals={getDealsForStage(stage.id)} color={STAGE_COLORS[stage.id] || 'var(--accent)'} />
        ))}
  );
}
function PipelineColumn({ stage, deals, color }: { stage: Stage; deals: Deal[]; color: string }) {
    <div className="flex-shrink-0 w-80 flex flex-col" style={{ minWidth: '320px' }}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3" style={{ background: `${color}15` }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base" style={{ color }}>{stage.title}</CardTitle>
            <Badge variant="secondary" className="text-xs font-bold" style={{ background: color, color: 'white' }}>{deals.length}</Badge>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="p-3 space-y-3 min-h-[400px]" style={{ background: 'bg-surface-container-lowest' }}>
            {deals.length === 0 ? (
              <div className="h-32 flex items-center justify-center" style={{ border: '2px dashed border-outline-variant', borderRadius: 'rounded-xl' }}>
                <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>No deals in this stage</span>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} color={color} />)
            )}
        </CardContent>
      </Card>
function DealCard({ deal, color }: { deal: Deal; color: string }) {
  const [expanded, setExpanded] = useState(false);
    <div
      className="p-3 rounded-lg cursor-pointer transition-all"
      style={{
        background: 'bg-surface-container-low',
        border: '1px solid border-outline-variant',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate" style={{ color: 'text-primary' }}>{deal.title}</span>
            <Badge variant="outline" className="text-xs">{deal.property}</Badge>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Client: {deal.client}</p>
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4" style={{ color: 'text-on-surface-variant', cursor: 'grab' }} />
      <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs font-label-md uppercase tracking-wider" style={{ borderColor: 'border-outline-variant', color: 'text-on-surface-variant' }}>
        <MaterialIcon name="₦{deal.value.toLocaleString()}" className="material-symbols-outlined" />
        <MaterialIcon name={deal.lastContact} className="material-symbols-outlined" />
      {expanded && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-outline-variant' }}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Property:</span>
              <span style={{ color: 'text-primary' }}>{deal.property}</span>
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Client:</span>
              <span style={{ color: 'text-primary' }}>{deal.client}</span>
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Value:</span>
              <span className="text-sm font-medium" style={{ color: 'text-primary' }}>₦{deal.value.toLocaleString()}</span>
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Last Contact:</span>
              <span style={{ color: 'text-primary' }}>{deal.lastContact}</span>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'border-outline-variant' }}>
            <Button variant="ghost" size="sm" className="flex-1"><Phone className="w-3 h-3 mr-1" /> Call</Button>
            <Button variant="ghost" size="sm" className="flex-1"><Mail className="w-3 h-3 mr-1" /> Message</Button>
            <Button variant="ghost" size="sm" className="flex-1"><MapPin className="w-3 h-3 mr-1" /> View</Button>
            <Button variant="ghost" size="sm" className="flex-1"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
function StatCard({ label, value, icon: Icon, trend, trendPositive = true }: { label: string; value: string; icon: React.ReactNode; trend?: string; trendPositive?: boolean }) {
    <Card>
      <CardContent className="p-6">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>{label}</p>
            <p className="text-2xl font-headline-sm font-bold" style={{ color: 'text-primary' }}>{value}</p>
          <div className="p-3 rounded-xl" style={{ background: 'bg-primary/10', color: 'text-primary' }}>{Icon}</div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: trendPositive ? 'text-success' : 'var(--red)' }}>
              {trendPositive ? '↑' : '↓'}
            </span>
            <span className="text-xs" style={{ color: trendPositive ? 'text-success' : 'var(--red)' }}>{trend}</span>
import MaterialIcon from '@/components/icons/material-icon';

'use client';

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

  const allDeals = initialData.stages.flatMap((s) => s.deals);
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
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>
            Deal Pipeline
          </h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>
            Track deals across enquiries, viewings, offers, agreements, and closed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'text-on-surface-variant' }} />
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
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3" style={{ background: `${color}15` }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base" style={{ color }}>{stage.title}</CardTitle>
            <Badge variant="secondary" className="text-xs font-bold" style={{ background: color, color: 'white' }}>{deals.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="p-3 space-y-3 min-h-[400px]" style={{ background: 'bg-surface-container-lowest' }}>
            {deals.length === 0 ? (
              <div className="h-32 flex items-center justify-center" style={{ border: '2px dashed border-outline-variant', borderRadius: 'rounded-xl' }}>
                <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>No deals in this stage</span>
              </div>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} color={color} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DealCard({ deal, color }: { deal: Deal; color: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="p-3 rounded-lg cursor-pointer transition-all"
      style={{
        background: 'bg-surface-container-low',
        border: '1px solid border-outline-variant',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate" style={{ color: 'text-primary' }}>{deal.title}</span>
            <Badge variant="outline" className="text-xs">{deal.property}</Badge>
          </div>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Client: {deal.client}</p>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4" style={{ color: 'text-on-surface-variant', cursor: 'grab' }} />
        </div>
      </div>

      <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs font-label-md uppercase tracking-wider" style={{ borderColor: 'border-outline-variant', color: 'text-on-surface-variant' }}>
        <MaterialIcon name="₦{deal.value.toLocaleString()}" className="material-symbols-outlined" />
        <MaterialIcon name={deal.lastContact} className="material-symbols-outlined" />
      </div>

      {expanded && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-outline-variant' }}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Property:</span>
              <span style={{ color: 'text-primary' }}>{deal.property}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Client:</span>
              <span style={{ color: 'text-primary' }}>{deal.client}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Value:</span>
              <span className="text-sm font-medium" style={{ color: 'text-primary' }}>₦{deal.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Last Contact:</span>
              <span style={{ color: 'text-primary' }}>{deal.lastContact}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'border-outline-variant' }}>
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>{label}</p>
            <p className="text-2xl font-headline-sm font-bold" style={{ color: 'text-primary' }}>{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'bg-primary/10', color: 'text-primary' }}>{Icon}</div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs font-label-md uppercase tracking-wider" style={{ color: trendPositive ? 'text-success' : 'var(--red)' }}>
              {trendPositive ? '↑' : '↓'}
            </span>
            <span className="text-xs" style={{ color: trendPositive ? 'text-success' : 'var(--red)' }}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

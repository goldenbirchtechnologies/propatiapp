'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, ChevronDown, DollarSign, Eye, Mail, Phone, MapPin, MoreVertical, GripVertical, Trash2, Edit } from 'lucide-react';
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

const pipelineStages = [
  { id: 'enquiries', title: 'Enquiries', color: 'var(--blue)', count: 12 },
  { id: 'viewings', title: 'Viewings', color: 'var(--amber)', count: 5 },
  { id: 'offers', title: 'Offers', color: 'var(--green)', count: 3 },
  { id: 'agreements', title: 'Agreements', color: 'var(--accent)', count: 2 },
  { id: 'closed', title: 'Closed', color: 'var(--green)', count: 8 },
];

const mockDeals = {
  enquiries: [
    { id: '1', title: 'John - 3 Bed Lekki', property: 'Lekki Phase 1', value: 2500000, client: 'John Doe', lastContact: '2 hours ago' },
    { id: '2', title: 'Mary - 2 Bed Ikeja', property: 'Ikeja GRA', value: 1800000, client: 'Mary Johnson', lastContact: '1 day ago' },
    { id: '3', title: 'Peter - 4 Bed VI', property: 'Victoria Island', value: 8000000, client: 'Peter Okonkwo', lastContact: '3 days ago' },
  ],
  viewings: [
    { id: '4', title: 'Sarah - Duplex Ajah', property: 'Ajah', value: 4500000, client: 'Sarah Williams', lastContact: '5 hours ago' },
    { id: '5', title: 'Mike - House Surulere', property: 'Surulere', value: 3200000, client: 'Mike Brown', lastContact: '1 day ago' },
  ],
  offers: [
    { id: '6', title: 'David - Apartment Yaba', property: 'Yaba', value: 1500000, client: 'David Lee', lastContact: '2 days ago' },
    { id: '7', title: 'Lisa - Flat Gbagada', property: 'Gbagada', value: 1200000, client: 'Lisa Chen', lastContact: '3 days ago' },
    { id: '8', title: 'James - Studio Ikoyi', property: 'Ikoyi', value: 3500000, client: 'James Wilson', lastContact: '1 week ago' },
  ],
  agreements: [
    { id: '9', title: 'Robert - Mansion Banana Island', property: 'Banana Island', value: 15000000, client: 'Robert Taylor', lastContact: '1 day ago' },
  ],
  closed: [
    { id: '10', title: 'Emma - Penthouse Eko Atlantic', property: 'Eko Atlantic', value: 25000000, client: 'Emma Davis', lastContact: '1 week ago' },
    { id: '11', title: 'Chris - Villa Chevron', property: 'Chevron', value: 12000000, client: 'Chris Martin', lastContact: '2 weeks ago' },
    { id: '12', title: 'Amy - Apartment Osborne', property: 'Osborne', value: 4000000, client: 'Amy Clark', lastContact: '3 weeks ago' },
  ],
};

export default function AgentPipelinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allDeals = Object.values(mockDeals).flat();
  const filteredDeals = searchQuery
    ? allDeals.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.property.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDeals;

  // Group filtered deals by stage
  const getDealsForStage = (stageId: string) => {
    const stageDeals = mockDeals[stageId as keyof typeof mockDeals] || [];
    if (!searchQuery) return stageDeals;
    return stageDeals.filter(d => filteredDeals.some(fd => fd.id === d.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Deal Pipeline
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Drag and drop deals between stages to track progress
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
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Value" value="₦78.5M" icon={<DollarSign />} trend="+12% this month" trendPositive />
        <StatCard label="Enquiries" value="12" icon={<Mail />} />
        <StatCard label="Viewings" value="5" icon={<Eye />} />
        <StatCard label="Offers" value="3" icon={<DollarSign />} />
        <StatCard label="Closed" value="8" icon={<CheckCircle />} trendPositive />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={getDealsForStage(stage.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PipelineColumn({ stage, deals }: { stage: any; deals: any[] }) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col" style={{ minWidth: '320px' }}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3" style={{ background: `${stage.color}15` }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base" style={{ color: stage.color }}>
              {stage.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-bold" style={{ background: stage.color, color: 'white' }}>
              {deals.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="p-3 space-y-3 min-h-[400px]" style={{ background: 'var(--surface)' }}>
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} stageColor={stage.color} />
            ))}
            {deals.length === 0 && (
              <div className="h-32 flex items-center justify-center" style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Drop deals here</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DealCard({ deal, index, stageColor }: { deal: any; index: number; stageColor: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="p-3 rounded-lg cursor-pointer transition-all"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{deal.title}</span>
            <Badge variant="outline" className="text-xs">{deal.property}</Badge>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Client: {deal.client}</p>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-4 h-4" style={{ color: 'var(--muted)', cursor: 'grab' }} />
        </div>
      </div>

      <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        <span>₦{deal.value.toLocaleString()}</span>
        <span>{deal.lastContact}</span>
      </div>

      {expanded && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Property:</span>
              <span style={{ color: 'var(--text)' }}>{deal.property}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Client:</span>
              <span style={{ color: 'var(--text)' }}>{deal.client}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Value:</span>
              <span className="font-medium" style={{ color: 'var(--text)' }}>₦{deal.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Last Contact:</span>
              <span style={{ color: 'var(--text)' }}>{deal.lastContact}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
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
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            {Icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
              {trendPositive ? '↑' : '↓'}
            </span>
            <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckCircleIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function DollarSignIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function MailIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function EyeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function PhoneIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function MapPinIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function EditIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function Trash2Icon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}
function MoreVerticalIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
}
function GripVerticalIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="19" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="15" cy="19" r="1"/><circle cx="15" cy="5" r="1"/></svg>;
}
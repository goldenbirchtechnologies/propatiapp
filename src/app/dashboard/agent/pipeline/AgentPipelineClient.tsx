'use client'

import AppIcon from '@/components/icons/app-icon'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Plus, Eye, Mail, Phone, MapPin, Edit, CheckCircle, GripVertical, MoreVertical, ArrowRight, Kanban, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Deal = {
  id: string
  title: string
  property: string
  value: number
  client: string
  clientPhone?: string | null
  clientEmail?: string | null
  assignedAgent: string
  assignedAgentPhone?: string | null
  lastContact: string
  createdAt: string
  type: string
}

type Stage = {
  id: string
  title: string
  deals: Deal[]
}

const STAGE_COLORS: Record<string, string> = {
  enquiries: '#3b82f6',
  viewings: '#f59e0b',
  offers: '#10b981',
  agreements: '#6366f1',
  closed: '#10b981',
}

const STAGE_ORDER = ['enquiries', 'viewings', 'offers', 'agreements', 'closed']

function NairaIcon({ size = 16, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-md font-bold', className)}
      style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', width: size, height: size, fontSize: size * 0.85, ...style }}
      aria-hidden="true"
    >
      ₦
    </span>
  )
}

export default function AgentPipelineClient({ initialData }: { initialData: { stages: Stage[]; stats: { totalValue: number; enquiries: number; viewings: number; offers: number; closed: number }; trend?: string | null; trendPositive?: boolean } }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')

  const allDeals = (initialData.stages || []).flatMap((s) => s.deals || [])

  const getDealsForStage = (stageId: string) => {
    const stage = initialData.stages.find((s) => s.id === stageId)
    if (!stage) return []
    let deals = stage.deals
    if (searchQuery) {
      deals = deals.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.property.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (dateRange !== 'all') {
      const now = Date.now()
      deals = deals.filter((d) => {
        const diff = now - new Date(d.createdAt).getTime()
        if (dateRange === 'week') return diff < 7 * 24 * 60 * 60 * 1000
        if (dateRange === 'month') return diff < 30 * 24 * 60 * 60 * 1000
        return true
      })
    }
    return deals
  }

  const visibleStages = stageFilter === 'all' ? initialData.stages : initialData.stages.filter((s) => s.id === stageFilter)

  const handleMoveStage = (dealId: string, fromStageId: string) => {
    const fromIndex = STAGE_ORDER.indexOf(fromStageId)
    if (fromIndex < 0 || fromIndex >= STAGE_ORDER.length - 1) return
    const toStageId = STAGE_ORDER[fromIndex + 1]
    const toStage = initialData.stages.find((s) => s.id === toStageId)
    alert(`Move deal ${dealId} to ${toStage?.title || toStageId}`)
  }

  const isFiltered = stageFilter !== 'all'

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Kanban className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Deal Pipeline</h1>
              <p className="text-xs text-gray-400 tracking-wider mt-0.5">TRACK DEALS ACROSS ENQUIRIES, VIEWINGS, OFFERS, AGREEMENTS, AND CLOSED</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" /> New Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="inp-field pl-10 w-full"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {initialData.stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Value"
          value={initialData.stats.totalValue > 0 ? `₦${(initialData.stats.totalValue / 1_000_000).toFixed(1)}M` : 'Value unassigned'}
          icon={NairaIcon}
          trend={initialData.trend ? 'up' : 'flat'}
          trendValue={initialData.trend || null}
        />
        <button type="button" onClick={() => setStageFilter(stageFilter === 'enquiries' ? 'all' : 'enquiries')} className="text-left">
          <StatCard
            label="Enquiries"
            value={String(initialData.stats.enquiries)}
            icon={Mail}
            accentColor={isFiltered && stageFilter === 'enquiries' ? '#3b82f6' : undefined}
            className={isFiltered && stageFilter === 'enquiries' ? 'ring-1 ring-blue-500/60' : ''}
          />
        </button>
        <button type="button" onClick={() => setStageFilter(stageFilter === 'viewings' ? 'all' : 'viewings')} className="text-left">
          <StatCard
            label="Viewings"
            value={String(initialData.stats.viewings)}
            icon={Eye}
            accentColor={isFiltered && stageFilter === 'viewings' ? '#f59e0b' : undefined}
            className={isFiltered && stageFilter === 'viewings' ? 'ring-1 ring-amber-500/60' : ''}
          />
        </button>
        <button type="button" onClick={() => setStageFilter(stageFilter === 'offers' ? 'all' : 'offers')} className="text-left">
          <StatCard
            label="Offers"
            value={String(initialData.stats.offers)}
            icon={DollarSign}
            accentColor={isFiltered && stageFilter === 'offers' ? '#10b981' : undefined}
            className={isFiltered && stageFilter === 'offers' ? 'ring-1 ring-emerald-500/60' : ''}
          />
        </button>
        <button type="button" onClick={() => setStageFilter(stageFilter === 'closed' ? 'all' : 'closed')} className="text-left">
          <StatCard
            label="Closed"
            value={String(initialData.stats.closed)}
            icon={CheckCircle}
            accentColor={isFiltered && stageFilter === 'closed' ? '#10b981' : undefined}
            className={isFiltered && stageFilter === 'closed' ? 'ring-1 ring-emerald-500/60' : ''}
          />
        </button>
      </div>

      {/* Kanban */}
      <div className="w-full overflow-x-auto pb-4">
        {visibleStages.map((stage) => {
          const stageIndex = STAGE_ORDER.indexOf(stage.id)
          const nextStageId = stageIndex >= 0 && stageIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIndex + 1] : null
          const nextStageTitle = nextStageId ? initialData.stages.find((s) => s.id === nextStageId)?.title ?? null : null
          return (
            <PipelineColumn key={stage.id} stage={stage} deals={getDealsForStage(stage.id)} color={STAGE_COLORS[stage.id] || 'var(--accent)'} nextStageTitle={nextStageTitle} onMoveStage={handleMoveStage} />
          )
        })}
      </div>
    </div>
  )
}

function PipelineColumn({ stage, deals, color, nextStageTitle, onMoveStage }: { stage: Stage; deals: Deal[]; color: string; nextStageTitle: string | null; onMoveStage: (dealId: string, fromStageId: string) => void }) {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col" style={{ minWidth: '280px' }}>
      <div className="glass-card h-full flex flex-col bg-[rgba(23,23,23,0.4)] backdrop-blur border border-white/[0.08] rounded-xl">
        <div className="px-4 py-4 border-b border-white/[0.08]" style={{ background: `${color}15` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white" style={{ color }}>{stage.title}</h3>
            <Badge variant="secondary" className="text-xs font-bold" style={{ background: color, color: 'white' }}>{deals.length}</Badge>
          </div>
        </div>
        <div className="p-4 flex-1">
          <div className="space-y-3 min-h-[400px]">
            {deals.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center gap-2" style={{ border: '2px dashed #262626', borderRadius: '0.75rem' }}>
                <span className="text-xs text-zinc-500">No deals in this stage</span>
                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                  <Plus className="w-3 h-3 mr-1" /> Add Deal
                </Button>
              </div>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} color={color} stageId={stage.id} nextStageTitle={nextStageTitle} onMoveStage={onMoveStage} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DealCard({ deal, color, stageId, nextStageTitle, onMoveStage }: { deal: Deal; color: string; stageId: string; nextStageTitle: string | null; onMoveStage: (dealId: string, fromStageId: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="p-3 rounded-xl cursor-pointer transition-all group"
      style={{
        background: 'rgba(10,10,10,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
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
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-zinc-500" style={{ cursor: 'grab' }} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); alert(`Call ${deal.assignedAgentPhone || 'N/A'}`) }}>
                <Phone className="w-3 h-3 mr-2" /> Call
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); alert(`Message ${deal.clientEmail || 'N/A'}`) }}>
                <Mail className="w-3 h-3 mr-2" /> Message
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); alert(`View ${deal.property}`) }}>
                <MapPin className="w-3 h-3 mr-2" /> View Property
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {nextStageTitle && (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onMoveStage(deal.id, stageId) }}>
                  <ArrowRight className="w-3 h-3 mr-2" /> Move to {nextStageTitle}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); alert(`Edit ${deal.id}`) }}>
                <Edit className="w-3 h-3 mr-2" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs font-label-sm uppercase tracking-wider border-white/[0.08] text-zinc-500">
        <span className="text-white font-medium">₦{deal.value.toLocaleString('en-NG')}</span>
        <span>{formatAge(deal.createdAt)}</span>
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
              <span className="text-sm font-medium text-white">₦{deal.value.toLocaleString('en-NG')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider text-zinc-500">Agent:</span>
              <span className="text-white">{deal.assignedAgent}</span>
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
  )
}

function formatAge(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

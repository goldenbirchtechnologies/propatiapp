'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Building2, CheckCircle2, CircleDollarSign, Home, MapPin, Plus, Search, Store, Users, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Asset = {
  id: string; kind: 'registered' | 'legacy'; name: string; category: string; subtype: string;
  city: string; state: string; status: string; updatedAt: string; spaces: number; occupied: number;
  listed: number; activeListings: number; href: string;
};

type Props = { assets: Asset[]; metrics: { assets: number; spaces: number; occupied: number; listed: number; activeListings: number; attention: number } };

const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export default function PortfolioDashboardClient({ assets, metrics }: Props) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'all' | 'needs-attention' | 'active'>('all');
  const filtered = useMemo(() => assets.filter((asset) => {
    const matchesQuery = !query.trim() || `${asset.name} ${asset.city} ${asset.state} ${asset.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesScope = scope === 'all' || (scope === 'active' ? asset.activeListings > 0 : asset.status === 'draft' || asset.status === 'submitted');
    return matchesQuery && matchesScope;
  }), [assets, query, scope]);
  const occupancy = metrics.spaces ? Math.round((metrics.occupied / metrics.spaces) * 100) : 0;
  const listingCoverage = metrics.spaces ? Math.round((metrics.listed / metrics.spaces) * 100) : 0;

  return <main className="min-h-full bg-[#f8fafc] px-4 py-6 dark:bg-black sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Portfolio command centre</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Know what is happening across your assets</h1><p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">Track registered inventory, occupancy, marketplace coverage, and the next actions that keep your portfolio moving.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/dashboard/landlord/properties/new" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"><Plus size={16} />Register asset</Link><Link href="/dashboard/landlord/listing/new" className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"><Store size={16} />Create listing</Link></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Building2 size={18} />} label="Registered assets" value={String(metrics.assets)} detail="Legacy and new registry records" />
        <Metric icon={<Home size={18} />} label="Spaces in inventory" value={String(metrics.spaces)} detail={`${metrics.listed} listed · ${metrics.spaces - metrics.listed} unlisted`} />
        <Metric icon={<Users size={18} />} label="Occupancy" value={`${occupancy}%`} detail={`${metrics.occupied} occupied spaces`} progress={occupancy} />
        <Metric icon={<Activity size={18} />} label="Active listings" value={String(metrics.activeListings)} detail={`${listingCoverage}% of inventory listed`} progress={listingCoverage} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-zinc-900 dark:text-white">Portfolio coverage</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">How much of your registered inventory is commercially visible.</p></div><CircleDollarSign className="text-emerald-600" size={20} /></div><div className="mt-6 space-y-4"><CoverageRow label="Listed spaces" value={metrics.listed} total={metrics.spaces} color="bg-emerald-500" /><CoverageRow label="Occupied spaces" value={metrics.occupied} total={metrics.spaces} color="bg-blue-500" /><CoverageRow label="Unlisted spaces" value={Math.max(metrics.spaces - metrics.listed, 0)} total={metrics.spaces} color="bg-zinc-400" /></div></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-500/20 dark:bg-amber-500/10"><div className="flex items-start gap-3"><div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"><Wrench size={18} /></div><div><h2 className="font-semibold text-zinc-900 dark:text-white">Next actions</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Keep your registry and marketplace in sync.</p></div></div><div className="mt-5 space-y-2"><ActionRow count={metrics.attention} text="Assets awaiting registration or verification" href="/dashboard/landlord/properties" /><ActionRow count={Math.max(metrics.spaces - metrics.listed, 0)} text="Spaces available to list" href="/dashboard/landlord/properties" /></div></div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><div className="flex flex-col gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-semibold text-zinc-900 dark:text-white">Your assets</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Select an asset to manage inventory or continue its commercial workflow.</p></div><div className="flex flex-wrap gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets" className="h-9 w-full pl-9 sm:w-56" /></div><div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700"><FilterButton active={scope === 'all'} onClick={() => setScope('all')}>All</FilterButton><FilterButton active={scope === 'active'} onClick={() => setScope('active')}>Listed</FilterButton><FilterButton active={scope === 'needs-attention'} onClick={() => setScope('needs-attention')}>Needs action</FilterButton></div></div></div>{filtered.length === 0 ? <div className="p-10 text-center"><Building2 className="mx-auto text-zinc-300" size={28} /><p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">No assets match this view</p><p className="mt-1 text-sm text-zinc-500">Try another filter or register your first asset.</p></div> : <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{filtered.map((asset) => <Link key={`${asset.kind}-${asset.id}`} href={asset.href} className="group grid gap-4 px-5 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] sm:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate font-medium text-zinc-900 dark:text-white">{asset.name}</h3><span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{asset.kind === 'registered' ? 'Registry' : 'Legacy'}</span></div><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-500 dark:text-zinc-400"><MapPin size={12} />{asset.city}, {asset.state}</p></div><div><p className="text-xs text-zinc-500 dark:text-zinc-400">Inventory</p><p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{asset.spaces} spaces · {asset.occupied} occupied</p></div><div><p className="text-xs text-zinc-500 dark:text-zinc-400">Marketplace</p><p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{asset.activeListings} active · {asset.listed} listed</p></div><div className="flex items-center justify-between gap-3 sm:justify-end"><Status status={asset.status} /><ArrowRight size={16} className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" /></div></Link>)}</div>}</section>
    </div>
  </main>;
}

function Metric({ icon, label, value, detail, progress }: { icon: React.ReactNode; label: string; value: string; detail: string; progress?: number }) { return <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">{icon}<span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span></div><p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{detail}</p>{progress !== undefined && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }} /></div>}</div>; }
function CoverageRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) { const percent = total ? Math.round((value / total) * 100) : 0; return <div><div className="flex justify-between text-sm"><span className="text-zinc-700 dark:text-zinc-300">{label}</span><span className="font-medium text-zinc-900 dark:text-white">{value} <span className="font-normal text-zinc-400">/ {total}</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div></div>; }
function ActionRow({ count, text, href }: { count: number; text: string; href: string }) { return <Link href={href} className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2.5 text-sm transition hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900"><span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200"><span className="font-semibold text-amber-700 dark:text-amber-300">{count}</span>{text}</span><ArrowRight size={15} className="text-zinc-400" /></Link>; }
function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${active ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}>{children}</button>; }
function Status({ status }: { status: string }) { const tone = status === 'verified' || status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : status === 'submitted' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'; return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${tone}`}><CheckCircle2 size={12} />{label(status)}</span>; }

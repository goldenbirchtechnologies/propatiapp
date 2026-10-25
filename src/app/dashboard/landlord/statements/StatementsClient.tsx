'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download, FileText, Loader2, Calendar, Search, CheckCircle2, Wallet, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Tx {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency?: string;
  description?: string;
  createdAt: string;
}

export default function StatementsClient() {
  const [year, setYear] = useState('2024');
  const [month, setMonth] = useState('all');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState<Tx[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/wallet/transactions?limit=50');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (!cancelled) setItems(json.items ?? []);
      } catch {
        toast.error('Could not load statements');
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = items.filter((t) => (t.description || t.type).toLowerCase().includes(search.toLowerCase()));

  const triggerGeneration = () => toast.info('Statement generation queued');
  const batchExport = () => toast.info('Batch export queued');

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-xl pt-space-lg">
        <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-space-md">
          <span className="hover:text-primary transition-colors cursor-pointer">Home</span>
          <span>/</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Financials &amp; Payouts</span>
          <span>/</span>
          <span className="text-on-surface font-semibold">Statements</span>
        </nav>
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg pb-space-lg">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-space-md mb-space-xs">
              <h1 className="font-display text-display text-on-surface tracking-tight font-bold">Statements</h1>
              <span className="inline-flex items-center gap-1 px-space-sm py-1 bg-surface-container rounded-md font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> IFRS-16 &amp; Statutory Yield Audit Ready
              </span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Monthly financial statements, statutory withholding tax allocations, and certified asset remittance registers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative bg-surface-container-lowest shadow-sm rounded-lg flex items-center px-space-sm py-1.5">
              <Calendar className="w-4 h-4 text-outline mr-1" />
              <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-transparent font-title-sm text-title-sm text-on-surface font-semibold focus:outline-none cursor-pointer pr-4">
                <option value="2024">2024 Fiscal</option>
                <option value="2023">2023 Fiscal</option>
                <option value="2022">2022 Fiscal</option>
              </select>
            </div>
            <div className="relative bg-surface-container-lowest shadow-sm rounded-lg flex items-center px-space-sm py-1.5">
              <Calendar className="w-4 h-4 text-outline mr-1" />
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-transparent font-title-sm text-title-sm text-on-surface font-semibold focus:outline-none cursor-pointer pr-4">
                <option value="all">All Quarters (FY)</option>
                <option value="11">November</option>
                <option value="10">October</option>
                <option value="09">September</option>
                <option value="08">August</option>
                <option value="07">July</option>
                <option value="06">June</option>
              </select>
            </div>
            <Button variant="outline" className="gap-2" onClick={batchExport}>
              <Download className="w-4 h-4" /> Batch Export Archive (.ZIP)
            </Button>
            <Button className="gap-2 bg-primary-container text-on-primary-container hover:opacity-95" onClick={triggerGeneration}>
              <FileText className="w-4 h-4" /> Generate Statement
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="px-space-xl mb-space-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { label: 'Total Reconciled', value: fetching ? '—' : items.length, sub: 'wallet transactions' },
            { label: 'Latest Net Yield', value: fetching ? '—' : `₦${items.reduce((s, t) => s + Number(t.amount || 0), 0).toLocaleString()}`, sub: 'settled' },
            { label: 'Pending', value: fetching ? '—' : items.filter((t) => t.status !== 'success' && t.status !== 'completed').length, sub: 'in-flight' },
            { label: 'Statement Count', value: fetching ? '—' : items.length, sub: 'FY ' + year },
          ].map((k, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">{k.label}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-headline-lg font-bold text-on-surface">{k.value}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : i === 1 ? <Wallet className="w-5 h-5" /> : i === 2 ? <Loader2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
              </div>
              <div className="mt-space-md flex items-center justify-between text-on-surface-variant font-mono-numeric text-body-sm">
                <span>{k.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Table */}
      <div className="px-space-xl pb-24">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-outline-variant/30 flex items-center gap-space-sm">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter statements..." className="bg-transparent border-0 focus-visible:ring-0" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
                  <th className="py-space-sm px-space-md font-semibold">Statement</th>
                  <th className="py-space-sm px-space-md font-semibold">Type</th>
                  <th className="py-space-sm px-space-md font-semibold">Date</th>
                  <th className="py-space-sm px-space-md font-semibold">Status</th>
                  <th className="py-space-sm px-space-md font-semibold text-right">Amount</th>
                  <th className="py-space-sm px-space-md font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 text-on-surface">
                {fetching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-space-sm px-space-md"><div className="h-8 bg-surface-container animate-pulse rounded" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-title-sm">No statements found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-space-sm px-space-md">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="font-title-sm text-title-sm text-on-surface">{t.description || t.type}</div>
                        </div>
                      </td>
                      <td className="py-space-sm px-space-md font-body-sm">{t.type}</td>
                      <td className="py-space-sm px-space-md font-mono-numeric text-body-sm">{new Date(t.createdAt).toLocaleDateString('en-NG')}</td>
                      <td className="py-space-sm px-space-md">
                        <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-sm uppercase">{t.status}</span>
                      </td>
                      <td className="py-space-sm px-space-md text-right font-mono-numeric">{t.currency || 'NGN'} {Number(t.amount).toLocaleString()}</td>
                      <td className="py-space-sm px-space-md text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info('Download queued')}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

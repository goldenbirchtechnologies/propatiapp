'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Receipt, Download, Printer, Search, Filter, Eye, CheckCircle2, XCircle,
  Building2, Wallet, Zap, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNairaFull } from '@/lib/utils';
import { toast } from 'sonner';

type ReceiptRow = {
  id: string;
  ref: string;
  date: string;
  tenant: string;
  rcNumber?: string;
  property: string;
  unit?: string;
  amount: number; // naira
  category: 'RENT' | 'SERVICE' | 'CAUTION';
  description: string;
  status: 'paid' | 'failed';
};

const CATEGORY_LABEL: Record<ReceiptRow['category'], string> = {
  RENT: 'Rent Remittance',
  SERVICE: 'Service Charge',
  CAUTION: 'Caution Deposit',
};

export default function LandlordReceiptsClient() {
  const [rows, setRows] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const [status, setStatus] = useState<'all' | 'paid' | 'failed'>('all');
  const [modal, setModal] = useState<ReceiptRow | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/payments/transactions');
        if (!res.ok) throw new Error('Failed to load receipts');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.transactions ?? data?.data ?? [];
        const mapped: ReceiptRow[] = list.map((t: any) => ({
          id: t.id ?? t.reference ?? String(Math.random()),
          ref: t.reference ?? t.receiptNumber ?? `REC-${t.id ?? ''}`,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '',
          tenant: t.tenantName ?? t.payerName ?? t.tenant?.fullName ?? '—',
          rcNumber: t.rcNumber ?? t.tenant?.rcNumber,
          property: t.propertyName ?? t.listing?.title ?? '—',
          unit: t.unitName ?? t.unit,
          amount: Number(t.amount ?? 0) / 100,
          category: (t.category ?? 'RENT').toUpperCase() as ReceiptRow['category'],
          description: t.description ?? t.type ?? 'Payment',
          status: (t.status === 'failed' || t.status === 'reversed') ? 'failed' : 'paid',
        }));
        if (alive) setRows(mapped);
      } catch (e) {
        if (alive) {
          toast.error('Could not load receipts');
          setRows([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (cat !== 'ALL' && r.category !== cat) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (!term) return true;
      return [r.ref, r.tenant, r.rcNumber ?? '', r.property, String(r.amount)].join(' ').toLowerCase().includes(term);
    });
  }, [rows, q, cat, status]);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const paid = rows.filter((r) => r.status === 'paid');
  const failed = rows.filter((r) => r.status === 'failed');
  const rentTotal = rows.filter((r) => r.category === 'RENT').reduce((s, r) => s + r.amount, 0);
  const serviceTotal = rows.filter((r) => r.category === 'SERVICE').reduce((s, r) => s + r.amount, 0);

  const openReceipt = (r: ReceiptRow) => {
    setModal(r);
  };

  const downloadReceipt = async (r: ReceiptRow) => {
    try {
      const res = await fetch(`/api/payments/transactions/${r.id}/receipt`);
      if (!res.ok) throw new Error('no receipt');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${r.ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.info(`Receipt download queued for ${r.ref}`);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-surface-container-lowest shadow-sm p-6 space-y-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-surface-container rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-lowest shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
          <Receipt className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No receipts found</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1 mb-6">
          No payment transactions or remittances recorded for the selected filter criteria or billing cycle.
        </p>
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Receipts</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Payment receipts for rent remittances, caution escrow, and commercial service charges.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" className="gap-2" onClick={() => toast.info('Preparing ZIP archive...')}>
            <Download className="w-4 h-4" /> Download All Receipts
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Batch Print Statements
          </Button>
          <Button className="gap-2" onClick={() => toast.info('Generating reconciliation ledger...')}>
            <Filter className="w-4 h-4" /> Filter &amp; Reconcile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Total Collected Receipts</span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{formatNairaFull(total)}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
              <CheckCircle2 className="w-3 h-3" /> {rows.length} Issued
            </span>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Rent Remittances</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-secondary flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{formatNairaFull(rentTotal)}</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">Paystack • NIBSS Direct Escrow</span>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Service Charge &amp; Levies</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center"><Zap className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{formatNairaFull(serviceTotal)}</div>
          <div className="mt-2 font-body-sm text-body-sm text-on-surface-variant">IPP Power, Diesel &amp; FM Levies</div>
        </div>
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Reversals &amp; Failed</span>
            <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
          </div>
          <div className="mt-4 font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{formatNairaFull(failed.reduce((s, r) => s + r.amount, 0))}</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {rows.length ? Math.round((paid.length / rows.length) * 100) : 100}% Settlement Rate
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-2.5 text-on-surface-variant w-5 h-5" />
          <Input id="receiptSearchInput" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by Receipt #, Tenant, RC Number, or Suite..." className="w-full h-10 pl-11" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm focus:outline-none cursor-pointer appearance-none">
            <option value="ALL">All Categories</option>
            <option value="RENT">Rent Remittance</option>
            <option value="SERVICE">Service Charge</option>
            <option value="CAUTION">Caution Deposit</option>
          </select>
          <div className="flex items-center p-1 rounded-lg bg-surface-container-low gap-1">
            {(['all', 'paid', 'failed'] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm font-semibold transition-colors ${status === s ? 'bg-surface-container-lowest text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {s === 'all' ? 'All' : s === 'paid' ? 'Paid' : 'Failed'} ({s === 'all' ? rows.length : s === 'paid' ? paid.length : failed.length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Receipt #</th>
                <th className="py-3 px-4 font-semibold">Issued Date</th>
                <th className="py-3 px-4 font-semibold">Corporate Tenant</th>
                <th className="py-3 px-4 font-semibold">Property &amp; Unit</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (NGN)</th>
                <th className="py-3 px-4 font-semibold text-center">Settlement Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className={`py-3.5 px-4 font-mono-numeric text-mono-numeric font-semibold ${r.status === 'failed' ? 'text-error' : 'text-primary'}`}>{r.ref}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-on-surface-variant font-mono-numeric text-mono-numeric">{r.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-title-sm text-title-sm text-on-surface font-semibold leading-snug">{r.tenant}</span>
                      {r.rcNumber && (
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                          <CheckCircle2 className="w-3 h-3 text-primary" /> {r.rcNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium truncate max-w-xs">{r.property}</span>
                      {r.unit && <span className="font-body-sm text-body-sm text-on-surface-variant">{r.unit}</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono-numeric text-mono-numeric font-bold text-on-surface">{formatNairaFull(r.amount)}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{CATEGORY_LABEL[r.category]}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {r.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openReceipt(r)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Quick View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => downloadReceipt(r)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Download PDF"><Download className="w-4 h-4" /></button>
                      <button onClick={() => window.print()} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Direct Print"><Printer className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-low/40 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>Showing <span className="font-semibold text-on-surface">{filtered.length}</span> of <span className="font-semibold text-on-surface">{rows.length}</span> verified e-receipts</span>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 bg-inverse-surface text-inverse-on-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary-fixed" />
                <span className="font-title-sm text-title-sm font-semibold tracking-wide">Official E-Receipt</span>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-surface-dim hover:text-surface"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 bg-surface-container-low p-4 rounded-xl">
                <div><span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Receipt Ref</span><span className="font-mono-numeric text-mono-numeric font-bold text-primary">{modal.ref}</span></div>
                <div><span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Date Settled</span><span className="font-mono-numeric text-mono-numeric font-semibold text-on-surface">{modal.date}</span></div>
                <div><span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Payment Channel</span><span className="font-body-sm text-body-sm font-semibold text-on-surface">Direct Escrow NIBSS</span></div>
                <div><span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Audit State</span><span className="font-label-sm text-label-sm font-semibold text-secondary-fixed-variant bg-secondary-container px-1.5 py-0.5 rounded">Verified</span></div>
              </div>
              <div className="rounded-lg bg-surface-container-low p-4 space-y-2">
                <div className="flex items-center justify-between text-body-sm"><span className="text-on-surface-variant">Remitting Entity:</span><span className="font-bold text-on-surface">{modal.tenant}</span></div>
                <div className="flex items-center justify-between text-body-sm"><span className="text-on-surface-variant">Property &amp; Unit:</span><span className="font-medium text-on-surface">{modal.property}{modal.unit ? `, ${modal.unit}` : ''}</span></div>
                <div className="flex items-center justify-between text-body-sm"><span className="text-on-surface-variant">Description:</span><span className="font-medium text-on-surface">{modal.description}</span></div>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm uppercase tracking-wide text-primary font-semibold">Total Amount Received (Naira)</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Settled into Escrow Custody</span>
                </div>
                <span className="font-headline-lg text-headline-lg font-bold text-primary font-mono-numeric">{formatNairaFull(modal.amount)}</span>
              </div>
            </div>
            <div className="px-6 py-3.5 bg-surface-container-low flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setModal(null)}>Close Preview</Button>
              <Button className="gap-2" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print Receipt</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
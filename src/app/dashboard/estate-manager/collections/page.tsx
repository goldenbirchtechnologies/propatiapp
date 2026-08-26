'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ManagedCollectionsPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/managed?status=in_escrow', { cache: 'no-store' });
      const data = await res.json();
      setItems(data?.items ?? []);
    } catch { toast.error('Failed to load managed collections'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const formatAmount = (v: number | bigint) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(v));
  return (
    <DashboardShell navigation={[{label:'Dashboard',href:'/dashboard/estate-manager'},{label:'Managed Collections',href:'/dashboard/estate-manager/collections'}]} userRole="estate_manager" userName="Manager">

      <ErrorBoundary>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Managed collections</h3>
        </div>
        <div className="p-6">
          {loading && <p className="text-sm text-zinc-500">Loading...</p>}
          {!loading && items.length === 0 && <p className="text-sm text-zinc-500">No pending managed collections.</p>}
          <div className="space-y-4">
            {items.map((tx) => (
              <div key={String(tx.id)} className="flex items-center justify-between rounded-xl border border-white/[0.08]/60 bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{String(tx.listing?.title || tx.reference)}</p>
                  <p className="text-xs text-zinc-500">Tenant: {String(tx.payer?.fullName || tx.payerId)} • Landlord: {String(tx.payee?.fullName || tx.payeeId)}</p>
                  <p className="text-[11px] text-zinc-500">{new Date(String(tx.createdAt)).toLocaleString()}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold">{formatAmount(tx.payeeAmount || tx.amount)}</p>
                    <p className="text-xs text-zinc-500">Payee amount</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { window.location.href = `/dashboard/estate-manager/disbursements?landlordId=${tx.payeeId}&amount=${Number(tx.payeeAmount || tx.amount) / 100}&reference=${tx.reference}`; }}>Disburse</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

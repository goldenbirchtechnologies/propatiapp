'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

      <Card>
        <CardHeader>
          <CardTitle>Managed collections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">No pending managed collections.</p>}
          <div className="space-y-4">
            {items.map((tx) => (
              <div key={String(tx.id)} className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{String(tx.listing?.title || tx.reference)}</p>
                  <p className="text-xs text-muted-foreground">Tenant: {String(tx.payer?.fullName || tx.payerId)} • Landlord: {String(tx.payee?.fullName || tx.payeeId)}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(String(tx.createdAt)).toLocaleString()}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold">{formatAmount(tx.payeeAmount || tx.amount)}</p>
                    <p className="text-xs text-muted-foreground">Payee amount</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { window.location.href = `/dashboard/estate-manager/disbursements?landlordId=${tx.payeeId}&amount=${Number(tx.payeeAmount || tx.amount) / 100}&reference=${tx.reference}`; }}>Disburse</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

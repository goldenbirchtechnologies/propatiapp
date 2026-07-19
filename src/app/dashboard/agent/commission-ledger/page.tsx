'use client';
import { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CommissionLedgerPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/transactions?limit=50&types=adjustment', { cache: 'no-store' });
      const data = await res.json();
      setItems(data?.items ?? []);
    } catch { toast.error('Failed to load commissions'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const formatAmount = (v: number | string | bigint) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(v));
  return (
    <DashboardShell navigation={[{label:'Dashboard',href:'/dashboard/agent'},{label:'Commissions',href:'/dashboard/agent/commissions'},{label:'Commission Ledger',href:'/dashboard/agent/commission-ledger'}]} userRole="agent" userName="Agent">

      <ErrorBoundary>

      <Card>
        <CardHeader><CardTitle>Commission ledger</CardTitle></CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">No commissions yet.</p>}
          <div className="space-y-4">
            {items.map((tx) => (
              <div key={String(tx.id)} className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{String(tx.type ?? 'adjustment').toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{String(tx.description ?? '')}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(String(tx.createdAt)).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatAmount(tx.amount)}</p>
                  <Badge variant="secondary" className="mt-1">{String(tx.status)}</Badge>
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

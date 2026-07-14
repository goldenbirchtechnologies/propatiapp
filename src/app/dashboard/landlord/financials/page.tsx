import { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DollarSign, TrendingUp, AlertCircle, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function LandlordFinancialsPage() {
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/transactions?limit=50', { cache: 'no-store' });
      const data = await res.json();
      setTransactions(data?.items ?? []);
    } catch (e) { setError('Failed to load transactions'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Financials</h1>
          <p className="text-muted-foreground mt-1">Overview of income, expenses, and payout history.</p>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive">Retry</button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financials</h1>
            <p className="text-muted-foreground mt-1">Overview of income, expenses, and payout history.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="mr-2 size-4" /> Refresh</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{Number((transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) / 100)).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From wallet transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.filter(tx => String(tx.status).toLowerCase() === 'pending' || String(tx.status).toLowerCase() === 'in_escrow').length}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">Recent total</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card overflow-hidden">
          {loading && (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded bg-muted/30 mb-2" />
              ))}
            </div>
          )}
          {!loading && transactions.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium text-primary">No transactions yet</h3>
              <p className="text-on-surface-variant">Transactions will appear here as they occur.</p>
            </div>
          )}
          {!loading && transactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Reference</th>
                    <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const key = String(tx.id ?? tx.reference ?? Math.random());
                    const st = String(tx.status || '').toLowerCase();
                    return (
                      <tr key={key} className="border-b border-outline-variant">
                        <td className="p-4 text-on-surface-variant">{new Date(String(tx.createdAt ?? '')).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 text-primary">{String(tx.reference ?? tx.id ?? '—').slice(-8)}</td>
                        <td className="p-4 text-right text-headline-sm text-primary">₦{Number(tx.amount || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <Badge variant={st === 'released' || st === 'success' ? 'success' : st === 'pending' || st === 'in_escrow' ? 'secondary' : st === 'disputed' ? 'destructive' : 'outline'} className="capitalize">{String(tx.status ?? 'unknown').replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {(['in_escrow','pending'].includes(st)) && (
                              <Button size="sm" onClick={async () => { await fetch('/api/transactions/' + tx.id + '/confirm', { method: 'POST' }); toast.success('Payment confirmed'); load(); }}>Confirm</Button>
                            )}
                            {['in_escrow','pending','partially_confirmed','fully_confirmed'].includes(st) && (
                              <Button variant="destructive" size="sm" onClick={async () => { await fetch('/api/transactions/' + tx.id + '/dispute', { method: 'POST' }); toast.error('Dispute filed'); load(); }}>Dispute</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Invoice } from '@/lib/api';

const statusConfig: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-white dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Draft' },
  sent: { class: 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]', label: 'Sent' },
  paid: { class: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20', label: 'Paid' },
  overdue: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Overdue' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

export default function LandlordInvoicesClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ tenantId: '', amount: '', dueDate: '', type: 'rent', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiEndpoints.invoices.list({ page: 1, limit: 50 });
      setInvoices((res.data as unknown as Invoice[]) || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createInvoice = async () => {
    await apiEndpoints.invoices.create({
      tenantId: formData.tenantId || undefined,
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      type: formData.type as unknown,
      notes: formData.notes || undefined,
      items: [{ description: `${formData.type} payment`, amount: Number(formData.amount), quantity: 1 }],
    });
    setShowForm(false);
    setFormData({ tenantId: '', amount: '', dueDate: '', type: 'rent', notes: '' });
    await load();
  };

  const markPaid = async (id: string) => {
    setActionId(id);
    await apiEndpoints.invoices.markPaid(id);
    await load();
    setActionId(null);
  };

  const sendInvoice = async (id: string) => {
    setActionId(id);
    await apiEndpoints.invoices.send(id);
    await load();
    setActionId(null);
  };

  const downloadReceipt = async (id: string) => {
    window.open(`/api/invoices/${id}/receipt`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading text-zinc-900 dark:text-white">Invoices</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Create, send, and manage invoices.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Invoice'}</Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-6">
          <h5 className="font-heading text-zinc-900 dark:text-white mb-4">Create Invoice</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input value={formData.tenantId} onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })} placeholder="Tenant user ID" />
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount" required />
            <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
            <Button variant="secondary" onClick={createInvoice} className="px-6">Create</Button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        
              {/* Stitch-brand alert/hero cards (from DESIGN.md) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">No Organisation Linked</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">KYC REQUIREMENT — attach a verified legal entity before syndicate listings.</p>
                    <div className="mt-2 flex gap-1.5">
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase tracking-wider">KYC REQUIREMENT</Badge>
                      <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/10 text-[10px] uppercase tracking-wider">3 Overdue</Badge>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Revenue Sources &amp; Streams</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Total stable cash inflow: &#x20A6;11,400,000 paid 30-day-cycles.</p>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">&#x20A6;11,400,000</p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Operational Expense Allocations</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Quarterly maintenance pool: &#x20A6;28,450,000 on hold.</p>
                    <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1">&#x20A6;28,450,000</p>
                  </div>
                </div>
                <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Delinquency &amp; Arrears Recovery Desk</p>
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">&#x20A6;11,400,000</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Tenant flagged in LASRERA dispute escalation queue.</p>
                  </div>
                </div>
              </div>

{loading ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-white dark:bg-zinc-950/50">
                  <th className="px-4 py-3 font-label-sm text-zinc-600 dark:text-zinc-400 uppercase">Invoice</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-600 dark:text-zinc-400 uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-600 dark:text-zinc-400 uppercase">Amount</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-600 dark:text-zinc-400 uppercase">Due</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-600 dark:text-zinc-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {(invoices as unknown as Invoice[]).map((invoice: unknown) => (
                  <tr key={invoice.id} className="hover:bg-white dark:bg-zinc-950/60">
                    <td className="px-4 py-3 text-sm">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">₦{Number(invoice.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{new Date(invoice.dueDate).toLocaleDateString('en-NG')}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      {invoice.status !== 'paid' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => sendInvoice(invoice.id)} disabled={actionId === invoice.id}>
                            {actionId === invoice.id ? '...' : 'Send'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => markPaid(invoice.id)} disabled={actionId === invoice.id}>
                            {actionId === invoice.id ? '...' : 'Mark Paid'}
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => downloadReceipt(invoice.id)}>Receipt</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Invoice } from '@/lib/api';

const statusConfig: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-obsidian-800/30 text-neutral-400 border-[#262626]', label: 'Draft' },
  sent: { class: 'bg-[#262626] text-neutral-300 border-[#262626]', label: 'Sent' },
  paid: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Paid' },
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
          <h4 className="font-heading text-white">Invoices</h4>
          <p className="text-sm text-neutral-400">Create, send, and manage invoices.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Invoice'}</Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-6">
          <h5 className="font-heading text-white mb-4">Create Invoice</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input value={formData.tenantId} onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })} placeholder="Tenant user ID" />
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount" required />
            <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
            <Button variant="secondary" onClick={createInvoice} className="px-6">Create</Button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        {loading ? (
          <p className="text-sm text-neutral-400">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-neutral-400">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-obsidian-800/30">
                  <th className="px-4 py-3 font-label-sm text-neutral-400 uppercase">Invoice</th>
                  <th className="px-4 py-3 font-label-sm text-neutral-400 uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-neutral-400 uppercase">Amount</th>
                  <th className="px-4 py-3 font-label-sm text-neutral-400 uppercase">Due</th>
                  <th className="px-4 py-3 font-label-sm text-neutral-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {(invoices as unknown as Invoice[]).map((invoice: unknown) => (
                  <tr key={invoice.id} className="hover:bg-obsidian-800-lowest/60">
                    <td className="px-4 py-3 text-sm">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">₦{Number(invoice.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{new Date(invoice.dueDate).toLocaleDateString()}</td>
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

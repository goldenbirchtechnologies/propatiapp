'use client';

import { useEffect, useState } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-obsidian-800/30 text-neutral-400 border-[#262626]', label: 'Draft' },
  sent: { class: 'bg-[#262626] text-neutral-300 border-[#262626]', label: 'Sent' },
  paid: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Paid' },
  overdue: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Overdue' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

export default function TenantInvoicesClient() {
  const [invoices, setInvoices] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiEndpoints.invoices.list({ page: 1, limit: 50 });
      setInvoices((res.data as unknown[]) || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const downloadReceipt = (id: string) => {
    window.open(`/api/invoices/${id}/receipt`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-heading text-white">Invoices</h4>
        <p className="text-sm text-neutral-400">Your rent invoices and receipts.</p>
      </div>

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
                {invoices.map((invoice: unknown) => (
                  <tr key={invoice.id} className="hover:bg-obsidian-800-lowest/60">
                    <td className="px-4 py-3 text-sm">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">₦{Number(invoice.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
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

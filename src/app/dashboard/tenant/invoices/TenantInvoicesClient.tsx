'use client';

import { useEffect, useState } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-surface-container-low text-on-surface-variant border-outline-variant', label: 'Draft' },
  sent: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Sent' },
  paid: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Paid' },
  overdue: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Overdue' },
  cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelled' },
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
        <h4 className="font-heading text-primary">Invoices</h4>
        <p className="text-sm text-on-surface-variant">Your rent invoices and receipts.</p>
      </div>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Invoice</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Amount</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Due</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {invoices.map((invoice: unknown) => (
                  <tr key={invoice.id} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-3 text-sm">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">₦{Number(invoice.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="ghost" size="sm" onClick={() => downloadReceipt(invoice.id)}>Receipt</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Receipt, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceChargeItem {
  id: string;
  period: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: string;
  description?: string;
  listing: { title: string; address: string };
  organization: { name: string };
}

const invoiceStatusSchema: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-surface-container-low text-on-surface-variant border-outline-variant', label: 'Draft' },
  sent: { class: 'bg-primary/10 text-primary border-primary/20', label: 'Sent' },
  paid: { class: 'bg-success/10 text-success border-success/20', label: 'Paid' },
  overdue: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Overdue' },
  cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelled' },
};

export default function ServiceChargesPage() {
  const [charges, setCharges] = useState<ServiceChargeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchCharges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/service-charges');
      const json = await res.json();
      setCharges(json.charges || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load service charges',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      listingId: formData.get('listingId') as string,
      organizationId: formData.get('organizationId') as string,
      period: formData.get('period') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'NGN',
      dueDate: formData.get('dueDate') as string,
      description: formData.get('description') as string,
    };

    try {
      const res = await fetch('/api/service-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }

      toast({ title: 'Success', description: 'Service charge created' });
      setIsCreateDialogOpen(false);
      fetchCharges();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create service charge';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const filtered =
    statusFilter === 'all' ? charges : charges.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-headline-sm"
            style={{ color: 'var(--primary)' }}
          >
            Service Charges
          </h1>
          <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>
            View and manage service charges for your portfolio
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service Charge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Service Charge</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Listing ID
                </label>
                <Input name="listingId" placeholder="Listing ID" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Organization ID
                </label>
                <Input name="organizationId" placeholder="Organization ID" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Period
                </label>
                <Input name="period" placeholder="e.g. 2024-Q1" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Amount
                </label>
                <Input name="amount" type="number" placeholder="Amount" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Due Date
                </label>
                <Input name="dueDate" type="date" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Description
                </label>
                <Input name="description" placeholder="Description (optional)" />
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-wrap items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No service charges found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Period
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Listing
                </th>
                <th className="text-right p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Amount
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Due Date
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((charge) => {
                const sc = invoiceStatusSchema[charge.status] || {
                  class: '',
                  label: charge.status,
                };
                return (
                  <tr
                    key={charge.id}
                    className="border-b border-outline-variant transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 text-sm font-medium text-primary">
                      {charge.period}
                    </td>
                    <td className="p-4 text-sm text-primary">
                      {charge.listing?.title}
                      <p className="text-xs text-muted-foreground">
                        {charge.listing?.address}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-right font-medium text-primary">
                      ₦{Number(charge.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-primary">
                      {new Date(charge.dueDate).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}
                      >
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

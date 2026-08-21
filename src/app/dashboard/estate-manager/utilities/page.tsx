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
import { Zap, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UtilityAllocationItem {
  id: string;
  type: string;
  reading?: number;
  amount: number;
  currency: string;
  billingPeriod: string;
  dueDate: string;
  status: string;
  unit: {
    unitNumber: string;
    buildingName: string;
    organization: { name: string };
  };
}

const invoiceStatusSchema: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-surface text-muted-foreground border-[#262626]', label: 'Draft' },
  sent: { class: 'bg-[#262626] text-white border-primary/20', label: 'Sent' },
  paid: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Paid' },
  overdue: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Overdue' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

const utilityTypeLabels: Record<string, string> = {
  electricity: 'Electricity',
  water: 'Water',
  waste: 'Waste',
  security: 'Security',
  other: 'Other',
};

export default function UtilitiesPage() {
  const [allocations, setAllocations] = useState<UtilityAllocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/utilities');
      const json = await res.json();
      setAllocations(json.allocations || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load utility allocations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      unitId: formData.get('unitId') as string,
      type: formData.get('type') as string,
      reading: formData.get('reading') ? parseFloat(formData.get('reading') as string) : undefined,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'NGN',
      billingPeriod: formData.get('billingPeriod') as string,
      dueDate: formData.get('dueDate') as string,
    };

    try {
      const res = await fetch('/api/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }

      toast({ title: 'Success', description: 'Utility allocation created' });
      setIsCreateDialogOpen(false);
      fetchAllocations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create utility allocation';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const filtered = allocations.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-headline-sm"
            style={{ color: 'var(--primary)' }}
          >
            Utility Allocations
          </h1>
          <p className="text-muted-foreground" style={{ marginTop: 'var(--space-vs)' }}>
            View and manage utility allocations for your portfolio
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Utility Allocation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Utility Allocation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Unit ID
                </label>
                <Input name="unitId" placeholder="Unit ID" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Type
                </label>
                <select
                  name="type"
                  defaultValue="electricity"
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  style={{ color: 'var(--text)' }}
                >
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Reading
                </label>
                <Input name="reading" type="number" placeholder="Reading (optional)" />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Amount
                </label>
                <Input name="amount" type="number" placeholder="Amount" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Billing Period
                </label>
                <Input name="billingPeriod" placeholder="e.g. 2024-01" required />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Due Date
                </label>
                <Input name="dueDate" type="date" required />
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-background rounded-xl border border-[#262626] shadow-sm p-4 flex flex-wrap items-center gap-4">
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Utility Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="electricity">Electricity</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="waste">Waste</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background rounded-xl border border-[#262626] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No utility allocations found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">
                  Unit
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="text-right p-4 text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">
                  Billing Period
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">
                  Due Date
                </th>
                <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((allocation) => {
                const sc = invoiceStatusSchema[allocation.status] || {
                  class: '',
                  label: allocation.status,
                };
                return (
                  <tr
                    key={allocation.id}
                    className="border-b border-[#262626] transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 text-sm text-white">
                      <span className="font-medium">{allocation.unit?.unitNumber}</span>
                      <p className="text-xs text-muted-foreground">
                        {allocation.unit?.buildingName}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-white">
                      {utilityTypeLabels[allocation.type] || allocation.type}
                    </td>
                    <td className="p-4 text-sm text-right font-medium text-white">
                      ₦{Number(allocation.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-white">
                      {allocation.billingPeriod}
                    </td>
                    <td className="p-4 text-sm text-white">
                      {new Date(allocation.dueDate).toLocaleDateString('en-NG', {
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

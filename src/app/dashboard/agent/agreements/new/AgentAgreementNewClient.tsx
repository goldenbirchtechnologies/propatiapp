'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type Props = { dealId?: string };

export default function AgentAgreementNewClient({ dealId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    listingId: '',
    tenantId: '',
    type: 'rent',
    rentAmount: '',
    rentPeriod: 'monthly',
    startDate: '',
    endDate: '',
    cautionDeposit: '',
    serviceCharge: '',
    specialClauses: '',
    dealId: dealId || '',
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        listingId: form.listingId,
        tenantId: form.tenantId,
        type: form.type,
        rentAmount: Number(form.rentAmount),
        rentPeriod: form.rentPeriod,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        cautionDeposit: form.cautionDeposit ? Number(form.cautionDeposit) : undefined,
        serviceCharge: form.serviceCharge ? Number(form.serviceCharge) : undefined,
        specialClauses: form.specialClauses || undefined,
      };
      const res = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create agreement');
      }
      const json = await res.json();
      toast({ title: 'Agreement created', description: 'Agreement draft saved successfully' });
      router.push(`/dashboard/agent/agreements/${json.data.id}`);
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">New Agreement</h1>
        <p className="text-zinc-500 mt-1">Create a new agreement draft from a deal.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="listingId">Listing ID</Label>
          <Input id="listingId" value={form.listingId} onChange={update('listingId')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input id="tenantId" value={form.tenantId} onChange={update('tenantId')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dealid">Deal ID (optional)</Label>
          <Input id="dealid" value={form.dealId} onChange={update('dealId')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input id="type" value={form.type} onChange={update('type')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rentAmount">Rent Amount</Label>
          <Input id="rentAmount" type="number" value={form.rentAmount} onChange={update('rentAmount')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rentPeriod">Rent Period</Label>
          <Input id="rentPeriod" value={form.rentPeriod} onChange={update('rentPeriod')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" value={form.startDate} onChange={update('startDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" value={form.endDate} onChange={update('endDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cautionDeposit">Caution Deposit</Label>
          <Input id="cautionDeposit" type="number" value={form.cautionDeposit} onChange={update('cautionDeposit')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceCharge">Service Charge</Label>
          <Input id="serviceCharge" type="number" value={form.serviceCharge} onChange={update('serviceCharge')} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specialClauses">Special Clauses</Label>
          <textarea
            id="specialClauses"
            className="w-full rounded-md border border-white/[0.08] bg-background p-2 text-sm"
            value={form.specialClauses}
            onChange={update('specialClauses')}
          />
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Agreement'}
      </Button>
    </form>
  );
}

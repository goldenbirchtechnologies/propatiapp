'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function DisbursementsForm() {
  const search = useSearchParams();
  const [listingRef, setListingRef] = useState(() => search.get('reference') || '');
  const [landlordId, setLandlordId] = useState(() => search.get('landlordId') || '');
  const [amount, setAmount] = useState(() => search.get('amount') || '');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/disburse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transactionId: listingRef, landlordId, amount: Number(amount), description: 'Managed collection disbursement' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Disbursed to landlord');
      setAmount(''); setListingRef(''); setLandlordId('');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Disbursement failed'); }
    finally { setLoading(false); }
  }
  return (
    <DashboardShell navigation={[{label:'Dashboard',href:'/dashboard/estate-manager'},{label:'Disbursements',href:'/dashboard/estate-manager/disbursements'}]} userRole="estate_manager" userName="Manager">

      <ErrorBoundary>

      <div className="glass-card max-w-xl">
        <div className="px-6 py-5 border-b border-white/[0.08]"><h3 className="text-lg font-semibold text-white">Disburse to landlord</h3></div>
        <div className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field><FieldLabel>Listing reference / Agreement ID</FieldLabel><Input value={listingRef} onChange={e=>setListingRef(e.target.value)} required /></Field>
            <Field><FieldLabel>Landlord user ID</FieldLabel><Input value={landlordId} onChange={e=>setLandlordId(e.target.value)} required /></Field>
            <Field><FieldLabel>Amount (₦)</FieldLabel><Input type="number" min={100} value={amount} onChange={e=>setAmount(e.target.value)} required /></Field>
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Processing...' : 'Disburse'}</Button>
          </form>
        </div>
      </div>

      </ErrorBoundary>
</DashboardShell>
  );
}

export default function DisbursementsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500">Loading…</div>}>
      <DisbursementsForm />
    </Suspense>
  );
}

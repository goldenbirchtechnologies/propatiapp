'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingLandlordSettlementSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { OnboardingLandlordSettlementInput } from '@/lib/validators';

export default function LandlordSettlementStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingLandlordSettlementInput>({
    resolver: zodResolver(onboardingLandlordSettlementSchema),
  });

  async function onSubmit(values: OnboardingLandlordSettlementInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/landlord/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Settlement instructions saved.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bank name</Label>
          <Input placeholder="GTBank" {...form.register('bankName')} />
        </div>
        <div className="space-y-2">
          <Label>Account name</Label>
          <Input placeholder="Golden Birch Technologies Ltd." {...form.register('accountName')} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Account number (NUBAN)</Label>
          <Input placeholder="0123456789" {...form.register('accountNumber')} />
        </div>
        <div className="space-y-2">
          <Label>BVN (optional, for verification)</Label>
          <Input placeholder="22XXXXXXXXX" {...form.register('bvn')} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Target monthly rent (₦)</Label>
          <Input type="number" placeholder="500000" {...form.register('targetMonthlyRent')} />
        </div>
        <div className="space-y-2">
          <Label>Annual target (₦)</Label>
          <Input type="number" placeholder="6000000" {...form.register('targetAnnualRent')} />
        </div>
        <div className="space-y-2">
          <Label>Security deposit (₦)</Label>
          <Input type="number" placeholder="500000" {...form.register('securityDeposit')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Preferred lease duration</Label>
        <Select onValueChange={(v) => form.setValue('preferredLeaseDuration', v as OnboardingLandlordSettlementInput['preferredLeaseDuration'])}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">6 months</SelectItem>
            <SelectItem value="12m">12 months</SelectItem>
            <SelectItem value="24m">24 months</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="commissionConsent"
          onCheckedChange={(v) => form.setValue('commissionConsent', v === true)}
        />
        <Label htmlFor="commissionConsent" className="text-sm font-normal leading-tight">
          I acknowledge agency commission percentages, maintenance reserve caps, and onboarding setup fees.
        </Label>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#10b981] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save settlement instructions
      </Button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingEstateRemittanceSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { OnboardingEstateRemittanceInput } from '@/lib/validators';

export default function EstateRemittanceStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingEstateRemittanceInput>({
    resolver: zodResolver(onboardingEstateRemittanceSchema),
    defaultValues: { remittanceCycle: 'monthly' },
  });

  async function onSubmit(values: OnboardingEstateRemittanceInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/estate/remittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Remittance & trust account saved.');
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
          <Label>Trust bank name</Label>
          <Input placeholder="GTBank" {...form.register('trustBankName')} />
        </div>
        <div className="space-y-2">
          <Label>Trust account name</Label>
          <Input placeholder="Golden Birch Client Trust" {...form.register('trustAccountName')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Trust account number (NUBAN)</Label>
        <Input placeholder="0123456789" {...form.register('trustAccountNumber')} />
      </div>
      <div className="space-y-2">
        <Label>Remittance cycle</Label>
        <Select value={form.watch('remittanceCycle')} onValueChange={(v) => form.setValue('remittanceCycle', v as OnboardingEstateRemittanceInput['remittanceCycle'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="instant">Instant split transfer</SelectItem>
            <SelectItem value="monthly">Monthly cycle</SelectItem>
            <SelectItem value="annual">Annual disbursement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Management fee type (optional)</Label>
          <Select onValueChange={(v) => form.setValue('managementFeeType', v as OnboardingEstateRemittanceInput['managementFeeType'])}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percentage</SelectItem>
              <SelectItem value="flat">Flat rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Management fee value</Label>
          <Input type="number" placeholder="10 or 50000" {...form.register('managementFeeValue')} />
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="whtInstructionAcknowledged" onCheckedChange={(v) => form.setValue('whtInstructionAcknowledged', v === true)} />
        <Label htmlFor="whtInstructionAcknowledged" className="text-sm font-normal leading-tight">
          I acknowledge tax withholding (WHT) protocols on rental income where applicable.
        </Label>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#10b981] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save remittance details
      </Button>
    </form>
  );
}

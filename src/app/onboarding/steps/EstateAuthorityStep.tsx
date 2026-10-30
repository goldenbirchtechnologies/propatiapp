'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingEstateAuthoritySchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { OnboardingEstateAuthorityInput } from '@/lib/validators';

export default function EstateAuthorityStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingEstateAuthorityInput>({
    resolver: zodResolver(onboardingEstateAuthoritySchema),
    defaultValues: { hasManagementAgreement: false, evictionAuthority: false },
  });

  async function onSubmit(values: OnboardingEstateAuthorityInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/estate/authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Authority & mandate saved.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-start gap-2">
        <Checkbox id="hasManagementAgreement" onCheckedChange={(v) => form.setValue('hasManagementAgreement', v === true)} />
        <Label htmlFor="hasManagementAgreement" className="text-sm font-normal leading-tight">
          I have an executed Property Management Agreement / Power of Attorney granting legal authority to act on behalf of the landlord.
        </Label>
      </div>
      <div className="space-y-2">
        <Label>Agreement file name (if uploaded)</Label>
        <Input placeholder="management-agreement-2024.pdf" {...form.register('agreementFileName')} />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="evictionAuthority" onCheckedChange={(v) => form.setValue('evictionAuthority', v === true)} />
        <Label htmlFor="evictionAuthority" className="text-sm font-normal leading-tight">
          Authorized to serve legal notices (e.g. Quit Notices) and handle tenancy disputes.
        </Label>
      </div>
      <div className="space-y-2">
        <Label>Eviction authority note (optional)</Label>
        <Input placeholder="Authorized per clause 4.2 of management agreement" {...form.register('evictionAuthorityNote')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Minimum income threshold (₦/month, optional)</Label>
          <Input type="number" placeholder="300000" {...form.register('minIncomeThreshold')} />
        </div>
        <div className="space-y-2">
          <Label>Guarantor requirement note (optional)</Label>
          <Input placeholder="Two guarantors, one must be a civil servant" {...form.register('guarantorRequirementNote')} />
        </div>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save authority & mandate
      </Button>
    </form>
  );
}

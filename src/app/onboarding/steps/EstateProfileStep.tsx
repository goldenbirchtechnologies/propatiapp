'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingEstateProfileSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { OnboardingEstateProfileInput } from '@/lib/validators';

export default function EstateProfileStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingEstateProfileInput>({
    resolver: zodResolver(onboardingEstateProfileSchema),
  });

  async function onSubmit(values: OnboardingEstateProfileInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/estate/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Estate profile saved.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Legal operator entity</Label>
        <Input placeholder="Golden Birch Estate Management Ltd." {...form.register('legalEntityName')} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="isCorporate" onCheckedChange={(v) => form.setValue('isCorporate', v === true)} />
        <Label htmlFor="isCorporate" className="text-sm font-normal">Operating as a registered corporate entity</Label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CAC / TIN number</Label>
          <Input placeholder="RC-1849204 / TIN 12345678-0001" {...form.register('cacTinNumber')} />
        </div>
        <div className="space-y-2">
          <Label>Professional credential (NIESV / ESVARBON)</Label>
          <Input placeholder="ESV-2024-00123" {...form.register('professionalCredentialNumber')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Credential issuing board (optional)</Label>
        <Input placeholder="NIESV" {...form.register('professionalCredentialBoard')} />
      </div>
      <div className="space-y-2">
        <Label>Primary office address</Label>
        <Input placeholder="12 Adeola Odeku St, Victoria Island, Lagos" {...form.register('officeAddress')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Business phone (optional)</Label>
          <Input placeholder="+2348012345678" {...form.register('businessPhone')} />
        </div>
        <div className="space-y-2">
          <Label>Emergency hotline (optional)</Label>
          <Input placeholder="+2348012345679" {...form.register('emergencyHotline')} />
        </div>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save estate profile
      </Button>
    </form>
  );
}

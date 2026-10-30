'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingLandlordProfileSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { OnboardingLandlordProfileInput } from '@/lib/validators';

export default function LandlordProfileStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingLandlordProfileInput>({
    resolver: zodResolver(onboardingLandlordProfileSchema),
    defaultValues: { legalEntityType: 'individual' },
  });

  const entityType = form.watch('legalEntityType');

  async function onSubmit(values: OnboardingLandlordProfileInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/landlord/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Owner profile saved.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Legal ownership entity</Label>
        <Select value={entityType} onValueChange={(v) => form.setValue('legalEntityType', v as OnboardingLandlordProfileInput['legalEntityType'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual owner</SelectItem>
            <SelectItem value="joint">Joint owners</SelectItem>
            <SelectItem value="company">Registered company</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{entityType === 'company' ? 'Registered company name' : 'Full legal name'}</Label>
        <Input placeholder={entityType === 'company' ? 'Golden Birch Technologies Ltd.' : 'Chukwuemeka A. Okafor'} {...form.register('legalName')} />
      </div>
      {entityType === 'joint' && (
        <div className="space-y-2">
          <Label>Joint owners (names)</Label>
          <Input placeholder="Adaeze N. Okafor; Tunde B. Okafor" {...form.register('jointOwnerNames')} />
        </div>
      )}
      {entityType === 'company' && (
        <div className="space-y-2">
          <Label>Company name (as on CAC)</Label>
          <Input placeholder="Golden Birch Technologies Ltd." {...form.register('companyName')} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Primary phone</Label>
          <Input placeholder="+2348012345678" {...form.register('primaryPhone')} />
        </div>
        <div className="space-y-2">
          <Label>Contact email</Label>
          <Input type="email" placeholder="owner@example.com" {...form.register('contactEmail')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mailing address for official notices</Label>
        <Input placeholder="12 Adeola Odeku St, Victoria Island, Lagos" {...form.register('mailingAddress')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tax document type</Label>
          <Select onValueChange={(v) => form.setValue('taxIdType', v as OnboardingLandlordProfileInput['taxIdType'])}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tin">TIN</SelectItem>
              <SelectItem value="nin">NIN</SelectItem>
              <SelectItem value="other">Other tax code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tax number</Label>
          <Input placeholder="TIN / NIN" {...form.register('taxNumber')} />
        </div>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save owner profile
      </Button>
    </form>
  );
}

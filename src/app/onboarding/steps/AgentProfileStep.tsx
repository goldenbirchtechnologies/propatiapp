'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingAgentProfileSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { OnboardingAgentProfileInput } from '@/lib/validators';

export default function AgentProfileStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingAgentProfileInput>({
    resolver: zodResolver(onboardingAgentProfileSchema),
  });

  async function onSubmit(values: OnboardingAgentProfileInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/agent/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Professional profile saved.');
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
          <Label>Full legal name</Label>
          <Input placeholder="Tunde Balogun" {...form.register('legalName')} />
        </div>
        <div className="space-y-2">
          <Label>Date of birth (YYYY-MM-DD)</Label>
          <Input type="date" {...form.register('dateOfBirth')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Home address</Label>
        <Input placeholder="12 Adeola Odeku St, Victoria Island, Lagos" {...form.register('homeAddress')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Business phone</Label>
          <Input placeholder="+2348012345678" {...form.register('businessPhone')} />
        </div>
        <div className="space-y-2">
          <Label>Corporate email</Label>
          <Input type="email" placeholder="agent@brokerage.ng" {...form.register('corporateEmail')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>NIN / BVN / TIN (optional)</Label>
        <Input placeholder="22XXXXXXXXX" {...form.register('ninOrBvnOrTin')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Emergency contact name</Label>
          <Input placeholder="Aisha Balogun" {...form.register('emergencyContactName')} />
        </div>
        <div className="space-y-2">
          <Label>Emergency phone</Label>
          <Input placeholder="+2348012345678" {...form.register('emergencyContactPhone')} />
        </div>
        <div className="space-y-2">
          <Label>Relationship</Label>
          <Input placeholder="Spouse" {...form.register('emergencyContactRelationship')} />
        </div>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#10b981] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save professional profile
      </Button>
    </form>
  );
}

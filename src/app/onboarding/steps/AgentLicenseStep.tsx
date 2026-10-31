'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingAgentLicenseSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import type { OnboardingAgentLicenseInput } from '@/lib/validators';

export default function AgentLicenseStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingAgentLicenseInput>({
    resolver: zodResolver(onboardingAgentLicenseSchema),
  });

  async function onSubmit(values: OnboardingAgentLicenseInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/agent/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Licensing details saved.');
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
          <Label>Real estate board (REDAN / NIESV / regional)</Label>
          <Input placeholder="REDAN" {...form.register('board')} />
        </div>
        <div className="space-y-2">
          <Label>License / certificate number</Label>
          <Input placeholder="REDAN-LAG-2024-00123" {...form.register('licenseNumber')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Acting as agency/firm? (if yes, CAC registry docs required)</Label>
        <Select onValueChange={(v) => form.setValue('isAgency', v === 'true')}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Individual / freelancer</SelectItem>
            <SelectItem value="true">Agency / firm</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Indemnity / E&O policy number</Label>
          <Input placeholder="AXA-PI-2024-8891" {...form.register('indemnityPolicyNumber')} />
        </div>
        <div className="space-y-2">
          <Label>Indemnity expiry date (YYYY-MM-DD)</Label>
          <Input type="date" {...form.register('indemnityExpiryDate')} />
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="codeOfConduct" onCheckedChange={(v) => form.setValue('codeOfConductConsent', (v === true) as true)} />
        <Label htmlFor="codeOfConduct" className="text-sm font-normal leading-tight">
          I confirm background clearance and assent to fair housing guidelines and the ethical code of conduct.
        </Label>
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save licensing details
      </Button>
    </form>
  );
}

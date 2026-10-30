'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingAgentSettlementSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { OnboardingAgentSettlementInput } from '@/lib/validators';

export default function AgentSettlementStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingAgentSettlementInput>({
    resolver: zodResolver(onboardingAgentSettlementSchema),
  });

  async function onSubmit(values: OnboardingAgentSettlementInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/agent/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Settlement & commission saved.');
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
          <Input placeholder="T. Balogun / Balogun Realty Ltd." {...form.register('accountName')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Account number (NUBAN)</Label>
        <Input placeholder="0123456789" {...form.register('accountNumber')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Commission split % (optional)</Label>
          <Input type="number" placeholder="10" {...form.register('commissionSplitPercent')} />
        </div>
        <div className="space-y-2">
          <Label>Subscription tier (optional)</Label>
          <Input placeholder="Premium lead gen" {...form.register('subscriptionTier')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Primary device OS</Label>
        <Select onValueChange={(v) => form.setValue('primaryDeviceOs', v as OnboardingAgentSettlementInput['primaryDeviceOs'])}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ios">iOS</SelectItem>
            <SelectItem value="android">Android</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>CRM / field tool notes (optional)</Label>
        <Input placeholder="e.g. Zoho CRM, iPhone 15 — field workflow: inspection photos via app" {...form.register('crmNotes')} />
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save settlement & commission
      </Button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingIdentitySchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { IdType } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function IdentityStep() {
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const form = useForm({
    resolver: zodResolver(onboardingIdentitySchema),
    defaultValues: { idType: 'nin' },
  });

  async function onSubmit(values: any) {
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Identity check failed');
      setVerified(true);
      setMessage('Identity verified successfully.');
    } catch (e: any) {
      setMessage(e.message || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#10b981]/20 bg-[#10b981]/5 p-3 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#6ffbbe]">Identity verification</p>
          <p className="text-xs text-zinc-500 mt-1">
            Your identity number is encrypted and never shared. We verify it with the official
            Prembly identity gateway for Nigerian NIN/BVN records.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Identity document</Label>
          <Select
            onValueChange={(val) => form.setValue('idType', val as IdType)}
            defaultValue={form.getValues('idType') as IdType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nin">National Identification Number (NIN)</SelectItem>
              <SelectItem value="bvn">Bank Verification Number (BVN)</SelectItem>
              <SelectItem value="passport">International Passport</SelectItem>
              <SelectItem value="drivers_licence">Driver&apos;s Licence</SelectItem>
              <SelectItem value="voters_card">Voter&apos;s Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="id-number">Number</Label>
          <input
            id="id-number"
            type="text"
            placeholder="e.g. 12345678901"
            className="w-full h-10 px-3 rounded-lg bg-[#27272a]/20 text-white text-sm focus:outline-none focus:bg-[#27272a]/30 transition-all"
            {...form.register('number')}
          />
        </div>

        {verified ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-900/20 rounded-lg px-4 py-3">
            <ShieldCheck className="h-4 w-4" />
            Verified — your profile is verified.
          </div>
        ) : (
          <Button type="submit" disabled={saving} className="w-full bg-[#10b981] hover:bg-[#006c49]">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {verified ? 'Verified' : 'Verify identity'}
          </Button>
        )}
      </form>

      {message && (
        <p className="text-sm text-zinc-400">{message}</p>
      )}
    </div>
  );
}

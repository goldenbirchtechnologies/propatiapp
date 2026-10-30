'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingGuarantorSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function GuarantorStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const form = useForm({
    resolver: zodResolver(onboardingGuarantorSchema),
    defaultValues: {},
  });

  async function onSubmit(values: any) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/onboarding/guarantor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save guarantor');
      setMessage('Guarantor details saved.');
      window.location.hash = '#step-guarantor';
    } catch (e: any) {
      setMessage(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input {...form.register('guarantorName')} placeholder="Full name of guarantor" />
        </div>
        <div className="space-y-2">
          <Label>Phone number</Label>
          <Input {...form.register('guarantorPhone')} placeholder="+234 801 234 5678" />
        </div>
        <div className="space-y-2">
          <Label>Relationship</Label>
          <Input {...form.register('guarantorRelationship')} placeholder="e.g. parent, uncle" />
        </div>
        <div className="space-y-2">
          <Label>Address (optional)</Label>
          <Input {...form.register('guarantorAddress')} placeholder="e.g. 10 Main Street, Lagos" />
        </div>
        <div className="space-y-2">
          <Label>Occupation (optional)</Label>
          <Input {...form.register('guarantorOccupation')} placeholder="e.g. Engineer" />
        </div>

        {message && (
          <p className={`text-sm p-3 rounded-lg ${message.startsWith('Guarantor') ? 'bg-primary/20 text-[#4edea3]' : 'bg-[#27272a]/20 text-zinc-300'}`}>
            {message}
          </p>
        )}

        <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save guarantor details
        </Button>
      </form>
    </div>
  );
}
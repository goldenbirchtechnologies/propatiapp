'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingEmploymentSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { EmploymentStatus, EmploymentType } from '@prisma/client';

export default function EmploymentStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const form = useForm({
    resolver: zodResolver(onboardingEmploymentSchema),
    defaultValues: {},
  });

  async function onSubmit(values: any) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/onboarding/employment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save employment details');
      setMessage('Employment details saved.');
      window.location.hash = '#step-employment-done';
    } catch (e: any) {
      setMessage(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <form id="employment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employment status</Label>
            <Select
              onValueChange={(v) => form.setValue('employmentStatus', v as EmploymentStatus)}
              defaultValue={form.getValues('employmentStatus') as EmploymentStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">Employed</SelectItem>
                <SelectItem value="self_employed">Self-employed</SelectItem>
                <SelectItem value="business_owner">Business owner</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Employment type</Label>
            <Select
              onValueChange={(v) => form.setValue('employmentType', v as EmploymentType)}
              defaultValue={form.getValues('employmentType') as EmploymentType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employer</Label>
            <Input
              {...form.register('employerName')}
              placeholder="e.g. Acme Global Ltd"
            />
          </div>

          <div className="space-y-2">
            <Label>Job title</Label>
            <Input {...form.register('jobTitle')} placeholder="e.g. Product Manager" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Yearly income (₦)</Label>
          <input
            type="number"
            {...form.register('yearlyIncome')}
            className="w-full h-10 px-3 rounded-lg bg-[#27272a]/20 text-white text-sm focus:outline-none focus:bg-[#27272a]/30 transition-all"
            placeholder="e.g. 3000000"
          />
        </div>

        <div className="space-y-2">
          <Label>Years in current employment</Label>
          <input
            type="number"
            {...form.register('yearsInEmployment')}
            className="w-full h-10 px-3 rounded-lg bg-[#27272a]/20 text-white text-sm focus:outline-none focus:bg-[#27272a]/30 transition-all"
            placeholder="e.g. 3"
          />
        </div>
      </form>

      {message && (
        <p className={`text-sm p-3 rounded-lg ${message.startsWith('Saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-[#27272a]/20 text-zinc-300'}`}>
          {message}
        </p>
      )}

      <Button type="submit" form="employment-form" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49] mt-4">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save employment details
      </Button>
    </div>
  );
}

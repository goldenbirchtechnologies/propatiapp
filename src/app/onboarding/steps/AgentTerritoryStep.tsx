'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingAgentTerritorySchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { OnboardingAgentTerritoryInput } from '@/lib/validators';

const TERRITORY_PRESETS = ['Lekki', 'Ikeja', 'Victoria Island', 'Ikoyi', 'Gbagada', 'Yaba', 'Abuja (FCT)', 'Port Harcourt'];
const FOCUS_PRESETS = ['Residential Sales', 'Commercial Lettings', 'Luxury Estates', 'Land Flipping', 'Short-Let Management'];

export default function AgentTerritoryStep() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<OnboardingAgentTerritoryInput>({
    resolver: zodResolver(onboardingAgentTerritorySchema),
    defaultValues: { operationalTerritories: [], focusAreas: [] },
  });

  function toggle(list: string[], value: string, field: 'operationalTerritories' | 'focusAreas') {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    form.setValue(field, next, { shouldValidate: true });
  }

  const territories = form.watch('operationalTerritories') ?? [];
  const focusAreas = form.watch('focusAreas') ?? [];

  async function onSubmit(values: OnboardingAgentTerritoryInput) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/onboarding/agent/territory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Could not save');
      setMessage('Territory & portfolio saved.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Operational territories (select all that apply)</Label>
        <div className="flex flex-wrap gap-2">
          {TERRITORY_PRESETS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggle(territories, t, 'operationalTerritories')}
              className={`px-3 py-1.5 rounded-full text-xs border ${territories.includes(t) ? 'bg-[#006c49] text-white border-[#006c49]' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Real estate focus areas</Label>
        <div className="flex flex-wrap gap-2">
          {FOCUS_PRESETS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggle(focusAreas, f, 'focusAreas')}
              className={`px-3 py-1.5 rounded-full text-xs border ${focusAreas.includes(f) ? 'bg-[#006c49] text-white border-[#006c49]' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Current active listings count</Label>
        <Input type="number" placeholder="e.g. 12" {...form.register('activeListingsCount')} />
      </div>
      {message && <p className={`text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-primary/20 text-[#4edea3]' : 'bg-red-900/20 text-red-400'}`}>{message}</p>}
      <Button type="submit" disabled={saving} className="w-full bg-[#006c49] hover:bg-[#006c49]">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save territory & portfolio
      </Button>
    </form>
  );
}

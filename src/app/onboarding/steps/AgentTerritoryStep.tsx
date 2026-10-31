'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { onboardingAgentTerritorySchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DInput,
  DToggleChip,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const TERRITORY_PRESETS = [
  'Lekki',
  'Ikeja',
  'Victoria Island',
  'Ikoyi',
  'Gbagada',
  'Yaba',
  'Abuja (FCT)',
  'Port Harcourt',
];

const FOCUS_PRESETS = [
  'Residential Sales',
  'Commercial Lettings',
  'Luxury Estates',
  'Land Flipping',
  'Short-Let Management',
];

/**
 * Territory is a hard gate: a mandate outside a verified zone cannot be
 * executed under REDAN / LASRERA rules, so at least one of each list is
 * required.
 */
export default function AgentTerritoryStep({ facts, onSaved }: StepProps) {
  const [territories, setTerritories] = useState<string[]>(
    facts.jurisdictionName ? [facts.jurisdictionName] : []
  );
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [activeListingsCount, setActiveListingsCount] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingAgentTerritorySchema.safeParse({
      operationalTerritories: territories,
      focusAreas,
      activeListingsCount:
        activeListingsCount === '' ? undefined : Number(activeListingsCount),
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/agent/territory', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<MapPin className="h-4 w-4" />} title="Operational scope" className="mb-5">
        Only mandates inside a verified regional zone may be executed under your accreditation. You
        can widen your territory later, but not narrow it below one zone.
      </DCallout>

      <DField
        label="Operational territories"
        required
        note={`${territories.length} selected`}
        error={fieldErrors.operationalTerritories}
        className="mb-4"
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {TERRITORY_PRESETS.map((t) => (
            <DToggleChip
              key={t}
              active={territories.includes(t)}
              onClick={() => setTerritories((prev) => toggle(prev, t))}
            >
              {t}
            </DToggleChip>
          ))}
        </div>
      </DField>

      <DField
        label="Real estate focus areas"
        required
        note={`${focusAreas.length} selected`}
        error={fieldErrors.focusAreas}
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {FOCUS_PRESETS.map((f) => (
            <DToggleChip
              key={f}
              active={focusAreas.includes(f)}
              onClick={() => setFocusAreas((prev) => toggle(prev, f))}
            >
              {f}
            </DToggleChip>
          ))}
        </div>
      </DField>

      <div className="mt-4 max-w-[220px]">
        <DField label="Active listings" note="Optional" error={fieldErrors.activeListingsCount}>
          <DInput
            value={activeListingsCount}
            onChange={(e) => setActiveListingsCount(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="e.g. 12"
            inputMode="numeric"
            mono
          />
        </DField>
      </div>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save territory"
        disabled={territories.length === 0 || focusAreas.length === 0}
      />
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { onboardingLocationSchema } from '@/lib/validators';
import {
  DCallout,
  DField,
  DGrid,
  DInput,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

interface Country {
  code: string;
  name: string;
}

interface Jurisdiction {
  id: string;
  name: string;
  code: string;
}

/**
 * Jurisdiction decides which covenant pack, stamp-duty band and eviction
 * protocol apply, so it is captured before anything else and every role shares
 * the same two-level country → state cascade.
 */
export default function LocationStep({ facts, onSaved }: StepProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState(facts.countryCode ?? '');
  const [jurisdictionId, setJurisdictionId] = useState('');
  const [city, setCity] = useState(facts.city ?? '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/onboarding/location/options')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setCountries(json.data?.countries ?? []);
        setJurisdictions(json.data?.jurisdictions ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!countryCode) return;
    let cancelled = false;
    fetch(`/api/onboarding/location/options?countryCode=${countryCode}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setJurisdictions(json.data?.jurisdictions ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // Validate with the same schema the route uses so the user sees the same
    // message before a round trip.
    const parsed = onboardingLocationSchema.safeParse({
      countryCode: countryCode || undefined,
      jurisdictionId: jurisdictionId || undefined,
      city,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/location', parsed.data);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<MapPin className="h-4 w-4" />} title="Statutory residence" className="mb-5">
        Nigerian tenancy law is state-specific. The state you choose here sets the covenant pack,
        the stamp-duty band and the eviction protocol that will govern your agreements.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Country" required error={fieldErrors.countryCode}>
          <DSelect
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setJurisdictionId('');
            }}
            placeholder="Select a country"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </DSelect>
        </DField>

        <DField label="State / region" required error={fieldErrors.jurisdictionId}>
          <DSelect
            value={jurisdictionId}
            onChange={(e) => setJurisdictionId(e.target.value)}
            placeholder={countryCode ? 'Select a state' : 'Choose a country first'}
            disabled={!countryCode}
          >
            {jurisdictions.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </DSelect>
        </DField>

        <DField label="City" required error={fieldErrors.city}>
          <DInput
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Lekki"
            autoComplete="address-level2"
          />
        </DField>

        <DField label="Address line 1" error={fieldErrors.addressLine1}>
          <DInput
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="e.g. 12A Admiralty Way"
            autoComplete="address-line1"
          />
        </DField>

        <DField label="Address line 2" note="Optional" error={fieldErrors.addressLine2}>
          <DInput
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Flat, estate or landmark"
            autoComplete="address-line2"
          />
        </DField>
      </DGrid>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save jurisdiction"
        hint="Applies to every agreement and payment you make on Propati."
      />
    </form>
  );
}

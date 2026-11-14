'use client';

import { useState } from 'react';
import { SectionPanel, SaveBar, TextField, TextAreaField, type SaveState, Field } from '../_components/parts';
import { ChoiceField } from '../_components/ChoiceField';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface PreferencesValues {
  preferredState: string | null;
  preferredBedrooms: string;
  maxMonthlyBudget: string;
  preferredMoveInDate: string | null;
  pendingLeaseDuration: '6_months' | '1_year' | '2_years' | null;
  occupants: string;
  hasPets: boolean | null;
  petsDetail: string | null;
}

const LEASES = [
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: '1 year' },
  { value: '2_years', label: '2 years' },
] as const;

export function SectionPreferences({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: PreferencesValues;
  state: SaveState;
  error?: string;
  onSave: (values: PreferencesValues) => void;
}) {
  const [values, setValues] = useState<PreferencesValues>(initial);
  const set = <K extends keyof PreferencesValues>(key: K, value: PreferencesValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <SectionPanel
      index={9}
      title="What you are looking for"
      description="Used to match you with homes, and to show landlords you fit their listing."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="preferredState"
          label="Area you want to live in"
          value={values.preferredState ?? ''}
          placeholder="Lekki, Lagos"
          onChange={(v) => set('preferredState', v || null)}
        />
        <TextField
          id="maxMonthlyBudget"
          label="Most you will pay per month (₦)"
          value={values.maxMonthlyBudget}
          placeholder="450000"
          inputMode="numeric"
          onChange={(v) => set('maxMonthlyBudget', v.replace(/[^\d]/g, ''))}
        />
        <TextField
          id="preferredBedrooms"
          label="Bedrooms"
          type="number"
          min={0}
          max={20}
          value={values.preferredBedrooms}
          placeholder="2"
          onChange={(v) => set('preferredBedrooms', v)}
          hint="Use 0 for a studio."
        />
        <TextField
          id="occupants"
          label="How many people will live there"
          type="number"
          min={1}
          max={50}
          value={values.occupants}
          placeholder="1"
          onChange={(v) => set('occupants', v)}
        />
        <TextField
          id="preferredMoveInDate"
          label="When you want to move in"
          type="date"
          value={values.preferredMoveInDate ?? ''}
          onChange={(v) => set('preferredMoveInDate', v || null)}
        />
        <ChoiceField
          id="pendingLeaseDuration"
          label="How long a lease you want"
          value={values.pendingLeaseDuration}
          options={LEASES}
          onChange={(v) => set('pendingLeaseDuration', v)}
        />

        <Field label="Pets" className="sm:col-span-2">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-white/[0.08]">
            <Label htmlFor="hasPets" className="cursor-pointer font-normal">
              I have pets
            </Label>
            <Switch
              id="hasPets"
              checked={values.hasPets === true}
              onCheckedChange={(checked) =>
                setValues((v) => ({ ...v, hasPets: checked, petsDetail: checked ? v.petsDetail : null }))
              }
            />
          </div>
        </Field>

        {values.hasPets && (
          <TextAreaField
            id="petsDetail"
            label="What kind of pets, and how many"
            className="sm:col-span-2"
            rows={2}
            value={values.petsDetail ?? ''}
            placeholder="One small dog, 4 years old."
            onChange={(v) => set('petsDetail', v || null)}
          />
        )}
      </div>
    </SectionPanel>
  );
}

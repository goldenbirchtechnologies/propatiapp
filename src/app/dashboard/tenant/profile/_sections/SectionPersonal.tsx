'use client';

import { useState } from 'react';
import { SectionPanel, SaveBar, TextField, type SaveState } from '../_components/parts';
import { ChoiceField } from '../_components/ChoiceField';

export interface PersonalValues {
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  nationality: string | null;
  stateOfResidence: string | null;
  lga: string | null;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | null;
}

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

const MARITAL = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
] as const;

export function SectionPersonal({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: PersonalValues;
  state: SaveState;
  error?: string;
  onSave: (values: PersonalValues) => void;
}) {
  const [values, setValues] = useState<PersonalValues>(initial);
  const set = <K extends keyof PersonalValues>(key: K, value: PersonalValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <SectionPanel
      index={1}
      title="Personal details"
      description="Who you are, as a landlord will see it on your application."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="dateOfBirth"
          label="Date of birth"
          type="date"
          value={values.dateOfBirth ?? ''}
          onChange={(v) => set('dateOfBirth', v || null)}
          hint="Landlords use this to confirm you are over 18."
        />
        <ChoiceField
          id="gender"
          label="Gender"
          value={values.gender}
          options={GENDERS}
          onChange={(v) => set('gender', v)}
        />
        <TextField
          id="nationality"
          label="Nationality"
          value={values.nationality ?? ''}
          placeholder="NG"
          maxLength={2}
          onChange={(v) => set('nationality', v.toUpperCase() || null)}
          hint="Two-letter country code, e.g. NG."
        />
        <ChoiceField
          id="maritalStatus"
          label="Marital status"
          value={values.maritalStatus}
          options={MARITAL}
          onChange={(v) => set('maritalStatus', v)}
        />
        <TextField
          id="stateOfResidence"
          label="State you live in now"
          value={values.stateOfResidence ?? ''}
          placeholder="Lagos"
          onChange={(v) => set('stateOfResidence', v || null)}
        />
        <TextField
          id="lga"
          label="Local government area"
          value={values.lga ?? ''}
          placeholder="Surulere"
          onChange={(v) => set('lga', v || null)}
        />
      </div>
    </SectionPanel>
  );
}

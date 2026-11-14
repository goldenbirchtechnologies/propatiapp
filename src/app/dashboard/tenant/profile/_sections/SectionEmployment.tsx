'use client';

import { useState } from 'react';
import { SectionPanel, SaveBar, TextField, type SaveState } from '../_components/parts';
import { ChoiceField } from '../_components/ChoiceField';

export interface EmploymentValues {
  employmentStatus:
    | 'employed'
    | 'self_employed'
    | 'business_owner'
    | 'student'
    | 'retired'
    | 'unemployed'
    | null;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | null;
  employerName: string | null;
  jobTitle: string | null;
  yearsInEmployment: string | null;
  /** Naira, as typed. */
  yearlyIncome: string;
}

const STATUSES = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'business_owner', label: 'Business owner' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Not working' },
] as const;

const TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
] as const;

/** Employment type only makes sense for the first three statuses. */
const NEEDS_TYPE = new Set(['employed', 'self_employed', 'business_owner']);

export function SectionEmployment({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: EmploymentValues;
  state: SaveState;
  error?: string;
  onSave: (values: EmploymentValues) => void;
}) {
  const [values, setValues] = useState<EmploymentValues>(initial);
  const set = <K extends keyof EmploymentValues>(key: K, value: EmploymentValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const showType = values.employmentStatus ? NEEDS_TYPE.has(values.employmentStatus) : false;

  return (
    <SectionPanel
      index={3}
      title="Employment"
      description="How you earn. Landlords weigh this against the rent they are asking."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceField
          id="employmentStatus"
          label="Employment status"
          value={values.employmentStatus}
          options={STATUSES}
          onChange={(v) => {
            set('employmentStatus', v);
            if (v && !NEEDS_TYPE.has(v)) set('employmentType', null);
          }}
          required
        />
        {showType && (
          <ChoiceField
            id="employmentType"
            label="Employment type"
            value={values.employmentType}
            options={TYPES}
            onChange={(v) => set('employmentType', v)}
          />
        )}
        <TextField
          id="employerName"
          label="Employer or business name"
          value={values.employerName ?? ''}
          placeholder="Zenith Bank"
          onChange={(v) => set('employerName', v || null)}
        />
        <TextField
          id="jobTitle"
          label="Job title"
          value={values.jobTitle ?? ''}
          placeholder="Relationship manager"
          onChange={(v) => set('jobTitle', v || null)}
        />
        <TextField
          id="yearsInEmployment"
          label="Years in this role"
          value={values.yearsInEmployment ?? ''}
          placeholder="3"
          inputMode="decimal"
          onChange={(v) => set('yearsInEmployment', v || null)}
        />
        <TextField
          id="yearlyIncome"
          label="Yearly income (₦)"
          value={values.yearlyIncome}
          placeholder="9600000"
          inputMode="numeric"
          onChange={(v) => set('yearlyIncome', v.replace(/[^\d]/g, ''))}
          hint="Before tax, per year. Leave blank if you would rather not say."
        />
      </div>
    </SectionPanel>
  );
}

'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { onboardingEmploymentSchema } from '@/lib/validators';
import { EMPLOYMENT_STATUS_REQUIRES_TYPE } from '@/lib/onboarding/steps';
import {
  DCallout,
  DCurrency,
  DField,
  DGrid,
  DInput,
  DSelect,
} from '@/components/onboarding/dossier/primitives';
import { formatNaira } from '@/components/onboarding/dossier/role-meta';
import { issuesOf, firstIssue, StepActions, useStepSave } from './_shared';
import type { StepProps } from './types';

const STATUSES = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'business_owner', label: 'Business owner' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
] as const;

const TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
] as const;

/**
 * Rent-to-income is scored against the statutory ceiling for the user's state,
 * so income is captured as an annual figure and echoed back formatted.
 */
export default function EmploymentStep({ facts, onSaved }: StepProps) {
  const [employmentStatus, setEmploymentStatus] = useState(facts.employmentStatus ?? '');
  const [employmentType, setEmploymentType] = useState('');
  const [employerName, setEmployerName] = useState(facts.employerName ?? '');
  const [jobTitle, setJobTitle] = useState(facts.jobTitle ?? '');
  const [yearlyIncome, setYearlyIncome] = useState(
    facts.yearlyIncome == null ? '' : String(facts.yearlyIncome)
  );
  const [yearsInEmployment, setYearsInEmployment] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { saving, error, saved, run, setError } = useStepSave(onSaved);

  const requiresType = EMPLOYMENT_STATUS_REQUIRES_TYPE.includes(employmentStatus);
  const income = Number(yearlyIncome);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = onboardingEmploymentSchema.safeParse({
      employmentStatus: employmentStatus || undefined,
      employmentType: requiresType ? employmentType || undefined : undefined,
      employerName: employerName || undefined,
      jobTitle: jobTitle || undefined,
      yearlyIncome: yearlyIncome === '' ? undefined : Number(yearlyIncome),
      yearsInEmployment: yearsInEmployment || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(issuesOf(parsed.error));
      setError(firstIssue(parsed.error));
      return;
    }

    await run('/api/onboarding/employment', parsed.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DCallout icon={<Briefcase className="h-4 w-4" />} title="Solvency screening" className="mb-5">
        Landlords see your employer, title and annual income — not your salary slips. Annual income
        is scored against the statutory rent-to-income ceiling for your state.
      </DCallout>

      <DGrid cols={2}>
        <DField label="Employment status" required error={fieldErrors.employmentStatus}>
          <DSelect
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            placeholder="Select status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </DSelect>
        </DField>

        <DField
          label="Employment type"
          required={requiresType}
          note={requiresType ? undefined : 'Not applicable'}
          error={fieldErrors.employmentType}
        >
          <DSelect
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            placeholder={requiresType ? 'Select type' : 'Not applicable'}
            disabled={!requiresType}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </DSelect>
        </DField>

        <DField label="Employer" required error={fieldErrors.employerName}>
          <DInput
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            placeholder="e.g. Acme Global Ltd"
            autoComplete="organization"
          />
        </DField>

        <DField label="Job title" required error={fieldErrors.jobTitle}>
          <DInput
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Product Manager"
            autoComplete="organization-title"
          />
        </DField>

        <DField
          label="Annual income"
          required
          note="₦ / annum"
          error={fieldErrors.yearlyIncome}
          hint={Number.isFinite(income) && income > 0 ? formatNaira(income) : 'Gross, before tax.'}
        >
          <DCurrency
            value={yearlyIncome}
            onChange={(e) => setYearlyIncome(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="3,000,000.00"
            inputMode="decimal"
            suffix="NGN"
          />
        </DField>

        <DField label="Years in current employment" note="Optional" error={fieldErrors.yearsInEmployment}>
          <DInput
            value={yearsInEmployment}
            onChange={(e) => setYearsInEmployment(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="e.g. 3"
            inputMode="decimal"
            mono
          />
        </DField>
      </DGrid>

      <StepActions
        saving={saving}
        error={error}
        saved={saved}
        label="Save employment"
        hint="Used only to score your application."
      />
    </form>
  );
}

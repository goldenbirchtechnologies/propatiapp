'use client';

import { Landmark, ReceiptText } from 'lucide-react';
import { NIGERIAN_STATES } from '@/lib/locations/nigeria-states';
import type { LandlordProfileValues } from '@/lib/landlord-profile/types';
import { SelectField, SubSection, TextField } from '../_components/parts';

const TAX_ID_OPTIONS = [
  { value: 'tin', label: 'Tax Identification Number (TIN)' },
  { value: 'nin', label: 'National Identification Number (NIN)' },
  { value: 'other', label: 'Other identifier' },
];

const JURISDICTION_OPTIONS = [
  { value: 'FIRS', label: 'Federal — FIRS' },
  ...NIGERIAN_STATES.map((state) => ({
    value: state.name,
    label: `${state.name} — state internal revenue`,
  })),
];

export function SectionTaxCompliance({
  values,
  onChange,
}: {
  values: LandlordProfileValues;
  onChange: (patch: Partial<LandlordProfileValues>) => void;
}) {
  return (
    <div className="space-y-5">
      <SubSection
        title="Tax identity"
        description="Used for rent receipts, stamp duty records, and annual statements."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="taxIdType"
            label="Tax ID type"
            value={values.taxIdType ?? ''}
            options={TAX_ID_OPTIONS}
            onChange={(value) =>
              onChange({
                taxIdType: (value || null) as LandlordProfileValues['taxIdType'],
              })
            }
            required
            placeholder="Select ID type"
          />
          <TextField
            id="taxNumber"
            label="Tax ID number"
            value={values.taxNumber}
            onChange={(value) => onChange({ taxNumber: value })}
            placeholder="e.g. 12345678-0001"
            required
            maxLength={30}
          />
          <SelectField
            id="taxJurisdiction"
            label="Remitting jurisdiction"
            className="sm:col-span-2"
            value={values.taxJurisdiction}
            options={JURISDICTION_OPTIONS}
            onChange={(value) => onChange({ taxJurisdiction: value })}
            allowEmpty
            emptyLabel="Not specified"
            hint="Where your tax and stamp duty records are remitted. Optional."
          />
        </div>
      </SubSection>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex items-start gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ReceiptText className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Stamp duty on tenancy agreements
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Stamp duty is assessed at 0.78% of annual rent under the Stamp Duties Act, with a
              minimum of ₦500 and no charge on amounts of ₦10,000 or less. The e-certificate is
              issued through Remita and embedded in the signed agreement.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <p>
          Your tax details are stored on your owner record and are never shown publicly on a
          listing.
        </p>
      </div>
    </div>
  );
}

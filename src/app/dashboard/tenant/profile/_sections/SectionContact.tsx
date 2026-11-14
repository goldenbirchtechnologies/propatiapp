'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { SectionPanel, SaveBar, TextField, TextAreaField, type SaveState } from '../_components/parts';

export interface ContactValues {
  fullName: string;
  phone: string | null;
  /** The same address the "Where you live now" section writes. */
  addressLine1: string | null;
  city: string | null;
  profileBio: string | null;
}

/**
 * Split save: the account fields go through PATCH /api/users/me/profile, the
 * address through the tenant-profile route. `onSave` does both so the section
 * still presents as one form with one button.
 */
export function SectionContact({
  values: initial,
  phoneVerified,
  state,
  error,
  onSave,
}: {
  values: ContactValues;
  phoneVerified: boolean;
  state: SaveState;
  error?: string;
  onSave: (values: ContactValues) => void;
}) {
  const [values, setValues] = useState<ContactValues>(initial);
  const set = <K extends keyof ContactValues>(key: K, value: ContactValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <SectionPanel
      index={10}
      title="Contact details"
      description="How landlords and our support team reach you."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="fullName"
          label="Full name"
          value={values.fullName}
          onChange={(v) => set('fullName', v)}
          required
        />
        <div className="space-y-1.5">
          <TextField
            id="phone"
            label="Phone number"
            type="tel"
            value={values.phone ?? ''}
            placeholder="+234 801 234 5678"
            onChange={(v) => set('phone', v || null)}
            hint={
              phoneVerified
                ? 'Verified — changing this number will require verifying it again.'
                : 'Not verified yet.'
            }
          />
          <Badge
            className={
              phoneVerified
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
            }
          >
            {phoneVerified ? 'Phone verified' : 'Phone unverified'}
          </Badge>
        </div>
        <TextField
          id="contactAddressLine1"
          label="Address"
          className="sm:col-span-2"
          value={values.addressLine1 ?? ''}
          placeholder="12 Bode Thomas Street"
          onChange={(v) => set('addressLine1', v || null)}
        />
        <TextField
          id="contactCity"
          label="City"
          value={values.city ?? ''}
          placeholder="Surulere"
          onChange={(v) => set('city', v || null)}
        />
        <TextAreaField
          id="profileBio"
          label="About you"
          className="sm:col-span-2"
          rows={3}
          value={values.profileBio ?? ''}
          placeholder="I work in banking, have lived in Lagos for six years, and pay rent on time."
          hint="A few lines landlords read before they reply. Optional."
          onChange={(v) => set('profileBio', v || null)}
        />
      </div>
    </SectionPanel>
  );
}

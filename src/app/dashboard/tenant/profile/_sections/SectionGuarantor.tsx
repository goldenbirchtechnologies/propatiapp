'use client';

import { useState } from 'react';
import { SectionPanel, SaveBar, TextField, TextAreaField, type SaveState } from '../_components/parts';

export interface GuarantorValues {
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorEmail: string | null;
  guarantorRelationship: string | null;
  guarantorOccupation: string | null;
  guarantorEmployer: string | null;
  guarantorAddress: string | null;
}

export function SectionGuarantor({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: GuarantorValues;
  state: SaveState;
  error?: string;
  onSave: (values: GuarantorValues) => void;
}) {
  const [values, setValues] = useState<GuarantorValues>(initial);
  const set = <K extends keyof GuarantorValues>(key: K, value: GuarantorValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <SectionPanel
      index={5}
      title="Guarantor"
      description="Someone who will vouch for you. Landlords usually call them before signing."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="guarantorName"
          label="Full name"
          value={values.guarantorName ?? ''}
          placeholder="Bode Adeyemi"
          onChange={(v) => set('guarantorName', v || null)}
        />
        <TextField
          id="guarantorRelationship"
          label="Relationship to you"
          value={values.guarantorRelationship ?? ''}
          placeholder="Uncle"
          onChange={(v) => set('guarantorRelationship', v || null)}
        />
        <TextField
          id="guarantorPhone"
          label="Phone number"
          type="tel"
          value={values.guarantorPhone ?? ''}
          placeholder="+234 801 234 5678"
          onChange={(v) => set('guarantorPhone', v || null)}
          hint="Include the country code so the landlord can reach them."
        />
        <TextField
          id="guarantorEmail"
          label="Email"
          type="email"
          value={values.guarantorEmail ?? ''}
          placeholder="bode@example.com"
          onChange={(v) => set('guarantorEmail', v || null)}
        />
        <TextField
          id="guarantorOccupation"
          label="Occupation"
          value={values.guarantorOccupation ?? ''}
          placeholder="Civil servant"
          onChange={(v) => set('guarantorOccupation', v || null)}
        />
        <TextField
          id="guarantorEmployer"
          label="Employer"
          value={values.guarantorEmployer ?? ''}
          placeholder="Lagos State Government"
          onChange={(v) => set('guarantorEmployer', v || null)}
        />
        <TextAreaField
          id="guarantorAddress"
          label="Address"
          className="sm:col-span-2"
          value={values.guarantorAddress ?? ''}
          placeholder="14 Bode Thomas Street, Surulere, Lagos"
          onChange={(v) => set('guarantorAddress', v || null)}
          rows={2}
        />
      </div>
    </SectionPanel>
  );
}

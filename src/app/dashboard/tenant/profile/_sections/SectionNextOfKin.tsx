'use client';

import { useState } from 'react';
import { SectionPanel, SaveBar, TextField, type SaveState } from '../_components/parts';

export interface NextOfKinValues {
  nokName: string | null;
  nokPhone: string | null;
  nokRelationship: string | null;
}

export function SectionNextOfKin({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: NextOfKinValues;
  state: SaveState;
  error?: string;
  onSave: (values: NextOfKinValues) => void;
}) {
  const [values, setValues] = useState<NextOfKinValues>(initial);
  const set = <K extends keyof NextOfKinValues>(key: K, value: NextOfKinValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <SectionPanel
      index={6}
      title="Next of kin"
      description="Who we contact if something happens to you. This is not the same as an emergency contact."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="nokName"
          label="Full name"
          value={values.nokName ?? ''}
          placeholder="Ada Obi"
          onChange={(v) => set('nokName', v || null)}
        />
        <TextField
          id="nokRelationship"
          label="Relationship to you"
          value={values.nokRelationship ?? ''}
          placeholder="Sister"
          onChange={(v) => set('nokRelationship', v || null)}
        />
        <TextField
          id="nokPhone"
          label="Phone number"
          type="tel"
          value={values.nokPhone ?? ''}
          placeholder="+234 809 876 5432"
          onChange={(v) => set('nokPhone', v || null)}
        />
      </div>
    </SectionPanel>
  );
}

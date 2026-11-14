'use client';

import { useState } from 'react';
import { SectionPanel, SaveBar, TextAreaField, type SaveState } from '../_components/parts';

export interface FinancialValues {
  otherIncomeSources: string | null;
}

export function SectionFinancial({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: FinancialValues;
  state: SaveState;
  error?: string;
  onSave: (values: FinancialValues) => void;
}) {
  const [values, setValues] = useState<FinancialValues>(initial);

  return (
    <SectionPanel
      index={4}
      title="Other income"
      description="Anything on top of your salary that helps you meet the rent."
      footer={<SaveBar state={state} error={error} onSave={() => onSave(values)} />}
    >
      <TextAreaField
        id="otherIncomeSources"
        label="Other income sources"
        value={values.otherIncomeSources ?? ''}
        placeholder="Rent from a flat in Yaba, about ₦180,000 a month."
        onChange={(v) => setValues({ otherIncomeSources: v || null })}
        hint="Freelance work, rent from property, investments or support. Write “none” if there is nothing to add."
        rows={4}
      />
    </SectionPanel>
  );
}

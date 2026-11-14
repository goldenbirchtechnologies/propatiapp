'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  SectionPanel,
  SaveBar,
  TextField,
  TextAreaField,
  EmptyRows,
  AddRowButton,
  RemoveRowButton,
  type SaveState,
} from '../_components/parts';

export interface ContactEntry {
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
}

const MAX = 3;

const blank = (): ContactEntry => ({ name: '', relationship: '', phone: '', email: null, address: null });

/**
 * The old page rendered an "Emergency contact" input and silently dropped it
 * on save. These now persist, and the first row is the primary contact.
 */
export function SectionEmergencyContacts({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: ContactEntry[];
  state: SaveState;
  error?: string;
  onSave: (values: ContactEntry[]) => void;
}) {
  const [rows, setRows] = useState<ContactEntry[]>(initial);

  const patch = (index: number, key: keyof ContactEntry, value: string | null) =>
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, [key]: value } : r)));

  return (
    <SectionPanel
      index={8}
      title="Emergency contacts"
      description="People to reach you through in an emergency. The first one is called first."
      footer={
        <SaveBar
          state={state}
          error={error}
          onSave={() => onSave(rows.filter((r) => r.name.trim() && r.phone.trim()))}
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyRows>No emergency contacts yet.</EmptyRows>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="rounded-lg border border-zinc-200 p-4 dark:border-white/[0.08]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {index === 0 ? 'Primary contact' : `Contact ${index + 1}`}
                </p>
                <RemoveRowButton
                  label={`Remove contact ${index + 1}`}
                  onClick={() => setRows((rs) => rs.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id={`ec-name-${index}`}
                  label="Full name"
                  value={row.name}
                  onChange={(v) => patch(index, 'name', v)}
                  required
                />
                <TextField
                  id={`ec-rel-${index}`}
                  label="Relationship"
                  value={row.relationship}
                  placeholder="Sister"
                  onChange={(v) => patch(index, 'relationship', v)}
                  required
                />
                <TextField
                  id={`ec-phone-${index}`}
                  label="Phone"
                  type="tel"
                  value={row.phone}
                  placeholder="+234 809 876 5432"
                  onChange={(v) => patch(index, 'phone', v)}
                  required
                />
                <TextField
                  id={`ec-email-${index}`}
                  label="Email"
                  type="email"
                  value={row.email ?? ''}
                  onChange={(v) => patch(index, 'email', v || null)}
                />
                <TextAreaField
                  id={`ec-addr-${index}`}
                  label="Address"
                  className="sm:col-span-2"
                  rows={2}
                  value={row.address ?? ''}
                  onChange={(v) => patch(index, 'address', v || null)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <AddRowButton onClick={() => setRows((rs) => [...rs, blank()])} disabled={rows.length >= MAX}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {rows.length >= MAX ? `Up to ${MAX} contacts` : 'Add a contact'}
      </AddRowButton>
    </SectionPanel>
  );
}

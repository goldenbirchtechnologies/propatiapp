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

export interface AddressEntry {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  moveInDate: string | null;
  moveOutDate: string | null;
  landlordName: string | null;
  landlordPhone: string | null;
  reasonForLeaving: string | null;
}

const MAX = 5;

const blank = (): AddressEntry => ({
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  moveInDate: null,
  moveOutDate: null,
  landlordName: null,
  landlordPhone: null,
  reasonForLeaving: null,
});

/**
 * Residential history. The first entry is treated as where the tenant lives
 * now — the route marks it `isCurrent` — so the copy says so.
 */
export function SectionAddressHistory({
  values: initial,
  state,
  error,
  onSave,
}: {
  values: AddressEntry[];
  state: SaveState;
  error?: string;
  onSave: (values: AddressEntry[]) => void;
}) {
  const [rows, setRows] = useState<AddressEntry[]>(initial.length ? initial : []);

  const patch = (index: number, key: keyof AddressEntry, value: string | null) =>
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, [key]: value } : r)));

  return (
    <SectionPanel
      index={7}
      title="Where you have lived"
      description="Your last few addresses. Landlords use these to ask previous landlords about you."
      footer={
        <SaveBar
          state={state}
          error={error}
          onSave={() =>
            onSave(rows.filter((r) => r.addressLine1.trim() && r.city.trim()))
          }
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyRows>No addresses yet. Add the one you live in now to start.</EmptyRows>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-200 p-4 dark:border-white/[0.08]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {index === 0 ? 'Where you live now' : `Previous address ${index}`}
                </p>
                <RemoveRowButton
                  label={`Remove address ${index + 1}`}
                  onClick={() => setRows((rs) => rs.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id={`addr1-${index}`}
                  label="Street address"
                  value={row.addressLine1}
                  placeholder="12 Bode Thomas Street"
                  onChange={(v) => patch(index, 'addressLine1', v)}
                  required
                />
                <TextField
                  id={`addr2-${index}`}
                  label="Flat, unit or landmark"
                  value={row.addressLine2}
                  placeholder="Flat 3B"
                  onChange={(v) => patch(index, 'addressLine2', v)}
                />
                <TextField
                  id={`city-${index}`}
                  label="City"
                  value={row.city}
                  placeholder="Surulere"
                  onChange={(v) => patch(index, 'city', v)}
                  required
                />
                <TextField
                  id={`state-${index}`}
                  label="State"
                  value={row.state}
                  placeholder="Lagos"
                  onChange={(v) => patch(index, 'state', v)}
                />
                <TextField
                  id={`moveIn-${index}`}
                  label="Moved in"
                  type="date"
                  value={row.moveInDate ?? ''}
                  onChange={(v) => patch(index, 'moveInDate', v || null)}
                />
                <TextField
                  id={`moveOut-${index}`}
                  label={index === 0 ? 'Moved out (leave blank if current)' : 'Moved out'}
                  type="date"
                  value={row.moveOutDate ?? ''}
                  onChange={(v) => patch(index, 'moveOutDate', v || null)}
                />
                <TextField
                  id={`landlord-${index}`}
                  label="Previous landlord's name"
                  value={row.landlordName ?? ''}
                  onChange={(v) => patch(index, 'landlordName', v || null)}
                />
                <TextField
                  id={`landlordPhone-${index}`}
                  label="Previous landlord's phone"
                  type="tel"
                  value={row.landlordPhone ?? ''}
                  onChange={(v) => patch(index, 'landlordPhone', v || null)}
                />
                <TextAreaField
                  id={`reason-${index}`}
                  label="Why you left"
                  className="sm:col-span-2"
                  rows={2}
                  value={row.reasonForLeaving ?? ''}
                  placeholder="Lease ended and I moved closer to work."
                  onChange={(v) => patch(index, 'reasonForLeaving', v || null)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <AddRowButton
        onClick={() => setRows((rs) => [...rs, blank()])}
        disabled={rows.length >= MAX}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {rows.length >= MAX ? `Up to ${MAX} addresses` : 'Add an address'}
      </AddRowButton>
    </SectionPanel>
  );
}

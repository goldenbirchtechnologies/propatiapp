'use client';

import { useState, type ReactNode } from 'react';
import { Building2, Check, Plus, User, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { LandlordProfileValues, LegalEntityType } from '@/lib/landlord-profile/types';
import { SubSection, TextField } from '../_components/parts';

const ENTITY_OPTIONS: Array<{
  value: LegalEntityType;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    value: 'individual',
    title: 'Individual',
    description: 'The property is held in your personal name.',
    icon: <User className="h-4 w-4" aria-hidden />,
  },
  {
    value: 'joint',
    title: 'Joint owners',
    description: 'Two or more people hold the property together.',
    icon: <Users className="h-4 w-4" aria-hidden />,
  },
  {
    value: 'company',
    title: 'Company',
    description: 'A registered company or corporate entity owns it.',
    icon: <Building2 className="h-4 w-4" aria-hidden />,
  },
];

const splitOwners = (value: string): string[] =>
  value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);

export function SectionLegalOwnership({
  values,
  onChange,
}: {
  values: LandlordProfileValues;
  onChange: (patch: Partial<LandlordProfileValues>) => void;
}) {
  const [newOwner, setNewOwner] = useState('');
  const owners = splitOwners(values.jointOwnerNames);

  const addOwner = () => {
    const name = newOwner.trim();
    if (!name) return;
    if (owners.some((owner) => owner.toLowerCase() === name.toLowerCase())) {
      setNewOwner('');
      return;
    }
    onChange({ jointOwnerNames: [...owners, name].join('; ') });
    setNewOwner('');
  };

  const removeOwner = (name: string) => {
    onChange({ jointOwnerNames: owners.filter((owner) => owner !== name).join('; ') });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          How is the property held?
        </p>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Legal entity type">
          {ENTITY_OPTIONS.map((option) => {
            const selected = values.legalEntityType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ legalEntityType: option.value })}
                className={cn(
                  'relative rounded-lg border p-3 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary/50 bg-primary/[0.06] dark:border-primary/40 dark:bg-primary/10'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/[0.08] dark:bg-zinc-900/40 dark:hover:border-white/20',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-md',
                    selected
                      ? 'bg-primary text-white'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400',
                  )}
                >
                  {option.icon}
                </span>
                <span className="mt-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {option.description}
                </span>
                {selected && (
                  <Check className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-primary" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="legalName"
          label={
            values.legalEntityType === 'company'
              ? 'Registered legal name'
              : values.legalEntityType === 'joint'
                ? 'Legal name on title'
                : 'Full legal name'
          }
          className="sm:col-span-2"
          value={values.legalName}
          onChange={(value) => onChange({ legalName: value })}
          placeholder="As it appears on the title document"
          required
          autoComplete="name"
        />
      </div>

      {values.legalEntityType === 'joint' && (
        <SubSection
          title="Joint owners"
          description="Add every person named on the title. You can remove an entry before saving."
        >
          {owners.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-5 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
              No joint owners added yet.
            </div>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {owners.map((owner) => (
                <li
                  key={owner}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
                >
                  {owner}
                  <button
                    type="button"
                    onClick={() => removeOwner(owner)}
                    aria-label={`Remove ${owner}`}
                    className="rounded-full p-0.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex gap-2">
            <Input
              value={newOwner}
              onChange={(event) => setNewOwner(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addOwner();
                }
              }}
              placeholder="Full name of joint owner"
              aria-label="Joint owner name"
            />
            <Button type="button" variant="outline" size="sm" onClick={addOwner} disabled={!newOwner.trim()}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Ownership shares are recorded in the title documents you upload, not inferred here.
          </p>
        </SubSection>
      )}

      {values.legalEntityType === 'company' && (
        <SubSection
          title="Company details"
          description="The registered entity and the person authorised to act for it."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="companyName"
              label="Company name"
              value={values.companyName}
              onChange={(value) => onChange({ companyName: value })}
              placeholder="Propati Holdings Ltd"
              required
              autoComplete="organization"
            />
            <TextField
              id="companyRegistrationNumber"
              label="RC number"
              value={values.companyRegistrationNumber}
              onChange={(value) => onChange({ companyRegistrationNumber: value })}
              placeholder="RC 1234567"
              required
            />
            <TextField
              id="companyAddress"
              label="Registered company address"
              className="sm:col-span-2"
              value={values.companyAddress}
              onChange={(value) => onChange({ companyAddress: value })}
              placeholder="Registered office as filed with the CAC"
            />
            <TextField
              id="representativeName"
              label="Authorised representative"
              value={values.representativeName}
              onChange={(value) => onChange({ representativeName: value })}
              placeholder="Director or authorised signatory"
            />
            <TextField
              id="representativePhone"
              label="Representative phone"
              type="tel"
              value={values.representativePhone}
              onChange={(value) => onChange({ representativePhone: value })}
              placeholder="+234 801 234 5678"
              inputMode="tel"
            />
            <TextField
              id="representativeEmail"
              label="Representative email"
              type="email"
              className="sm:col-span-2"
              value={values.representativeEmail}
              onChange={(value) => onChange({ representativeEmail: value })}
              placeholder="director@company.com"
              inputMode="email"
            />
          </div>
        </SubSection>
      )}

      {!values.legalEntityType && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Choose an entity type to reveal the details we need for your ownership record.
        </p>
      )}
    </div>
  );
}

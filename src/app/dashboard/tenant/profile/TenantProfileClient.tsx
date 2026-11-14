'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SectionRail, type RailItem } from './_components/SectionRail';
import type { SaveState } from './_components/parts';
import type { TenantSectionId, TenantSectionSummary } from '@/lib/tenant-profile/completion';

import { SectionPersonal, type PersonalValues } from './_sections/SectionPersonal';
import { SectionIdentity } from './_sections/SectionIdentity';
import { SectionEmployment, type EmploymentValues } from './_sections/SectionEmployment';
import { SectionFinancial, type FinancialValues } from './_sections/SectionFinancial';
import { SectionGuarantor, type GuarantorValues } from './_sections/SectionGuarantor';
import { SectionNextOfKin, type NextOfKinValues } from './_sections/SectionNextOfKin';
import { SectionAddressHistory, type AddressEntry } from './_sections/SectionAddressHistory';
import { SectionEmergencyContacts, type ContactEntry } from './_sections/SectionEmergencyContacts';
import { SectionPreferences, type PreferencesValues } from './_sections/SectionPreferences';
import { SectionContact, type ContactValues } from './_sections/SectionContact';

export interface TenantProfileData {
  account: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    idType: string | null;
  };
  verification: {
    idVerified: boolean;
    ninVerified: boolean;
    phoneVerified: boolean;
    incomeVerified: boolean;
  };
  personal: PersonalValues;
  employment: EmploymentValues;
  financial: FinancialValues;
  guarantor: GuarantorValues;
  nextOfKin: NextOfKinValues;
  address: { addressLine1: string | null; city: string | null };
  profileBio: string | null;
  addresses: AddressEntry[];
  emergencyContacts: ContactEntry[];
  preferences: PreferencesValues;
  completion: TenantSectionSummary;
}

const SECTION_META: Record<TenantSectionId, { index: number; label: string }> = {
  personal: { index: 1, label: 'Personal details' },
  identity: { index: 2, label: 'Identity' },
  employment: { index: 3, label: 'Employment' },
  financial: { index: 4, label: 'Other income' },
  guarantor: { index: 5, label: 'Guarantor' },
  nextOfKin: { index: 6, label: 'Next of kin' },
  addressHistory: { index: 7, label: 'Address history' },
  emergencyContacts: { index: 8, label: 'Emergency contacts' },
  preferences: { index: 9, label: 'Looking for' },
  verification: { index: 10, label: 'Contact' },
};

/** Which API section each rail section writes to. Identity is read-only. */
type ApiSection =
  | 'personal'
  | 'address'
  | 'nextOfKin'
  | 'employment'
  | 'financial'
  | 'guarantor'
  | 'preferences'
  | 'addressHistory'
  | 'emergencyContacts';

export default function TenantProfileClient({ data: initial }: { data: TenantProfileData }) {
  const [activeId, setActiveId] = useState<TenantSectionId>('personal');
  const [completion, setCompletion] = useState<TenantSectionSummary>(initial.completion);
  const [states, setStates] = useState<Record<string, SaveState>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const setState = (key: string, state: SaveState, error?: string) => {
    setStates((s) => ({ ...s, [key]: state }));
    setErrors((e) => ({ ...e, [key]: error }));
  };

  /**
   * One save path for every section. Returns the recomputed summary so the
   * rail can update without a reload, and surfaces the server's validation
   * message instead of a generic "Save failed".
   */
  const saveSection = useCallback(
    async (section: ApiSection, data: unknown) => {
      setState(section, 'saving');
      try {
        const res = await fetch('/api/users/me/tenant-profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, data }),
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const detail =
            json?.details?.[0]?.message || json?.error || 'Could not save that section';
          throw new Error(detail);
        }

        if (json?.data?.completion) setCompletion(json.data.completion);
        setState(section, 'saved');
        toast.success('Saved');
        // Let the "Saved" line stand for a moment, then go quiet.
        setTimeout(() => setStates((s) => ({ ...s, [section]: 'idle' })), 2500);
      } catch (e) {
        setState(section, 'error', e instanceof Error ? e.message : 'Could not save that section');
      }
    },
    [],
  );

  /** Numbers come off the wire as strings in form state; the API wants numbers. */
  const num = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  };

  const railItems: RailItem[] = useMemo(
    () =>
      completion.sections.map((s) => ({
        id: s.sectionId,
        index: SECTION_META[s.sectionId]?.index ?? 0,
        label: SECTION_META[s.sectionId]?.label ?? s.sectionId,
        done: s.done,
        missing: s.missing,
      })),
    [completion],
  );

  return (
    <div className="min-w-0">
      <header className="mb-5">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white sm:text-2xl">Your profile</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This is what a landlord sees when you apply. The more complete it is, the faster you hear back.
        </p>
      </header>

      {/* `min-w-0` on both columns: a grid child defaults to min-width:auto and
          would otherwise refuse to shrink, re-introducing the page overflow. */}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        <SectionRail
          items={railItems}
          activeId={activeId}
          onSelect={setActiveId}
          percent={completion.percent}
          completedCount={completion.completedCount}
        />

        <div className="min-w-0 space-y-5">
          {activeId === 'personal' && (
            <SectionPersonal
              values={initial.personal}
              state={states.personal ?? 'idle'}
              error={errors.personal}
              onSave={(v) =>
                saveSection('personal', {
                  dateOfBirth: v.dateOfBirth ? new Date(v.dateOfBirth) : null,
                  gender: v.gender,
                  nationality: v.nationality,
                  stateOfResidence: v.stateOfResidence,
                  lga: v.lga,
                  maritalStatus: v.maritalStatus,
                })
              }
            />
          )}

          {activeId === 'identity' && (
            <SectionIdentity
              idType={initial.account.idType}
              idVerified={initial.verification.idVerified}
              ninVerified={initial.verification.ninVerified}
              incomeVerified={initial.verification.incomeVerified}
            />
          )}

          {activeId === 'employment' && (
            <SectionEmployment
              values={initial.employment}
              state={states.employment ?? 'idle'}
              error={errors.employment}
              onSave={(v) =>
                saveSection('employment', {
                  employmentStatus: v.employmentStatus,
                  employmentType: v.employmentType,
                  employerName: v.employerName,
                  jobTitle: v.jobTitle,
                  yearsInEmployment: v.yearsInEmployment,
                  yearlyIncome: num(v.yearlyIncome),
                })
              }
            />
          )}

          {activeId === 'financial' && (
            <SectionFinancial
              values={initial.financial}
              state={states.financial ?? 'idle'}
              error={errors.financial}
              onSave={(v) => saveSection('financial', v)}
            />
          )}

          {activeId === 'guarantor' && (
            <SectionGuarantor
              values={initial.guarantor}
              state={states.guarantor ?? 'idle'}
              error={errors.guarantor}
              onSave={(v) => saveSection('guarantor', v)}
            />
          )}

          {activeId === 'nextOfKin' && (
            <SectionNextOfKin
              values={initial.nextOfKin}
              state={states.nextOfKin ?? 'idle'}
              error={errors.nextOfKin}
              onSave={(v) => saveSection('nextOfKin', v)}
            />
          )}

          {activeId === 'addressHistory' && (
            <SectionAddressHistory
              values={initial.addresses}
              state={states.addressHistory ?? 'idle'}
              error={errors.addressHistory}
              onSave={(v) =>
                saveSection(
                  'addressHistory',
                  v.map((row) => ({
                    ...row,
                    addressLine2: row.addressLine2 || null,
                    state: row.state || null,
                    moveInDate: row.moveInDate ? new Date(row.moveInDate) : null,
                    moveOutDate: row.moveOutDate ? new Date(row.moveOutDate) : null,
                  })),
                )
              }
            />
          )}

          {activeId === 'emergencyContacts' && (
            <SectionEmergencyContacts
              values={initial.emergencyContacts}
              state={states.emergencyContacts ?? 'idle'}
              error={errors.emergencyContacts}
              onSave={(v) => saveSection('emergencyContacts', v)}
            />
          )}

          {activeId === 'preferences' && (
            <SectionPreferences
              values={initial.preferences}
              state={states.preferences ?? 'idle'}
              error={errors.preferences}
              onSave={(v) =>
                saveSection('preferences', {
                  preferredState: v.preferredState,
                  preferredBedrooms: num(v.preferredBedrooms),
                  maxMonthlyBudget: num(v.maxMonthlyBudget),
                  preferredMoveInDate: v.preferredMoveInDate ? new Date(v.preferredMoveInDate) : null,
                  pendingLeaseDuration: v.pendingLeaseDuration,
                  occupants: num(v.occupants),
                  hasPets: v.hasPets,
                  petsDetail: v.petsDetail,
                })
              }
            />
          )}

          {activeId === 'verification' && (
            <SectionContact
              values={{
                fullName: initial.account.fullName,
                phone: initial.account.phone,
                addressLine1: initial.address.addressLine1,
                city: initial.address.city,
                profileBio: initial.profileBio,
              }}
              phoneVerified={initial.verification.phoneVerified}
              state={states.contact ?? 'idle'}
              error={errors.contact}
              onSave={async (v) => {
                // Two routes: account fields, then the address. Both must
                // succeed before the section reports Saved.
                setState('contact', 'saving');
                try {
                  const [accountRes, addressRes] = await Promise.all([
                    fetch('/api/users/me/profile', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        fullName: v.fullName.trim() || undefined,
                        phone: v.phone,
                        profileBio: v.profileBio,
                      }),
                    }),
                    fetch('/api/users/me/tenant-profile', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        section: 'address',
                        data: { addressLine1: v.addressLine1, city: v.city },
                      }),
                    }),
                  ]);

                  if (!accountRes.ok) {
                    const j = await accountRes.json().catch(() => ({}));
                    throw new Error(j?.error || j?.details?.[0]?.message || 'Could not save your details');
                  }
                  if (!addressRes.ok) {
                    const j = await addressRes.json().catch(() => ({}));
                    throw new Error(j?.error || j?.details?.[0]?.message || 'Could not save your address');
                  }

                  const json = await addressRes.json().catch(() => ({}));
                  if (json?.data?.completion) setCompletion(json.data.completion);
                  setState('contact', 'saved');
                  toast.success('Saved');
                  setTimeout(() => setStates((s) => ({ ...s, contact: 'idle' })), 2500);
                } catch (e) {
                  setState('contact', 'error', e instanceof Error ? e.message : 'Could not save');
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

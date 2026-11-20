'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  CircleCheck,
  FileCheck2,
  Landmark,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  LANDLORD_SECTIONS,
  type LandlordDocumentRow,
  type LandlordProfileValues,
  type LandlordSectionId,
  type LandlordWorkspace,
} from '@/lib/landlord-profile/types';
import { SectionRail, type LandlordRailItem } from './_components/SectionRail';
import { OwnerSummaryPanel } from './_components/OwnerSummaryPanel';
import { ActionBar, SectionPanel, type SaveState } from './_components/parts';
import { SectionLegalOwnership } from './_sections/SectionLegalOwnership';
import { SectionContactAddress } from './_sections/SectionContactAddress';
import { SectionTaxCompliance } from './_sections/SectionTaxCompliance';
import { SectionIdentityDocuments } from './_sections/SectionIdentityDocuments';
import { SectionFinancialMandate } from './_sections/SectionFinancialMandate';

const SECTION_COPY: Record<LandlordSectionId, { title: string; description: string }> = {
  legal: {
    title: 'Legal ownership',
    description:
      'The entity that holds the property and the people authorised to act for it. This is the record we check against title documents.',
  },
  contact: {
    title: 'Contact & address',
    description:
      'Where we send notices, statements, and legal correspondence. Keep the phone verified so time-sensitive messages reach you.',
  },
  tax: {
    title: 'Tax & compliance',
    description:
      'Your tax identity and the jurisdiction that receives stamp duty and other statutory remittances.',
  },
  documents: {
    title: 'Identity & documents',
    description:
      'Upload the evidence behind your ownership record. Files are private, reviewed, and shown with their current status.',
  },
  financial: {
    title: 'Financial mandate',
    description:
      'Your verified payout account, your own management fee, and the platform fee schedule that applies to rent collection.',
  },
};

const text = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const sameProfile = (a: LandlordProfileValues, b: LandlordProfileValues): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const displayName = (account: LandlordWorkspace['account']): string =>
  account.fullName?.trim() || account.email.split('@')[0] || 'Landlord';

function AccountAvatar({ account }: { account: LandlordWorkspace['account'] }) {
  const name = displayName(account);
  return account.avatarUrl ? (
    <img
      src={account.avatarUrl}
      alt={name}
      className="h-16 w-16 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10 sm:h-20 sm:w-20"
    />
  ) : (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary ring-1 ring-primary/15 dark:bg-primary/15 sm:h-20 sm:w-20"
      aria-label={`${name} avatar`}
    >
      {name
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}

function ReadinessCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'positive' | 'warning';
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-900/60 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            tone === 'positive'
              ? 'bg-primary/10 text-primary'
              : tone === 'warning'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{detail}</p>
    </div>
  );
}

function validateSection(
  section: LandlordSectionId,
  draft: LandlordProfileValues,
  documents: LandlordDocumentRow[],
): string | null {
  if (section === 'legal') {
    if (!draft.legalEntityType) return 'Choose how the property is held.';
    if (!draft.legalName.trim()) return 'Enter the registered legal name.';
    if (draft.legalEntityType === 'joint' && !draft.jointOwnerNames.trim()) {
      return 'Add at least one joint owner.';
    }
    if (draft.legalEntityType === 'company') {
      if (!draft.companyName.trim()) return 'Enter the company name.';
      if (!draft.companyRegistrationNumber.trim()) return 'Enter the company RC number.';
    }
  }

  if (section === 'contact') {
    if (!draft.primaryPhone.trim()) return 'Enter a primary phone number.';
    if (!draft.contactEmail.trim()) return 'Enter a contact email.';
    if (!draft.streetAddress.trim()) return 'Enter the street address.';
    if (!draft.city.trim()) return 'Enter the city.';
    if (!draft.stateRegion.trim()) return 'Choose the state.';
  }

  if (section === 'tax') {
    if (!draft.taxIdType) return 'Choose a tax ID type.';
    if (!draft.taxNumber.trim()) return 'Enter the tax ID number.';
  }

  if (section === 'documents') {
    const categories = new Set(documents.map((doc) => doc.category));
    if (!categories.has('government_id')) return 'Upload a government ID.';
    if (!categories.has('ownership_evidence')) return 'Upload proof of ownership.';
    if (draft.legalEntityType === 'company' && !categories.has('company_registration')) {
      return 'Upload the company registration certificate.';
    }
    if (draft.legalEntityType === 'joint' && !categories.has('joint_ownership')) {
      return 'Upload joint ownership evidence.';
    }
  }

  if (section === 'financial') {
    if (draft.managementFeeType && !draft.managementFeeValue.trim()) {
      return 'Enter the management fee value.';
    }
  }

  return null;
}

function buildPayload(
  section: LandlordSectionId,
  draft: LandlordProfileValues,
): Record<string, unknown> {
  if (section === 'legal') {
    return {
      legalEntityType: draft.legalEntityType,
      legalName: text(draft.legalName),
      jointOwnerNames: text(draft.jointOwnerNames),
      companyName: text(draft.companyName),
      companyRegistrationNumber: text(draft.companyRegistrationNumber),
      companyAddress: text(draft.companyAddress),
      representativeName: text(draft.representativeName),
      representativePhone: text(draft.representativePhone),
      representativeEmail: text(draft.representativeEmail),
    };
  }

  if (section === 'contact') {
    return {
      primaryPhone: draft.primaryPhone.trim(),
      contactEmail: text(draft.contactEmail),
      countryCode: text(draft.countryCode),
      stateRegion: text(draft.stateRegion),
      city: text(draft.city),
      streetAddress: text(draft.streetAddress),
      postalCode: text(draft.postalCode),
    };
  }

  if (section === 'tax') {
    return {
      taxIdType: draft.taxIdType,
      taxNumber: text(draft.taxNumber),
      taxJurisdiction: text(draft.taxJurisdiction),
    };
  }

  if (section === 'financial') {
    return {
      managementFeeType: draft.managementFeeType,
      managementFeeValue: draft.managementFeeValue.trim()
        ? Number(draft.managementFeeValue)
        : null,
    };
  }

  return {};
}

export default function LandlordProfileClient({ data }: { data: LandlordWorkspace }) {
  const [workspace, setWorkspace] = useState<LandlordWorkspace>(data);
  const [saved, setSaved] = useState<LandlordProfileValues>(data.profile);
  const [draft, setDraft] = useState<LandlordProfileValues>(data.profile);
  const [activeId, setActiveId] = useState<LandlordSectionId>('legal');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | undefined>();
  const [pendingNav, setPendingNav] = useState<LandlordSectionId | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const dirty = useMemo(() => !sameProfile(draft, saved), [draft, saved]);

  const railItems: LandlordRailItem[] = useMemo(
    () =>
      LANDLORD_SECTIONS.map((section) => {
        const status = workspace.completion.sections.find(
          (entry) => entry.sectionId === section.id,
        );
        return {
          sectionId: section.id,
          index: section.index,
          label: section.label,
          done: status?.done ?? false,
          missing: status?.missing ?? [],
        };
      }),
    [workspace.completion.sections],
  );

  const updateDraft = useCallback((patch: Partial<LandlordProfileValues>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
    setSaveState((previous) => (previous === 'saving' ? previous : 'dirty'));
    setSaveError(undefined);
  }, []);

  const applyNav = useCallback((id: LandlordSectionId, profile: LandlordProfileValues) => {
    setActiveId(id);
    setDraft(profile);
    setSaveState('idle');
    setSaveError(undefined);
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const requestNav = useCallback(
    (id: LandlordSectionId) => {
      if (id === activeId) return;
      if (dirty) {
        setPendingNav(id);
        return;
      }
      applyNav(id, saved);
    },
    [activeId, applyNav, dirty, saved],
  );

  const refreshWorkspace = useCallback(
    async (options?: { resetDraft?: boolean }): Promise<LandlordWorkspace | null> => {
      try {
        const response = await fetch('/api/landlord/owner-profile', { cache: 'no-store' });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(json?.error || 'Could not refresh the owner record');
        }
        const next = json.data as LandlordWorkspace;
        setWorkspace(next);
        setSaved(next.profile);
        if (options?.resetDraft !== false) setDraft(next.profile);
        return next;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not refresh the owner record');
        return null;
      }
    },
    [],
  );

  const saveCurrent = useCallback(async (): Promise<LandlordWorkspace | null> => {
    const validation = validateSection(activeId, draft, workspace.documents);
    if (validation) {
      setSaveState('error');
      setSaveError(validation);
      return null;
    }

    const payload = buildPayload(activeId, draft);
    if (Object.keys(payload).length === 0) {
      setSaveState('idle');
      return workspace;
    }

    setSaveState('saving');
    setSaveError(undefined);

    try {
      const response = await fetch('/api/landlord/owner-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          json?.message || json?.details?.[0]?.message || json?.error || 'Could not save this section';
        throw new Error(detail);
      }

      const next = json.data as LandlordWorkspace;
      setWorkspace(next);
      setSaved(next.profile);
      setDraft(next.profile);
      setSaveState('saved');
      toast.success('Owner profile saved');
      setTimeout(() => {
        setSaveState((state) => (state === 'saved' ? 'idle' : state));
      }, 2500);
      return next;
    } catch (error) {
      setSaveState('error');
      setSaveError(error instanceof Error ? error.message : 'Could not save this section');
      return null;
    }
  }, [activeId, draft, workspace]);

  const handleSave = useCallback(() => {
    void saveCurrent();
  }, [saveCurrent]);

  const handleContinue = useCallback(async () => {
    const validation = validateSection(activeId, draft, workspace.documents);
    if (validation) {
      setSaveState('error');
      setSaveError(validation);
      toast.error(validation);
      return;
    }

    let profile = saved;
    if (dirty) {
      const result = await saveCurrent();
      if (!result) return;
      profile = result.profile;
    }

    const index = LANDLORD_SECTIONS.findIndex((section) => section.id === activeId);
    if (index >= 0 && index < LANDLORD_SECTIONS.length - 1) {
      applyNav(LANDLORD_SECTIONS[index + 1].id, profile);
    } else {
      toast.success('Owner record is up to date');
    }
  }, [activeId, applyNav, dirty, draft, saveCurrent, saved, workspace.documents]);

  const handleBack = useCallback(() => {
    const index = LANDLORD_SECTIONS.findIndex((section) => section.id === activeId);
    if (index > 0) requestNav(LANDLORD_SECTIONS[index - 1].id);
  }, [activeId, requestNav]);

  const activeIndex = LANDLORD_SECTIONS.findIndex((section) => section.id === activeId);
  const activeMeta = SECTION_COPY[activeId];
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex === LANDLORD_SECTIONS.length - 1;
  const accountName = displayName(workspace.account);
  const verifiedDocuments = workspace.documents.filter((document) => document.status === 'verified').length;
  const settlementLabel =
    workspace.settlement.state === 'verified'
      ? 'Verified'
      : workspace.settlement.state === 'pending'
        ? 'In review'
        : 'Not linked';

  return (
    <div className="mx-auto min-w-0 max-w-[1240px]">
      <header className="mb-6">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard/landlord" className="transition-colors hover:text-primary">Workspace</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="text-zinc-700 dark:text-zinc-200">Profile & compliance</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Landlord account
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-[28px]">
              Profile & compliance
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Keep the ownership record behind your properties accurate for verification, agreements, tax, and payouts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={workspace.completion.percent === 100 ? 'success' : 'outline'}>
              {workspace.completion.percent}% complete
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/landlord">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60" aria-labelledby="account-summary-title">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <AccountAvatar account={workspace.account} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Account summary</p>
              <h2 id="account-summary-title" className="mt-1 truncate text-lg font-semibold text-zinc-950 dark:text-white sm:text-xl">
                {accountName}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" aria-hidden /> Landlord</span>
                <span className="hidden h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600 sm:block" aria-hidden />
                <span className="truncate">{workspace.account.email}</span>
              </div>
            </div>
          </div>
          <div className="flex min-w-[220px] items-center gap-4 sm:max-w-xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Profile readiness</span>
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">{workspace.completion.percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${workspace.completion.percent}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">{workspace.completion.completedCount} of {workspace.completion.total} sections complete</p>
            </div>
            <Badge variant="success" className="shrink-0"><BadgeCheck className="h-3 w-3" aria-hidden /> Active</Badge>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Account overview">
        <ReadinessCard icon={CircleCheck} label="Profile readiness" value={`${workspace.completion.percent}%`} detail="Based on saved account records" tone={workspace.completion.percent === 100 ? 'positive' : 'neutral'} />
        <ReadinessCard icon={Landmark} label="Settlement status" value={settlementLabel} detail={workspace.settlement.bankName || 'Payout account configuration'} tone={workspace.settlement.state === 'verified' ? 'positive' : 'warning'} />
        <ReadinessCard icon={FileCheck2} label="Documents" value={`${workspace.documents.length} uploaded`} detail={verifiedDocuments > 0 ? `${verifiedDocuments} verified` : 'Awaiting document review'} tone={verifiedDocuments > 0 ? 'positive' : 'neutral'} />
      </section>

      {workspace.onboarding.required && !workspace.onboarding.completed && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 dark:border-amber-500/25 dark:bg-amber-500/10">
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            {workspace.onboarding.remaining} onboarding{' '}
            {workspace.onboarding.remaining === 1 ? 'step is' : 'steps are'} still outstanding for
            your owner account.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/landlord?onboarding=1">
              Resume onboarding
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)_292px]">
        <SectionRail
          items={railItems}
          activeId={activeId}
          onSelect={requestNav}
          percent={workspace.completion.percent}
          completedCount={workspace.completion.completedCount}
        />

        <div className="min-w-0 scroll-mt-4" ref={mainRef}>
          <SectionPanel
            index={activeIndex + 1}
            title={activeMeta.title}
            description={activeMeta.description}
            footer={
              <ActionBar
                state={saveState}
                dirty={dirty}
                error={saveError}
                onBack={handleBack}
                onSave={handleSave}
                onContinue={() => void handleContinue()}
                isFirst={isFirst}
                isLast={isLast}
              />
            }
          >
            {activeId === 'legal' && (
              <SectionLegalOwnership values={draft} onChange={updateDraft} />
            )}

            {activeId === 'contact' && (
              <SectionContactAddress
                values={draft}
                savedPhone={saved.primaryPhone}
                phoneVerified={workspace.account.phoneVerified}
                onChange={updateDraft}
                onPhoneVerified={() => {
                  void refreshWorkspace({ resetDraft: false });
                }}
              />
            )}

            {activeId === 'tax' && <SectionTaxCompliance values={draft} onChange={updateDraft} />}

            {activeId === 'documents' && (
              <SectionIdentityDocuments
                profile={draft}
                documents={workspace.documents}
                account={workspace.account}
                onRefresh={async () => {
                  await refreshWorkspace();
                }}
              />
            )}

            {activeId === 'financial' && (
              <SectionFinancialMandate
                profile={draft}
                settlement={workspace.settlement}
                fees={workspace.platformFees}
                onChange={updateDraft}
              />
            )}
          </SectionPanel>

          <p className="mt-3 px-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Sections are marked complete only from stored records. Uploaded documents enter review
            before they are counted as verified.
          </p>
        </div>

        <div className="hidden min-w-0 xl:block">
          <OwnerSummaryPanel
            profile={draft}
            settlement={workspace.settlement}
            documents={workspace.documents}
            completion={workspace.completion}
            fees={workspace.platformFees}
            onGoToSection={requestNav}
          />
        </div>
      </div>

      <div className="mt-5 xl:hidden">
        <OwnerSummaryPanel
          profile={draft}
          settlement={workspace.settlement}
          documents={workspace.documents}
          completion={workspace.completion}
          fees={workspace.platformFees}
          onGoToSection={requestNav}
        />
      </div>

      <AlertDialog
        open={pendingNav !== null}
        onOpenChange={(open) => {
          if (!open) setPendingNav(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have edits in this section that have not been saved. Moving to another section
              will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const target = pendingNav;
                setPendingNav(null);
                if (target) applyNav(target, saved);
              }}
            >
              Discard and continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

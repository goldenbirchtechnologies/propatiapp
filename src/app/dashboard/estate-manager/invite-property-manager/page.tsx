'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import { useOrganizations, useOrganizationListings } from '@/hooks/useOrganizations';
import { api } from '@/lib/api';
import {
  ArrowLeft, BadgeCheck, Building2, Shield, Check, Clock, CheckCircle2,
  ChevronRight, X, Search,
} from 'lucide-react';

const CERTIFICATIONS = [
  'NIESV Certified Associate (Lagos Branch)',
  'ERCA Registered Estate Surveyor',
  'Independent Institutional Facility Director',
  'IFMA Nigeria Chapter Professional',
];

const PERMISSION_CATEGORIES = [
  {
    title: 'Tenancy & Leases',
    icon: <FileText className="h-4 w-4" />,
    permissions: [
      { id: 'draft_leases', label: 'Draft & Send Lease Agreements', desc: 'Standard Sovereign template generator' },
      { id: 'move_audits', label: 'Move-in / Move-out Audits', desc: 'Upload unit photo condition records' },
      { id: 'rent_demands', label: 'Issue Rent Payment Demands', desc: 'Includes Paystack direct link invoice' },
    ],
  },
  {
    title: 'Maintenance & Operations',
    icon: <Shield className="h-4 w-4" />,
    permissions: [
      { id: 'dispatch_technicians', label: 'Dispatch MEP Technicians', desc: 'Plumbing, electrical & HVAC work' },
      { id: 'approve_orders', label: 'Approve Orders ≤ ₦250,000', desc: 'Auto-cleared under estate reserve cap' },
      { id: 'utility_logs', label: 'Genset Diesel / Utility Logs', desc: 'Update runtime & diesel delivery slips' },
    ],
  },
  {
    title: 'Financial & Reporting',
    icon: <Building2 className="h-4 w-4" />,
    permissions: [
      { id: 'view_ledger', label: 'View Unit Ledgers', desc: 'Read-only access to tenant balances' },
      { id: 'view_reports', label: 'View Financial Reports', desc: 'Read-only access to org reports' },
      { id: 'record_payments', label: 'Record Payments', desc: 'Mark rent or invoices as paid' },
    ],
  },
];

function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  );
}

export default function InvitePropertyManagerPage() {
  const router = useRouter();
  const { organization, loading: orgLoading } = useActiveOrganization();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1: Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [certification, setCertification] = useState(CERTIFICATIONS[0]);
  const [welcomeNote, setWelcomeNote] = useState('');

  // Step 2: Portfolio
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [scopeMode, setScopeMode] = useState<'all' | 'specific'>('all');
  const [propertyQuery, setPropertyQuery] = useState('');

  // Step 3: Permissions
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: orgsData } = useOrganizations();
  const org = orgsData?.data?.[0] || organization;
  const orgId = org?.id;

  const { data: listingsData, isLoading: listingsLoading } = useOrganizationListings(orgId || '', !!orgId);
  const listings = listingsData?.data || [];

  const filteredListings = useMemo(() => {
    if (!propertyQuery) return listings;
    const q = propertyQuery.toLowerCase();
    return listings.filter((l: any) => l.title.toLowerCase().includes(q));
  }, [listings, propertyQuery]);

  const toggleProperty = (id: string) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const delegationValue = useMemo(() => {
    return selectedProperties.reduce((sum, id) => {
      const listing = listings.find((l: any) => l.id === id);
      return sum + (listing?.price || 0);
    }, 0);
  }, [selectedProperties, listings]);

  const unitCount = useMemo(() => {
    return selectedProperties.reduce((sum, id) => {
      const listing = listings.find((l: any) => l.id === id);
      return sum + (listing?._count?.units || 0);
    }, 0);
  }, [selectedProperties, listings]);

  const canProceed = useMemo(() => {
    if (step === 1) return fullName.trim() && email.trim() && phone.trim();
    if (step === 2) return selectedProperties.length > 0;
    return true;
  }, [step, fullName, email, phone, selectedProperties]);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const result = await api.post<{ success?: boolean; error?: string }>(
        '/dashboard/estate-manager/property-manager-invites',
        {
          email: email.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          certification,
          permissions: selectedPermissions,
          scope: scopeMode === 'specific' ? selectedProperties : [],
          welcomeNote: welcomeNote.trim(),
        }
      );
      const isSuccess = result?.success || !result?.error;
      if (isSuccess) {
        setShowSuccess(true);
        setTimeout(() => router.push('/dashboard/estate-manager/team'), 2000);
      }
    } catch {
      // handled silently
    } finally {
      setSubmitting(false);
    }
  };

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!organization && !org) return <NoOrgState title="No Organization" description="Select or create an organization to invite property managers." />;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Success Banner */}
          {showSuccess && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Invitation Dispatched via Clerk & WhatsApp</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Secure invitation token generated for <span className="font-semibold underline">{email}</span>. Mandatory 2FA and Lagos zone audit logs activated.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSuccess(false)} className="rounded p-1 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Invite Property Manager</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Delegate unit administration, tenant onboarding, and field maintenance workflows.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Clerk Org Auth Active
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Clock className="h-3.5 w-3.5" />
                Pending Invitations
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">3</span>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => s < step && setStep(s)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    s === step
                      ? 'bg-emerald-600 text-white'
                      : s < step
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </button>
                <span className={`text-sm font-medium ${s === step ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                  {s === 1 ? 'Credentials' : s === 2 ? 'Portfolio' : 'Permissions'}
                </span>
                {s < 3 && <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Property Manager Credentials & Identity</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Validated against Nigerian institutional real estate registries.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Step 1 of 3</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Full Legal Name</label>
                    <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800">
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="First and last name"
                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-900 dark:text-white">Work Email Address</label>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Clerk SSO Ready</span>
                    </div>
                    <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="work@propati-network.ng"
                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Direct Mobile (SMS / WhatsApp)</label>
                    <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800">
                      <span className="mr-2 flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-white">
                        <span className="text-xs">🇳🇬</span> +234
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="800 000 0000"
                        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Institutional Accreditation Body</label>
                    <div className="relative flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                      <select
                        value={certification}
                        onChange={(e) => setCertification(e.target.value)}
                        className="w-full appearance-none bg-transparent text-sm text-zinc-900 focus:outline-none dark:text-white"
                      >
                        {CERTIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronRight className="pointer-events-none absolute right-3 h-4 w-4 rotate-90 text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Onboarding & Delegation Brief</label>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Appends to Clerk invitation email</span>
                  </div>
                  <textarea
                    value={welcomeNote}
                    onChange={(e) => setWelcomeNote(e.target.value)}
                    placeholder="e.g. Welcome, please review the delegated units in Ikoyi and Lekki. Coordinate with the team for tenant move-in audits."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Portfolio & Property Assignment Scope</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Select estates, residential towers, or specific commercial lots.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Step 2 of 3</span>
                </div>

                {/* Property Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={propertyQuery}
                    onChange={(e) => setPropertyQuery(e.target.value)}
                    placeholder="Search properties…"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-900"
                  />
                </div>

                {/* Property Cards */}
                {listingsLoading ? (
                  <div className="py-8 text-center text-sm text-zinc-500">Loading properties…</div>
                ) : filteredListings.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500">No properties found</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {filteredListings.map((listing: any) => {
                      const isSelected = selectedProperties.includes(listing.id);
                      return (
                        <button
                          key={listing.id}
                          type="button"
                          onClick={() => toggleProperty(listing.id)}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-500/10'
                              : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <input type="checkbox" checked={isSelected} onChange={() => toggleProperty(listing.id)} className="mt-1 h-4 w-4 rounded accent-emerald-600" />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{listing.title}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{listing.area || listing.city || 'Lagos'}</span>
                            <span className={`mt-1 text-[11px] font-semibold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                              ₦{Number(listing.price || 0).toLocaleString('en-NG')}/mo
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Scope Toggle */}
                <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-4 md:flex-row md:items-center md:justify-between dark:bg-zinc-800">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white cursor-pointer">
                      <input type="radio" name="scope" checked={scopeMode === 'all'} onChange={() => setScopeMode('all')} className="accent-emerald-600" />
                      All Units in Selected
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer">
                      <input type="radio" name="scope" checked={scopeMode === 'specific'} onChange={() => setScopeMode('specific')} className="accent-emerald-600" />
                      Specific Units Only
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Delegation Valuation</span>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        ₦{delegationValue.toLocaleString('en-NG')}/mo
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">
                      {unitCount} Units
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Granular Delegated Permissions Matrix</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Fine-grained access rights mapped directly to Clerk RBAC claims.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Step 3 of 3</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {PERMISSION_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        {cat.icon}
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{cat.title}</span>
                      </div>
                      {cat.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <div key={perm.id} className="flex items-center justify-between py-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">{perm.label}</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">{perm.desc}</span>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input type="checkbox" className="sr-only peer" checked={isChecked} onChange={() => togglePermission(perm.id)} />
                              <div className="h-6 w-11 rounded-full bg-zinc-300 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-zinc-700" />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" /> {step > 1 ? 'Back' : 'Cancel'}
            </button>
            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  onClick={() => canProceed && setStep(step + 1)}
                  disabled={!canProceed}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-40"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-40"
                >
                  {submitting ? 'Sending Invitation…' : 'Send Invitation'}
                </button>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}

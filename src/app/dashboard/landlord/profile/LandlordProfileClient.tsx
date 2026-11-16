'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCurrentUser, useUpdateProfile, useUploadAvatar, useVerifyPhone, useRequestPhoneOTP } from '@/hooks/useUsers';
import { useAccountSettings, useUpdateAccountSettings, type AccountSettings } from '@/hooks/useAccountSettings';
import { cn } from '@/lib/utils';
import { useKycStatus } from '@/lib/dojah-client';
import { getStampDutyRule } from '@/lib/stamp-duty-rules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, ShieldCheck, Phone, Camera, Save, LogOut, Monitor, Lock, BadgeCheck, Shield, Building2, Landmark, FileText, Scale, Bell, Users, Wallet, CreditCard, MessageSquare, Receipt, Split, Plus, ChevronRight } from 'lucide-react';

interface LandlordProfileUser {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  profileBio?: string | null;
}

interface LandlordProfileClientProps {
  user: LandlordProfileUser;
}

type TabId = 'overview' | 'billing' | 'compliance' | 'notifications' | 'team' | 'security';

/**
 * Module-constant so the URL-sync effect can validate against the same list the
 * render maps over without re-deriving it every render.
 */
const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Business and Identity KYC', icon: <Building2 size={16} /> },
  { id: 'billing', label: 'Payout Banking', icon: <Landmark size={16} /> },
  { id: 'compliance', label: 'License Compliance', icon: <Scale size={16} /> },
  { id: 'notifications', label: 'Notification & SMS Channels', icon: <Bell size={16} /> },
  { id: 'team', label: 'Team Access', icon: <Users size={16} /> },
  { id: 'security', label: 'Security & API Keys', icon: <Shield size={16} /> },
];

/**
 * Shared design tokens for this page. Centralised so the tab strip, summary
 * cards, status chips and form controls all draw from one scale instead of each
 * site inventing its own sizes.
 */
const cardClass = 'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-400';
const helperClass = 'mt-1.5 text-xs text-zinc-500 dark:text-zinc-400';
const chipBase =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap';

/** Explicit empty state — never a bare dash, which reads as an error. */
const EmptyValue = ({ children }: { children: React.ReactNode }) => (
  <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">{children}</span>
);

export default function LandlordProfileClient({ user: initialUser }: LandlordProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { data: kyc } = useKycStatus();
  const [profileData, setProfileData] = useState({
    fullName: initialUser?.fullName || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    profileBio: initialUser?.profileBio || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [phoneOTP, setPhoneOTP] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [otpRevealed, setOtpRevealed] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(false);
  const [userNotifications, setUserNotifications] = useState({
    rent_due: true,
    payment: true,
    message: true,
    verification: true,
    agreement: true,
    maintenance: true,
    screening: true,
    system: true,
  });
  const {
    data: accountSettings,
    isLoading: accountLoading,
    isError: accountError,
    refetch: refetchAccount,
  } = useAccountSettings();

  // The billing tab is deep-linked from other pages (?tab=billing on the rents
  // page). Without reading it here every one of those links silently landed on
  // Overview instead, because the tab lived only in local state.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('tab');
    if (wanted && tabs.some((t) => t.id === wanted)) setActiveTab(wanted as TabId);
  }, []);
  const updateAccountSettings = useUpdateAccountSettings();
  const [notifSaving, setNotifSaving] = useState<string | null>(null);

  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const requestPhoneOTPMutation = useRequestPhoneOTP();
  const verifyPhoneMutation = useVerifyPhone();
  const { toast } = useToast();

  const user = currentUser || initialUser;

  const settings = accountSettings?.settings;
  const settlement = accountSettings?.settlement;
  const settlementState = settlement?.settlement.state ?? 'missing';

  // Notification preferences come from the user's own row, the same endpoint the
  // tenant settings page already uses, so both surfaces read one contract.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/users/notification-preferences', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success && json.data?.types) {
          setUserNotifications((prev) => ({ ...prev, ...json.data.types }));
        }
      })
      .catch(() => {
        // The toggles fall back to their documented defaults; a failed read must
        // not block the rest of the settings page.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!otpCooldown || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown, otpCountdown]);

  const verificationSteps = [
    { key: 'phoneVerified', label: 'Phone Number', icon: <Phone className="h-4 w-4" /> },
  ] as const;

  const verifiedCount = verificationSteps.filter((step) => !!user?.[step.key]).length;
  const hasName = !!profileData.fullName?.trim();
  const hasEmail = !!profileData.email?.trim();
  const profileCompleteSteps = (verifiedCount + (hasName ? 1 : 0) + (hasEmail ? 1 : 0));
  const totalSteps = verificationSteps.length + 2;
  const verificationComplete = !!kyc?.status && kyc.status !== 'not_started' && kyc.status !== 'rejected';
  const profileProgress = Math.round((profileCompleteSteps / totalSteps) * 100);

  const missingActions = [
    !user?.phoneVerified && profileData.phone ? 'Verify your phone number' : null,
  ].filter(Boolean);

  /** The statutory ad valorem rate, read from the shared rule set rather than retyped. */
  const stampDutyRatePercent = (getStampDutyRule('residential_tenancy').rate * 100).toFixed(2);

  /**
   * Persists one gateway toggle. The success toast is only emitted once the
   * server has acknowledged the write — the previous version toasted "saved"
   * with no request behind it, so the switch never survived a refresh.
   */
  const saveGatewayToggle = async (key: keyof AccountSettings, label: string, enabled: boolean) => {
    try {
      await updateAccountSettings.mutateAsync({ [key]: enabled } as Partial<AccountSettings>);
      toast({
        title: 'Preference saved',
        description: `${label} ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch {
      toast({
        title: 'Could not save preference',
        description: 'Your change was not stored. Please try again.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Persists one notification toggle. The optimistic switch state is restored if
   * the PATCH is rejected, so the UI never claims a preference the server
   * didn't record.
   */
  const saveNotificationToggle = async (id: keyof typeof userNotifications, checked: boolean) => {
    const previous = userNotifications[id];
    setUserNotifications((prev) => ({ ...prev, [id]: checked }));
    setNotifSaving(id);
    try {
      const res = await fetch('/api/users/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types: { [id]: checked } }),
      });
      if (!res.ok) throw new Error('PATCH failed');
    } catch {
      setUserNotifications((prev) => ({ ...prev, [id]: previous }));
      toast({
        title: 'Could not save preference',
        description: 'Your change was not stored. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setNotifSaving(null);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        fullName: profileData.fullName,
        phone: profileData.phone,
        profileBio: profileData.profileBio,
      });
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
      refetchUser();
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive' });
      return;
    }
    setIsUploadingAvatar(true);
    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast({ title: 'Avatar updated', description: 'Your profile picture has been changed.' });
      refetchUser();
    } catch {
      toast({ title: 'Error', description: 'Failed to upload avatar. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRequestPhoneOTP = async () => {
    if (!profileData.phone) {
      toast({ title: 'Phone required', description: 'Please enter your phone number first.', variant: 'destructive' });
      return;
    }
    try {
      await requestPhoneOTPMutation.mutateAsync(profileData.phone);
      toast({ title: 'OTP sent', description: 'A verification code has been sent to your phone.' });
      setOtpRevealed(true);
      setOtpCooldown(true);
      setOtpCountdown(60);
    } catch {
      toast({ title: 'Error', description: 'Failed to send OTP. Please try again.' });
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOTP) {
      toast({ title: 'OTP required', description: 'Please enter the verification code.', variant: 'destructive' });
      return;
    }
    try {
      await verifyPhoneMutation.mutateAsync({ phone: profileData.phone, otp: phoneOTP });
      toast({ title: 'Phone verified', description: 'Your phone number has been verified.' });
      refetchUser();
      setPhoneOTP('');
      setOtpRevealed(false);
    } catch {
      toast({ title: 'Error', description: 'Invalid OTP. Please try again.' });
    }
  };

  /**
   * The three summary cards were hardcoded "—" for Properties and Title Audit
   * Rating. Both are derivable from real records, so they are now computed and
   * fall back to an explicit empty state rather than an ambiguous dash.
   *
   * The profile query includes `ownedListings`; the react-query wrapper types it
   * loosely, so the row shape is declared here rather than widening the hook.
   */
  type PortfolioListing = { verificationTier?: string | null };
  const ownedListings: PortfolioListing[] = user?.ownedListings ?? [];
  const propertyCount = ownedListings.length;

  /** Highest verification tier reached across the portfolio, for the audit card. */
  const TIER_RANK: Record<string, number> = { basic: 0, verified: 1, inspected: 2, certified: 3 };
  const bestTier =
    propertyCount === 0
      ? null
      : ownedListings.reduce<string>((best, l) => {
          const t = l.verificationTier ?? 'basic';
          return (TIER_RANK[t] ?? 0) > (TIER_RANK[best] ?? 0) ? t : best;
        }, 'basic');
  const tierLabel = bestTier ? bestTier.charAt(0).toUpperCase() + bestTier.slice(1) : null;

  /**
   * The five verification layers, each read from a field the platform actually
   * holds. The previous version hardcoded every layer to CERTIFIED, which told
   * every landlord their title and survey were registry-matched even when they
   * had never been checked.
   */
  const kycLayerStatus = (done: boolean, pendingLabel = 'IN REVIEW') => (done ? 'CERTIFIED' : pendingLabel);
  const kycLayers = [
    {
      layer: 'L1',
      label: 'Identity & ID Check',
      status: kycLayerStatus(!!user?.idVerified),
      desc: user?.idVerified
        ? 'Identity document and liveness check verified via Dojah.'
        : 'Submit a government ID to have your identity checked.',
    },
    {
      layer: 'L2',
      label: 'Business Entity & Registration Status',
      status: kycLayerStatus(!!user?.ownedOrganisations?.[0]?.verified, 'NOT SUBMITTED'),
      desc: user?.ownedOrganisations?.[0]?.verified
        ? `${user.ownedOrganisations[0].name} is verified against its Business Registration record.`
        : 'Register or verify an organisation to certify this layer.',
    },
    {
      layer: 'L3',
      label: "Title Deed & Governor's Consent",
      status: 'NOT SUBMITTED',
      desc: 'Submit title documents with a property to have the deed checked.',
    },
    {
      layer: 'L4',
      label: 'Survey Plan & Location Map Coordinates',
      status: 'NOT SUBMITTED',
      desc: 'Submit a survey plan with a property to have its boundaries checked.',
    },
    {
      layer: 'L5',
      label: 'Bank & Tax Clearance',
      status: kycLayerStatus(settlementState === 'verified', 'ACTION REQUIRED'),
      desc:
        settlementState === 'verified'
          ? 'Payout account resolved and name-matched to your verified identity.'
          : settlementState === 'pending'
            ? 'Settlement account saved — name match is still pending.'
            : 'Add a payout account to certify this layer.',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb & sync status */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-2">
        <ol className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <li className="uppercase tracking-wider">Business Account</li>
          <li aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
            <ChevronRight size={14} />
          </li>
          <li className="truncate font-semibold text-primary dark:text-[#4edea3]">Profile</li>
        </ol>

        {/* Sync state: colour plus a text label, so it is not colour-only. */}
        <div
          role="status"
          className={`${chipBase} bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              accountError ? 'bg-red-500' : accountLoading ? 'animate-pulse bg-amber-500' : 'bg-primary'
            }`}
          />
          {accountError ? 'Not synced' : accountLoading ? 'Syncing…' : 'Synced'}
        </div>
      </nav>

      {/* Page title + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Manage business ownership records, land title verification, and payouts.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/*
            The dossier generator does not exist yet (only agreement PDFs are
            produced). The action is kept rather than removed, but it is disabled
            and labelled so it never reads as something the user can run today.
          */}
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-describedby="dossier-help"
            className="whitespace-nowrap"
          >
            <FileText size={14} />
            Compliance Dossier (.PDF)
          </Button>
          <span id="dossier-help" className="sr-only">
            Not available yet. Document generation is still in progress.
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      {/*
        tablist semantics + roving arrow-key navigation, and no per-tab min-width
        so long labels wrap to a second line instead of being clipped or forcing
        horizontal scroll on desktop.
      */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 shadow-sm dark:bg-zinc-900"
        onKeyDown={(e) => {
          if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
          const index = tabs.findIndex((t) => t.id === activeTab);
          if (index < 0) return;
          const next =
            e.key === 'ArrowRight'
              ? tabs[(index + 1) % tabs.length]
              : tabs[(index - 1 + tabs.length) % tabs.length];
          setActiveTab(next.id);
          document.getElementById(`tab-${next.id}`)?.focus();
        }}
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-w-fit flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium whitespace-normal text-center leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 sm:flex-row sm:gap-2 ${
                selected
                  ? 'bg-white font-semibold text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div
                id="panel-overview"
                role="tabpanel"
                aria-labelledby="tab-overview"
                className="space-y-6"
              >
                {/* Profile Header Summary Card */}
                <div className={`${cardClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
                  <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="relative shrink-0">
                      <Avatar
                        src={user?.avatarUrl || undefined}
                        name={user?.fullName || 'User'}
                        size="xl"
                        className="h-20 w-20 ring-2 ring-primary/30"
                      />
                      {/*
                        The upload control is a real button now, with an accessible name.
                        A <label> wrapping an sr-only file input previously announced
                        nothing to assistive tech.
                      */}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        aria-label="Change profile photo"
                        title="Change profile photo"
                        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-primary shadow-md transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-[#4edea3]"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Camera size={14} />
                        )}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="sr-only"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                          {user?.fullName || 'My Profile'}
                        </h2>
                        <span className={`${chipBase} bg-primary/10 text-primary dark:text-[#4edea3]`}>
                          <ShieldCheck size={12} aria-hidden="true" />
                          Landlord
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">{user?.email}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <Monitor size={12} aria-hidden="true" className="text-primary dark:text-[#4edea3]" />
                          {user?.isActive === false ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {/*
                      Previously a bare button with no handler — it looked clickable
                      and did nothing. It now focuses the first editable field.
                    */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab('overview');
                        document.getElementById('legal-full-name')?.focus();
                      }}
                      className="w-full sm:w-auto"
                    >
                      <FileText size={14} />
                      Edit Profile
                    </Button>
                  </div>
                </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className={`${cardClass} bg-zinc-50 p-4 dark:bg-zinc-900`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Properties
              </span>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  {propertyCount}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Portfolio</span>
              </div>
            </div>

            <div className={`${cardClass} bg-zinc-50 p-4 dark:bg-zinc-900`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Settlement Status
              </span>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                {accountLoading ? (
                  <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Checking…</span>
                ) : settlementState === 'verified' ? (
                  <span className="text-xl font-bold text-primary dark:text-[#4edea3]">Linked</span>
                ) : settlementState === 'pending' ? (
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">Pending</span>
                ) : (
                  <EmptyValue>Not configured</EmptyValue>
                )}
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Escrow</span>
              </div>
            </div>

            <div className={`${cardClass} bg-zinc-50 p-4 dark:bg-zinc-900`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Title Audit Rating
              </span>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                {tierLabel ? (
                  <>
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">{tierLabel}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Verification</span>
                  </>
                ) : (
                  <>
                    <EmptyValue>Not available</EmptyValue>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Verification</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Personal & Entity Records Form */}
          <div className={`${cardClass} space-y-5 p-5 sm:p-6`}>
            <div className="flex flex-col gap-2 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Personal &amp; Entity Records
                </h3>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  Used across filings and corporate deeds of lease.
                </p>
              </div>
              <span className={`${chipBase} shrink-0 self-start bg-zinc-100 text-zinc-700 sm:self-center dark:bg-zinc-800 dark:text-zinc-300`}>
                Tier 3 Data
              </span>
            </div>

            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="legal-full-name" className={labelClass}>
                  Legal Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="legal-full-name"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  />
                  {/*
                    The check mark used to be unconditional, implying registry
                    verification that is not asserted here. It only renders when
                    identity verification actually holds.
                  */}
                  {!!user?.idVerified && (
                    <BadgeCheck
                      size={16}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary dark:text-[#4edea3]"
                    />
                  )}
                </div>
                <p className={helperClass}>Matches National Identity Number registry.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="direct-telephone" className={labelClass}>
                  Direct Telephone
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      id="direct-telephone"
                      type="tel"
                      inputMode="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      aria-describedby="phone-help"
                    />
                  </div>
                  {user?.phoneVerified ? (
                    <span className={`${chipBase} bg-primary/10 text-primary dark:text-[#4edea3]`}>
                      <ShieldCheck size={14} aria-hidden="true" /> Verified
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRequestPhoneOTP}
                      disabled={!profileData.phone || otpCooldown || requestPhoneOTPMutation.isPending}
                      aria-describedby={!profileData.phone ? 'phone-help' : undefined}
                      className="whitespace-nowrap"
                    >
                      {requestPhoneOTPMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : otpCountdown > 0 ? (
                        `${otpCountdown}s`
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  )}
                </div>
                {/*
                  The instruction sits directly under the field it explains, so
                  the user knows why Send OTP is disabled before trying it.
                */}
                <p id="phone-help" className={helperClass}>
                  {!user?.phoneVerified
                    ? 'Enter a Nigerian mobile number to receive a one-time verification code.'
                    : 'This number is verified and receives payment alerts.'}
                </p>

                {otpRevealed && !user?.phoneVerified && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="phone-otp"
                      placeholder="6-digit OTP"
                      value={phoneOTP}
                      onChange={(e) => setPhoneOTP(e.target.value)}
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label="One-time passcode"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleVerifyPhone}
                      disabled={verifyPhoneMutation.isPending || phoneOTP.length !== 6}
                      className="whitespace-nowrap"
                    >
                      {verifyPhoneMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                )}

                {missingActions.map((action) => (
                  <p
                    key={action}
                    role="alert"
                    className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
                  >
                    <AlertCircle size={12} aria-hidden="true" /> {action}
                  </p>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="corporate-email" className={labelClass}>
                  Corporate Email
                </Label>
                <div className="relative">
                  <Input
                    id="corporate-email"
                    type="email"
                    value={profileData.email}
                    disabled
                    aria-describedby="corporate-email-help"
                  />
                  <Lock
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                  />
                </div>
                {/*
                  The field was locked with no explanation. The route is
                  owner-only and does not accept an email write, so this states
                  where the address comes from instead of inventing a change flow.
                */}
                <p id="corporate-email-help" className={helperClass}>
                  Managed by your Clerk sign-in identity. To use a different address,
                  update it in your account security settings or contact support.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-bio" className={labelClass}>
                  Profile Bio
                </Label>
                <Textarea
                  id="profile-bio"
                  value={profileData.profileBio}
                  onChange={(e) => setProfileData({ ...profileData, profileBio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="field-sizing-content min-h-20 resize-none"
                />
              </div>

              <div className="flex justify-end md:col-span-2">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={14} className="mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: STATUTORY COMPLIANCE & LASRERA */}
      {activeTab === 'compliance' && (
              <div id="panel-compliance" role="tabpanel" aria-labelledby="tab-compliance" className="space-y-6">
          {/* KYC Overall Status Banner */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-[#4edea3]">
                  <BadgeCheck size={20} />
                </span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">
                  {verificationComplete ? 'Institutional Certified' : 'Verification Pending'}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                Complete automated compliance monitoring against Nigerian statutory registries.
              </p>
            </div>
            <div className="flex flex-col items-end w-full md:w-48">
              <div className="flex items-center justify-between w-full mb-1.5 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Verification Score</span>
                <span className="text-primary dark:text-[#4edea3] font-bold font-mono">{profileProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${profileProgress}%` }} />
              </div>
            </div>
          </div>

          {/* 5-Layer Verification System */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white">5-Layer Protocol Verification</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Continuous automated compliance monitoring against Nigerian statutory registries.</p>
            <div className="space-y-2">
              {kycLayers.map((layer) => (
                <div key={layer.layer} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-primary dark:text-[#4edea3] font-bold text-xs flex items-center justify-center shrink-0">
                      {layer.layer}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{layer.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          layer.status === 'CERTIFIED' ? 'bg-primary/10 text-primary dark:text-[#4edea3]' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {layer.status}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 block">{layer.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
              <div id="panel-security" role="tabpanel" aria-labelledby="tab-security" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Change Password</h3>
            <form className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
              </div>
              <Button type="button" className="w-full" disabled={passwordData.newPassword !== passwordData.confirmPassword || !passwordData.currentPassword}>
                <Lock size={14} className="mr-2" /> Update Password
              </Button>
            </form>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <SessionItem current browser="Chrome on Windows" location="Lagos, Nigeria" />
              <SessionItem device="Mobile" browser="Safari on iOS" location="Abuja, Nigeria" />
            </div>
            <Button variant="ghost" className="mt-3 text-red-500">
              <AlertCircle size={14} className="mr-2" /> Log out of all other sessions
            </Button>
          </div>
        </div>
      )}

      {/* TAB: PAYOUT & SETTLEMENT BANKING */}
      {activeTab === 'billing' && (
              <div id="panel-billing" role="tabpanel" aria-labelledby="tab-billing" className="space-y-6">
          {/* Rent Collection & Settlement Banking */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-primary dark:text-[#4edea3]" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Rent Collection & Settlement Banking</h2>
              </div>
              {settlementState === 'verified' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-[#4edea3] text-xs font-semibold uppercase tracking-wide">
                  <ShieldCheck size={14} /> Settlement account verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wide">
                  <AlertCircle size={14} /> {settlementState === 'pending' ? 'Verification pending' : 'Not verified'}
                </span>
              )}
            </div>

            {/* Primary Settlement Account Card */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-white/[0.04] dark:to-white/[0.08] flex flex-col gap-4 relative overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
              {settlementState === 'missing' ? (
                /* No account on file. The old card filled this in with a demo bank
                   and account number, which read as though the landlord had a
                   settlement account they had never added. */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-400">
                      <Landmark size={28} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-white">No settlement account yet</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Add the bank account rent should be paid into. It is name-matched to your verified identity before payouts are released.
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/onboarding?step=landlordSettlement"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:brightness-110"
                  >
                    <Plus size={14} /> Add settlement account
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-primary dark:text-[#4edea3]">
                        <Building2 size={28} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {settlement?.settlement.bankName ?? 'Bank not recorded'}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {settlementState === 'verified'
                            ? 'Resolved and name-matched to your verified identity'
                            : 'Saved — name match with your verified identity is still pending'}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-semibold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[var(--sovereign-container-bg)] animate-pulse" />
                      PRIMARY ESCROW
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">NUBAN Account Number</span>
                      <span className="font-mono text-lg font-semibold text-zinc-900 dark:text-white tracking-wider">
                        {settlement?.settlement.accountNumberMasked ?? '—'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Account Beneficiary</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white uppercase truncate">
                        {settlement?.settlement.accountName ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/onboarding?step=landlordSettlement"
                      className="text-primary dark:text-[#4edea3] text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <FileText size={14} /> {settlementState === 'verified' ? 'Edit Bank Account' : 'Complete verification'}
                    </Link>
                  </div>
                </>
              )}

              {/* Direct Split Escrow Rule — driven by the stored split, hidden when off */}
              {(settings?.escrowSplitPercent ?? 0) > 0 && (
                <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between gap-3 border border-zinc-200 dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <Split size={20} className="text-primary dark:text-[#4edea3]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Automated Facility Escrow Split</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Auto-split {settings?.escrowSplitPercent}% statutory maintenance escrow to reserve wallet upon rent clearance
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary dark:text-[#4edea3] bg-primary/10 px-2 py-1 rounded">
                    ACTIVE ({settings?.escrowSplitPercent}%)
                  </span>
                </div>
              )}
            </div>

            {/* Gateway Toggles — each bound to a stored column on the landlord's profile */}
            {accountError && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <span className="flex items-center gap-2">
                  <AlertCircle size={16} /> Could not load your saved preferences.
                </span>
                <button type="button" onClick={() => refetchAccount()} className="font-semibold underline">
                  Retry
                </button>
              </div>
            )}
            <div className="flex flex-col divide-y divide-zinc-200 dark:divide-white/[0.08] pt-2">
              {([
                { key: 'paystackInvoicingEnabled', icon: <CreditCard size={20} />, title: 'Paystack Direct Invoicing & Virtual Accounts', desc: 'Generates dedicated virtual bank accounts for each tenant. Supports USSD, Cards, and Instant Bank Transfers.', color: 'bg-primary/10 text-primary dark:text-[#4edea3]' },
                { key: 'paymentRemindersEnabled', icon: <MessageSquare size={20} />, title: 'Automated SMS & WhatsApp Payment Reminders', desc: 'Dispatches formal renewal prompts directly to corporate and residential tenants at 30 days, 14 days, and 3 days before expiry.', color: 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300' },
                { key: 'stampDutySurchargeEnabled', icon: <Receipt size={20} />, title: `Tenant Invoicing Stamp Duty Surcharge (Ad Valorem ${stampDutyRatePercent}%)`, desc: 'Automatically calculates and itemizes statutory FIRS/LIRS electronic stamp duty on generated tenant proforma invoices.', color: 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300' },
              ] as const).map((g) => {
                const isPending =
                  updateAccountSettings.isPending &&
                  updateAccountSettings.variables?.[g.key] !== undefined;
                return (
                  <div key={g.key} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${g.color}`}>
                        {g.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{g.title}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{g.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPending && <Loader2 size={14} className="animate-spin text-zinc-400" />}
                      <Switch
                        checked={settings?.[g.key] ?? false}
                        disabled={accountLoading || !settings || isPending}
                        aria-label={g.title}
                        onCheckedChange={(checked) => saveGatewayToggle(g.key, g.title, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: NOTIFICATION & SMS CHANNELS */}
      {activeTab === 'notifications' && (
              <div id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Notification Preferences</h3>
            <div className="space-y-6">
              {([
                { id: 'rent_due', label: 'Rent Due Reminders', desc: 'Get notified 7, 3, and 1 days before rent is due' },
                { id: 'payment', label: 'Payment Notifications', desc: 'Receive alerts for rent payments received and refunds' },
                { id: 'message', label: 'New Messages', desc: 'Get notified when you receive a new message' },
                { id: 'verification', label: 'Verification Updates', desc: 'Status changes on your property verifications' },
                { id: 'agreement', label: 'Agreement Activity', desc: 'Signatures, expirations, and agreement updates' },
                { id: 'maintenance', label: 'Maintenance Requests', desc: 'New maintenance tickets and status updates' },
                { id: 'screening', label: 'Screening Calls', desc: 'Scheduled and completed tenant screening calls' },
                { id: 'system', label: 'System Announcements', desc: 'Platform updates, new features, and maintenance windows' },
              ] as const).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-white">{item.label}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifSaving === item.id && <Loader2 size={14} className="animate-spin text-zinc-400" />}
                    <Switch
                      checked={userNotifications[item.id]}
                      disabled={notifSaving === item.id}
                      onCheckedChange={(checked) => saveNotificationToggle(item.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TEAM & DELEGATION ACCESS */}
      {activeTab === 'team' && (
              <div id="panel-team" role="tabpanel" aria-labelledby="tab-team" className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Team & Delegation Access</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage delegated access for property managers and accountants. Coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionItem({ current = false, device = 'Current Device', browser, location }: { current?: boolean; device?: string; browser: string; location: string }) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3', current ? 'border-primary/30 bg-primary/5' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900')}>
      <div className="flex items-center gap-3">
        <div className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          <Monitor className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-white">{device}</span>
            {current && <Badge variant="secondary" className="text-xs">Current</Badge>}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{browser} • {location}</p>
        </div>
      </div>
      {!current && (
        <Button variant="ghost" size="sm" className="text-red-500">
          <LogOut size={14} />
        </Button>
      )}
    </div>
  );
}

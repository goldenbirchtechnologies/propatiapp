'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, AlertCircle, ShieldCheck, Phone, Camera, Save, LogOut, Monitor, Lock, BadgeCheck, User, Shield, Building2, Landmark, FileText, Scale, Bell, Users, Wallet, CreditCard, MessageSquare, Receipt, Fingerprint, Smartphone, RefreshCw, Split, Percent, Plus } from 'lucide-react';

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
  { id: 'overview', label: 'Corporate & Entity KYC', icon: <Building2 size={16} /> },
  { id: 'billing', label: 'Payout & Settlement Banking', icon: <Landmark size={16} /> },
  { id: 'compliance', label: 'Statutory Compliance & LASRERA', icon: <Scale size={16} /> },
  { id: 'notifications', label: 'Notification & SMS Channels', icon: <Bell size={16} /> },
  { id: 'team', label: 'Team & Delegation Access', icon: <Users size={16} /> },
  { id: 'security', label: 'Security & API Keys', icon: <Shield size={16} /> },
];

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
    // `tabs` is module-constant; only the initial URL matters for this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tabs = [
    { id: 'overview' as const, label: 'Corporate & Entity KYC', icon: <Building2 size={16} /> },
    { id: 'billing' as const, label: 'Payout & Settlement Banking', icon: <Landmark size={16} /> },
    { id: 'compliance' as const, label: 'Statutory Compliance & LASRERA', icon: <Scale size={16} /> },
    { id: 'notifications' as const, label: 'Notification & SMS Channels', icon: <Bell size={16} /> },
    { id: 'team' as const, label: 'Team & Delegation Access', icon: <Users size={16} /> },
    { id: 'security' as const, label: 'Security & API Keys', icon: <Shield size={16} /> },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Corporate & Entity KYC', icon: <Building2 size={16} /> },
    { id: 'billing' as const, label: 'Payout & Settlement Banking', icon: <Landmark size={16} /> },
    { id: 'compliance' as const, label: 'Statutory Compliance & LASRERA', icon: <Scale size={16} /> },
    { id: 'notifications' as const, label: 'Notification & SMS Channels', icon: <Bell size={16} /> },
    { id: 'team' as const, label: 'Team & Delegation Access', icon: <Users size={16} /> },
    { id: 'security' as const, label: 'Security & API Keys', icon: <Shield size={16} /> },
  ];

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
      label: 'Identity & Biometrics',
      status: kycLayerStatus(!!user?.idVerified),
      desc: user?.idVerified
        ? 'Identity document and liveness check verified via Dojah.'
        : 'Submit a government ID to have your identity checked.',
    },
    {
      layer: 'L2',
      label: 'Corporate Entity & CAC Status',
      status: kycLayerStatus(!!user?.ownedOrganisations?.[0]?.verified, 'NOT SUBMITTED'),
      desc: user?.ownedOrganisations?.[0]?.verified
        ? `${user.ownedOrganisations[0].name} is verified against its CAC record.`
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
      label: 'Survey Plan & GIS Coordinates',
      status: 'NOT SUBMITTED',
      desc: 'Submit a survey plan with a property to have its boundaries checked.',
    },
    {
      layer: 'L5',
      label: 'Institutional Bank & Tax Clearance',
      status: kycLayerStatus(settlementState === 'verified', 'ACTION REQUIRED'),
      desc:
        settlementState === 'verified'
          ? 'Settlement account resolved and name-matched to your verified identity.'
          : settlementState === 'pending'
            ? 'Settlement account saved — name match is still pending.'
            : 'Add a settlement account to certify this layer.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <span>Institutional Account</span>
          <span>›</span>
          <span className="text-primary dark:text-[#4edea3] font-semibold">Profile</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              accountError ? 'bg-red-500' : accountLoading ? 'bg-amber-500 animate-pulse' : 'bg-primary'
            }`}
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {accountError ? 'Not synced' : accountLoading ? 'Syncing…' : 'Synced'}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Profile & Governance</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage institutional ownership records, land title verification, and settlements.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          <FileText size={16} />
          Compliance Dossier (.PDF)
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-900 p-1 rounded-xl flex items-center gap-1 shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Profile Header Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar src={user?.avatarUrl || undefined} name={user?.fullName || 'User'} size="xl" className="h-20 w-20 ring-2 ring-primary/30" />
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full shadow-md flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                  <Camera size={14} className="text-primary dark:text-[#4edea3]" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} className="sr-only" />
                </label>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user?.fullName || 'My Profile'}</h2>
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary dark:text-[#4edea3] px-2 py-0.5 rounded-full text-xs font-medium">
                    <ShieldCheck size={12} />
                    Landlord
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                  <span className="flex items-center gap-1"><Building2 size={12} className="text-primary dark:text-[#4edea3]" /> Landlord</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Monitor size={12} className="text-primary dark:text-[#4edea3]" /> Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <FileText size={16} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Properties</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">—</span>
                <span className="text-xs text-primary dark:text-[#4edea3] font-medium">Portfolio</span>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Settlement Status</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-zinc-900 dark:text-white font-mono">
                  {accountLoading
                    ? '…'
                    : settlementState === 'verified'
                      ? 'Linked'
                      : settlementState === 'pending'
                        ? 'Pending'
                        : 'Not set'}
                </span>
                <span className="text-xs text-primary dark:text-[#4edea3] font-medium">Escrow</span>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Title Audit Rating</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-primary dark:text-[#4edea3]">—</span>
                <span className="text-xs text-primary dark:text-[#4edea3] font-medium">Verification</span>
              </div>
            </div>
          </div>

          {/* Personal & Entity Records Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">Personal & Entity Records</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Used across filings and corporate deeds of lease.</p>
              </div>
              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-xs text-zinc-700 dark:text-zinc-300 font-semibold">Tier 3 Data</span>
            </div>
            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Legal Full Name</Label>
                <div className="relative">
                  <Input value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} />
                  <BadgeCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Direct Telephone</Label>
                <div className="flex gap-2">
                  <Input value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+234 800 000 0000" />
                  {user?.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 rounded-lg bg-primary/10 text-primary dark:text-[#4edea3] text-xs font-medium whitespace-nowrap">
                      <ShieldCheck size={14} /> Verified
                    </span>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={handleRequestPhoneOTP} disabled={!profileData.phone || otpCooldown || requestPhoneOTPMutation.isPending} className="whitespace-nowrap">
                      {requestPhoneOTPMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : otpCountdown > 0 ? `${otpCountdown}s` : 'Send OTP'}
                    </Button>
                  )}
                </div>
                {otpRevealed && !user?.phoneVerified && (
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="6-digit OTP" value={phoneOTP} onChange={(e) => setPhoneOTP(e.target.value)} maxLength={6} />
                    <Button type="button" variant="secondary" size="sm" onClick={handleVerifyPhone} disabled={verifyPhoneMutation.isPending || phoneOTP.length !== 6}>
                      {verifyPhoneMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                )}
                {missingActions.map((action) => (
                  <p key={action} className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                    <AlertCircle size={12} /> {action}
                  </p>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Corporate Email</Label>
                <div className="relative">
                  <Input value={profileData.email} disabled type="email" />
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Profile Bio</Label>
                <Textarea value={profileData.profileBio} onChange={(e) => setProfileData({ ...profileData, profileBio: e.target.value })} placeholder="Tell others about yourself..." rows={3} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: STATUTORY COMPLIANCE & LASRERA */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
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
        <div className="space-y-6">
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
        <div className="space-y-6">
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
        <div className="space-y-6">
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
        <div className="space-y-6">
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

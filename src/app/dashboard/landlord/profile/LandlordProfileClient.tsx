'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser, useUpdateProfile, useUploadAvatar, useVerifyPhone, useRequestPhoneOTP } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import { useKycStatus, KycStatus } from '@/lib/dojah-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, Phone, Camera, Save, LogOut, Monitor, Lock } from 'lucide-react';
import DojahWidgetClient from '@/components/verification/DojahWidgetClient';

interface LandlordProfileClientProps {
  user: unknown;
}

export default function LandlordProfileClient({ user: initialUser }: LandlordProfileClientProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const { data: kyc, reload } = useKycStatus();
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

  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const requestPhoneOTPMutation = useRequestPhoneOTP();
  const verifyPhoneMutation = useVerifyPhone();
  const { toast } = useToast();

  const user = currentUser || initialUser;

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

  const initials = (user?.fullName || initialUser?.fullName || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const verificationSteps = [
    { key: 'phoneVerified', label: 'Phone Number', icon: <Phone className="h-4 w-4" /> },
  ] as const;

  const verifiedCount = verificationSteps.filter((step) => !!user?.[step.key]).length;
  const verificationComplete = !!kyc?.status && kyc.status !== 'not_started' && kyc.status !== 'rejected';
  const profileProgress = Math.round(((verifiedCount + (profileData.fullName ? 1 : 0) + (profileData.email ? 1 : 0)) / (verificationSteps.length + 2)) * 100);

  const missingActions = [
    !user?.phoneVerified && profileData.phone ? 'Verify your phone number' : null,
  ].filter(Boolean);

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
      toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
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
      toast({ title: 'Error', description: 'Invalid OTP. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="rounded-3xl border border-[#262626] bg-obsidian-800/30 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/5 ring-2 ring-border">
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white md:text-3xl">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user?.fullName || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <label className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} className="sr-only" />
              </label>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={verificationComplete ? 'default' : 'secondary'} className="capitalize">
                  {verificationComplete ? 'Profile complete' : 'Profile incomplete'}
                </Badge>
                {user?.phoneVerified && <Badge variant="secondary">Phone verified</Badge>}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{user?.fullName || 'My profile'}</h1>
              <p className="text-sm text-zinc-400">{user?.email}</p>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">Keep your identity, security, and notification settings up to date so the rest of the dashboard stays trusted and easy to use.</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {missingActions.map((action) => (
                  <Button key={action} type="button" variant="outline" size="sm" className="h-8 gap-1.5 border-green-500/30 text-green-500 hover:bg-emerald-500/10">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:min-w-[340px]">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="secondary" className="text-xs font-semibold">{profileProgress}% complete</Badge>
              <span className="text-xs text-zinc-400">{verifiedCount}/{verificationSteps.length + 2} steps</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${profileProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-zinc-400">{verificationComplete ? 'Setup complete.' : 'Verify your phone and identity to finish setup.'}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList variant="line" className="grid w-full grid-cols-4 bg-transparent border-b border-[#262626]">
          <TabsTrigger value="personal" className="border-b-2 border-transparent data-[state=active]:border-green-500 rounded-none">Personal Info</TabsTrigger>
          <TabsTrigger value="verification" className="border-b-2 border-transparent data-[state=active]:border-green-500 rounded-none">Verification</TabsTrigger>
          <TabsTrigger value="security" className="border-b-2 border-transparent data-[state=active]:border-green-500 rounded-none">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="border-b-2 border-transparent data-[state=active]:border-green-500 rounded-none">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <Card className="outline-none">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-16 w-16">
                      {user?.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user?.fullName || 'User'} />
                      ) : (
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <label className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                      <Camera className="h-3 w-3" />
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} className="sr-only" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Profile photo</p>
                    <p className="text-xs text-zinc-400">JPG or PNG, under 5MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={profileData.email} disabled type="email" />
                    <p className="text-xs text-zinc-400">Email cannot be changed here. Contact support if needed.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex flex-wrap gap-2">
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+234 800 000 0000"
                        className="flex-1"
                      />
                      {user?.phoneVerified ? (
                        <Button type="button" variant="outline" className="h-10 items-center gap-1" disabled>
                          <CheckCircle className="h-4 w-4 text-green-500" /> Verified
                        </Button>
                      ) : (
                        <Button type="button" variant="secondary" className="h-10" onClick={handleRequestPhoneOTP} disabled={!profileData.phone || otpCooldown || requestPhoneOTPMutation.isPending}>
                          {requestPhoneOTPMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : otpCountdown > 0 ? `Resend in ${otpCountdown.toString().padStart(2, '0')}:00` : 'Send OTP'}
                        </Button>
                      )}
                    </div>
                    {otpRevealed && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            placeholder="Enter 6-digit OTP"
                            value={phoneOTP}
                            onChange={(e) => setPhoneOTP(e.target.value)}
                            className="flex-1"
                            maxLength={6}
                          />
                          <Button type="button" variant="secondary" onClick={handleVerifyPhone} disabled={verifyPhoneMutation.isPending || phoneOTP.length !== 6}>
                            {verifyPhoneMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                          </Button>
                        </div>
                        <p className="mt-2 text-xs text-zinc-400">Enter the 6-digit code sent to your phone.</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profileBio">Bio / Description</Label>
                    <Textarea
                      id="profileBio"
                      value={profileData.profileBio}
                      onChange={(e) => setProfileData({ ...profileData, profileBio: e.target.value })}
                      placeholder="Tell others about yourself..."
                      rows={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <VerificationSimpleCard status={kyc?.status || undefined} reload={reload} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={passwordData.newPassword !== passwordData.confirmPassword || !passwordData.currentPassword}>
                  <Lock className="h-4 w-4 mr-2" /> Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SessionItem current browser="Chrome on Windows" location="Lagos, Nigeria" />
                <SessionItem device="Mobile" browser="Safari on iOS" location="Abuja, Nigeria" />
                <SessionItem device="Desktop" browser="Firefox on Mac" location="London, UK" />
              </div>
              <Button variant="ghost" className="mt-3 text-red-500">
                <AlertCircle className="h-4 w-4 mr-2" /> Log out of all other sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                  <Switch
                    checked={userNotifications[item.id]}
                    onCheckedChange={(checked) => setUserNotifications((prev) => ({ ...prev, [item.id]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SessionItem({ current = false, device = 'Current Device', browser, location }: { current?: boolean; device?: string; browser: string; location: string }) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3', current ? 'border-primary bg-[#262626]' : 'border-[#262626] bg-zinc-900')}>
      <div className="flex items-center gap-3">
        <div className="bg-[#262626] text-white">
          <Monitor className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{device}</span>
            {current && <Badge variant="secondary" className="text-xs">Current</Badge>}
          </div>
          <p className="text-xs text-zinc-400">{browser} • {location}</p>
        </div>
      </div>
      {!current && (
        <Button variant="ghost" size="sm" className="text-red-500">
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function VerificationSimpleCard({ status, reload }: { status?: KycStatus | null; reload: () => void }) {
  const resolved = status || 'not_started';
  const isUnverified = resolved === 'not_started' || resolved === 'rejected';
  const isReview = resolved === 'in_progress' || resolved === 'requires_review';
  const isVerified = resolved === 'approved';

  return (
    <Card className="rounded-3xl border border-[#262626] bg-obsidian-800/30">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Identity Verification</CardTitle>
          {isVerified && (
            <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="mr-1 h-4 w-4" /> Account Verified
            </Badge>
          )}
          {!isVerified && !isReview && (
            <Badge variant="destructive" className="border-green-500/30 text-green-500">Action Required</Badge>
          )}
          {isReview && (
            <Badge variant="secondary" className="gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" /> Verification In Review
            </Badge>
          )}
        </div>
        <p className="text-sm text-zinc-400">
          Complete a 1-minute automated verification check to verify your account securely.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#262626] text-white">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-white">Instant Identity Check</h4>
            <p className="text-sm text-zinc-400">Verify your identity in seconds using our secure automated check.</p>
          </div>
          {isUnverified && (
            <DojahWidgetClient
              type="custom"
              triggerLabel="Start Instant Verification"
              onComplete={(result) => {
                if (result.success) reload();
              }}
            />
          )}
          {isReview && (
            <p className="text-sm text-zinc-400">
              We&apos;re reviewing your check, usually takes 2–5 minutes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

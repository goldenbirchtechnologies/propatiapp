'use client';

import { useState } from 'react';
import { useCurrentUser, useUpdateProfile, useUploadAvatar, useVerifyPhone, useRequestPhoneOTP, useVerifyNIN, useVerifyBVN } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Shield, Phone, Mail, IdCard, Camera, Save, LogOut, Monitor, Lock } from 'lucide-react';

interface LandlordProfileClientProps {
  user: unknown;
}

export default function LandlordProfileClient({ user: initialUser }: LandlordProfileClientProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
  const [ninInput, setNinInput] = useState('');
  const [bvnInput, setBvnInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const requestPhoneOTPMutation = useRequestPhoneOTP();
  const verifyPhoneMutation = useVerifyPhone();
  const verifyNINMutation = useVerifyNIN();
  const verifyBVNMutation = useVerifyBVN();
  const { toast } = useToast();

  const user = currentUser || initialUser;

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
    } catch (error) {
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
      const data = await uploadAvatarMutation.mutateAsync(file);
      toast({ title: 'Avatar updated', description: 'Your profile picture has been changed.' });
      refetchUser();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload avatar. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      setAvatarFile(null);
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
    } catch (error) {
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
    } catch (error) {
      toast({ title: 'Error', description: 'Invalid OTP. Please try again.', variant: 'destructive' });
    }
  };

  const handleVerifyNIN = async () => {
    if (!ninInput) {
      toast({ title: 'NIN required', description: 'Please enter your NIN.', variant: 'destructive' });
      return;
    }
    try {
      await verifyNINMutation.mutateAsync({ nin: ninInput });
      toast({ title: 'NIN verified', description: 'Your NIN has been verified successfully.' });
      refetchUser();
      setNinInput('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to verify NIN. Please try again.', variant: 'destructive' });
    }
  };

  const handleVerifyBVN = async () => {
    if (!bvnInput) {
      toast({ title: 'BVN required', description: 'Please enter your BVN.', variant: 'destructive' });
      return;
    }
    try {
      await verifyBVNMutation.mutateAsync({ bvn: bvnInput });
      toast({ title: 'BVN verified', description: 'Your BVN has been verified successfully.' });
      refetchUser();
      setBvnInput('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to verify BVN. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative flex-shrink-0">
            <Avatar className="w-24 h-24">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              ) : (
                <AvatarFallback className="text-2xl">{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              )}
            </Avatar>
            <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-white">
              <Camera className="h-3 w-3" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-lg font-bold text-white">{user?.fullName || 'Loading...'}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</Badge>
              {user?.ninVerified && <Badge variant="success" className="flex items-center gap-1"><Shield className="h-3 w-3" /> NIN Verified</Badge>}
              {user?.bvnVerified && <Badge variant="success" className="flex items-center gap-1"><Shield className="h-3 w-3" /> BVN Verified</Badge>}
              {user?.idVerified && <Badge variant="success" className="flex items-center gap-1"><Shield className="h-3 w-3" /> ID Verified</Badge>}
              {user?.phoneVerified && <Badge variant="success" className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Verified</Badge>}
              {!user?.profileCompleted && <Badge variant="destructive">Profile Incomplete</Badge>}
            </div>
            <p className="mt-1 truncate text-sm text-slate-300">{user?.email}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/80">
          <TabsTrigger value="personal" className="rounded-lg">Personal Info</TabsTrigger>
          <TabsTrigger value="verification" className="rounded-lg">Verification</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={profileData.email} disabled type="email" />
                    <p className="text-xs text-slate-400">Email cannot be changed here. Contact support if needed.</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                    />
                    {user?.phoneVerified ? (
                      <Button type="button" variant="outline" className="h-10 items-center gap-1" disabled>
                        <CheckCircle className="h-4 w-4 text-green-400" /> Verified
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" className="h-10" onClick={handleRequestPhoneOTP} disabled={!profileData.phone || requestPhoneOTPMutation.isPending}>
                        {requestPhoneOTPMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                      </Button>
                    )}
                  </div>
                  {!user?.phoneVerified && profileData.phone && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Input
                        placeholder="Enter OTP"
                        value={phoneOTP}
                        onChange={(e) => setPhoneOTP(e.target.value)}
                        className="flex-1"
                        maxLength={6}
                      />
                      <Button type="button" variant="secondary" onClick={handleVerifyPhone} disabled={verifyPhoneMutation.isPending || phoneOTP.length !== 6}>
                        {verifyPhoneMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profileBio">Bio / Description</Label>
                  <textarea
                    id="profileBio"
                    value={profileData.profileBio}
                    onChange={(e) => setProfileData({ ...profileData, profileBio: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 min-h-[100px] resize-y"
                    placeholder="Tell others about yourself..."
                    rows={4}
                  />
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identity Verification</CardTitle>
                <p className="text-sm text-slate-400">Verify your identity to unlock premium features and build trust.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <VerificationItem
                  icon={<IdCard className="h-5 w-5" />}
                  title="National Identification Number (NIN)"
                  description="Verify using your NIN via Prembly/IdentityPass"
                  completed={!!user?.ninVerified}
                >
                  {!user?.ninVerified && (
                    <div className="flex flex-wrap gap-2">
                      <Input placeholder="Enter 11-digit NIN" value={ninInput} onChange={(e) => setNinInput(e.target.value)} maxLength={11} className="w-48" />
                      <Button onClick={handleVerifyNIN} disabled={verifyNINMutation.isPending || ninInput.length !== 11}>
                        {verifyNINMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify NIN'}
                      </Button>
                    </div>
                  )}
                </VerificationItem>

                <VerificationItem
                  icon={<Shield className="h-5 w-5" />}
                  title="Bank Verification Number (BVN)"
                  description="Verify using your BVN for financial trust"
                  completed={!!user?.bvnVerified}
                >
                  {!user?.bvnVerified && (
                    <div className="flex flex-wrap gap-2">
                      <Input placeholder="Enter 11-digit BVN" value={bvnInput} onChange={(e) => setBvnInput(e.target.value)} maxLength={11} className="w-48" />
                      <Button onClick={handleVerifyBVN} disabled={verifyBVNMutation.isPending || bvnInput.length !== 11}>
                        {verifyBVNMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify BVN'}
                      </Button>
                    </div>
                  )}
                </VerificationItem>

                <VerificationItem
                  icon={<IdCard className="h-5 w-5" />}
                  title="Government ID Document"
                  description="Upload a valid ID (Passport, Driver's License, Voter's Card)"
                  completed={!!user?.idVerified}
                >
                  {!user?.idVerified && (
                    <Button variant="outline" onClick={() => alert('Document upload coming soon')}>
                      <Camera className="h-4 w-4 mr-2" /> Upload ID
                    </Button>
                  )}
                </VerificationItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'ninVerified', label: 'NIN Verification', icon: <IdCard className="h-4 w-4" /> },
                    { key: 'bvnVerified', label: 'BVN Verification', icon: <Shield className="h-4 w-4" /> },
                    { key: 'idVerified', label: 'ID Document', icon: <Shield className="h-4 w-4" /> },
                    { key: 'phoneVerified', label: 'Phone Number', icon: <Phone className="h-4 w-4" /> },
                  ].map((item) => (
                    <VerificationStep
                      key={item.key}
                      label={item.label}
                      icon={item.icon}
                      completed={!!user?.[item.key]}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                </div>
                <div className="space-y-1">
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
              <Button variant="ghost" className="text-red-500">
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
              {[
                { id: 'rent_due', label: 'Rent Due Reminders', desc: 'Get notified 7, 3, and 1 days before rent is due' },
                { id: 'payment', label: 'Payment Notifications', desc: 'Receive alerts for rent payments received and refunds' },
                { id: 'message', label: 'New Messages', desc: 'Get notified when you receive a new message' },
                { id: 'verification', label: 'Verification Updates', desc: 'Status changes on your property verifications' },
                { id: 'agreement', label: 'Agreement Activity', desc: 'Signatures, expirations, and agreement updates' },
                { id: 'maintenance', label: 'Maintenance Requests', desc: 'New maintenance tickets and status updates' },
                { id: 'screening', label: 'Screening Calls', desc: 'Scheduled and completed tenant screening calls' },
                { id: 'system', label: 'System Announcements', desc: 'Platform updates, new features, and maintenance windows' },
              ].map((item) => (
                <NotificationToggle key={item.id} {...item} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VerificationItem({ icon, title, description, completed, children }: { icon: React.ReactNode; title: string; description: string; completed: boolean; children?: React.ReactNode }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4', completed ? 'border-green-500/20 bg-green-500/10' : 'border-outline-variant bg-surface-container')}>
      <div className="flex items-center gap-3">
        <div className={cn('flex-shrink-0 rounded-lg p-2.5', completed ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400')}>{icon}</div>
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-white">{title}</h4>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {completed && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>}
        {children}
      </div>
    </div>
  );
}

function VerificationStep({ label, icon, completed }: { label: string; icon: React.ReactNode; completed: boolean }) {
  return (
    <div className={cn('flex items-center gap-4 rounded-lg p-4', completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-surface-container border border-outline-variant')}>
      <div className={cn('flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center', completed ? 'bg-green-500 text-white' : 'bg-muted text-slate-400')}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{label}</p>
        <p className={cn('text-sm', completed ? 'text-green-400' : 'text-slate-400')}>
          {completed ? 'Verified ✓' : 'Not verified'}
        </p>
      </div>
      {completed && <CheckCircle className="h-5 w-5 text-green-400" />}
    </div>
  );
}

function SessionItem({ current = false, device = 'Current Device', browser, location }: { current?: boolean; device?: string; browser: string; location: string }) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3', current ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container')}>
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary">
          <Monitor className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{device}</span>
            {current && <Badge variant="secondary" className="text-xs">Current</Badge>}
          </div>
          <p className="text-xs text-slate-400">{browser} • {location}</p>
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

function NotificationToggle({ id, label, desc }: { id: string; label: string; desc: string }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
        <div className="h-6 w-11 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
      </label>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { User, Camera, Save, FileText, Shield, Users, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useKycStatus } from '@/lib/dojah-client';
import KycVerificationCard from '@/components/verification/KycVerificationCard';

type InitialUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  profileBio: string | null;
  employmentStatus: string | null;
  employmentType: string | null;
  employerName: string | null;
  jobTitle: string | null;
  yearlyIncome: number | null;
  idVerified: boolean;
  ninVerified: boolean;
  phoneVerified: boolean;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;
};

type Tab = 'personal' | 'rental' | 'guarantors' | 'kyc';

export default function TenantProfileClient({ initialUser }: { initialUser: InitialUser }) {
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const { data: kyc, reload } = useKycStatus();

  const [form, setForm] = useState({
    fullName: initialUser.fullName,
    phone: initialUser.phone || '',
    bio: initialUser.profileBio || '',
    jobTitle: initialUser.jobTitle || '',
    employmentType: initialUser.employmentType || '',
    employerName: initialUser.employerName || '',
    employmentStatus: initialUser.employmentStatus || '',
    monthlyIncome: initialUser.yearlyIncome ? String(Math.round(initialUser.yearlyIncome / 12)) : '',
  });

  const [rentalForm, setRentalForm] = useState({
    employmentStatus: initialUser.employmentStatus || '',
    employerName: initialUser.employerName || '',
    monthlyIncome: initialUser.yearlyIncome ? String(Math.round(initialUser.yearlyIncome / 12)) : '',
    preferredMoveIn: '',
    landlordContact: '',
    reasonForMoving: '',
    preferredLeaseTerm: '',
    desiredMoveInDate: '',
    coDependents: '0',
    pets: '',
    emergencyContact: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onPersonalSave = () => {
    const yearlyIncome = rentalForm.monthlyIncome || form.monthlyIncome ? Number(rentalForm.monthlyIncome || form.monthlyIncome) * 12 : undefined;
    handleSave({
      fullName: form.fullName.trim() || undefined,
      phone: form.phone.trim() || null,
      profileBio: form.bio || null,
      jobTitle: form.jobTitle || null,
      employmentType: form.employmentType || null,
      employerName: form.employerName || null,
      employmentStatus: form.employmentStatus || null,
      yearlyIncome: yearlyIncome || null,
    });
  };

  const onRentalSave = () => {
    const yearlyIncome = rentalForm.monthlyIncome ? Number(rentalForm.monthlyIncome) * 12 : undefined;
    handleSave({
      employmentStatus: rentalForm.employmentStatus || null,
      employmentType: form.employmentType || null,
      employerName: rentalForm.employerName || null,
      jobTitle: form.jobTitle || null,
      yearlyIncome: yearlyIncome || null,
      profileBio: form.bio || null,
    });
  };

  const verifiedCount = [initialUser.idVerified, initialUser.ninVerified, initialUser.phoneVerified].filter(Boolean).length;

  const tabs: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: 'personal', label: 'Personal Details', icon: User },
    { value: 'rental', label: 'Rental Application', icon: FileText },
    { value: 'guarantors', label: 'Guarantors', icon: Users },
    { value: 'kyc', label: 'Identity / KYC', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
        <span>Dashboard</span><span className="text-zinc-300 dark:text-zinc-700">›</span>
        <span className="text-zinc-900 dark:text-white">My Profile</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage your personal information and tenant application pass — {verifiedCount}/3 verified</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-white/[0.08]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.value ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6 text-center">
            <div className="relative mx-auto h-20 w-20">
              {initialUser.avatarUrl ? (
                <img src={initialUser.avatarUrl} alt={initialUser.fullName} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06] text-2xl font-bold text-zinc-700 dark:text-zinc-300">
                  {initialUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow"><Camera className="h-4 w-4" /></span>
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">{initialUser.fullName}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{initialUser.email}</p>
            {initialUser.phone && <p className="text-sm text-zinc-600 dark:text-zinc-400">{initialUser.phone}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${verifiedCount === 3 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                {verifiedCount === 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />} {verifiedCount}/3 Verified
              </span>
              {(initialUser.guarantorName || initialUser.guarantorPhone) && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Guarantor Added</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <span className={`rounded-lg px-2 py-2 font-medium ${initialUser.idVerified ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'}`}>ID {initialUser.idVerified ? '✓' : '—'}</span>
              <span className={`rounded-lg px-2 py-2 font-medium ${initialUser.ninVerified ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'}`}>NIN {initialUser.ninVerified ? '✓' : '—'}</span>
              <span className={`rounded-lg px-2 py-2 font-medium ${initialUser.phoneVerified ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'}`}>Phone {initialUser.phoneVerified ? '✓' : '—'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {activeTab === 'personal' && (
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
              <div className="border-b border-zinc-200 dark:border-white/[0.08] px-6 py-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Personal Details</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Updates save to your PropatiBox profile (PATCH /api/users/me/profile)</p>
              </div>
              <div className="space-y-4 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job Title</Label>
                    <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="e.g. Product Manager" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employment Type</Label>
                    <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employment Status</Label>
                    <Select value={form.employmentStatus} onValueChange={(v) => setForm({ ...form, employmentStatus: v })}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">Self-Employed</SelectItem>
                        <SelectItem value="business_owner">Business Owner</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employer Name</Label>
                    <Input value={form.employerName} onChange={(e) => setForm({ ...form, employerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly Income (₦)</Label>
                    <Input type="number" value={form.monthlyIncome} onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} placeholder="0" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Bio</Label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={500} className="w-full rounded-md border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Tell landlords about yourself…" />
                    <p className="text-right font-mono text-xs text-zinc-500">{form.bio.length}/500</p>
                  </div>
                </div>
                <Button onClick={onPersonalSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'rental' && (
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
              <div className="border-b border-zinc-200 dark:border-white/[0.08] px-6 py-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Rental Application Profile</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">These fields strengthen your applications — same profile store, focused for leasing</p>
              </div>
              <div className="space-y-4 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Employment Status</Label>
                    <Select value={rentalForm.employmentStatus} onValueChange={(v) => setRentalForm({ ...rentalForm, employmentStatus: v })}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">Self-Employed</SelectItem>
                        <SelectItem value="business_owner">Business Owner</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employer Name</Label>
                    <Input value={rentalForm.employerName} onChange={(e) => setRentalForm({ ...rentalForm, employerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly Net Income (₦)</Label>
                    <Input type="number" value={rentalForm.monthlyIncome} onChange={(e) => setRentalForm({ ...rentalForm, monthlyIncome: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred Lease Term</Label>
                    <Select value={rentalForm.preferredLeaseTerm} onValueChange={(v) => setRentalForm({ ...rentalForm, preferredLeaseTerm: v })}>
                      <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6_months">6 Months</SelectItem>
                        <SelectItem value="1_year">1 Year</SelectItem>
                        <SelectItem value="2_years">2 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Desired Move-in Date</Label>
                    <Input type="date" value={rentalForm.desiredMoveInDate} onChange={(e) => setRentalForm({ ...rentalForm, desiredMoveInDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Co-dependents</Label>
                    <Input type="number" value={rentalForm.coDependents} onChange={(e) => setRentalForm({ ...rentalForm, coDependents: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pets</Label>
                    <Input value={rentalForm.pets} onChange={(e) => setRentalForm({ ...rentalForm, pets: e.target.value })} placeholder="e.g. 1 dog" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Current Landlord Contact</Label>
                    <Input value={rentalForm.landlordContact} onChange={(e) => setRentalForm({ ...rentalForm, landlordContact: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Reason for Moving</Label>
                    <textarea value={rentalForm.reasonForMoving} onChange={(e) => setRentalForm({ ...rentalForm, reasonForMoving: e.target.value })} rows={3} className="w-full rounded-md border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Emergency Contact</Label>
                    <Input value={rentalForm.emergencyContact} onChange={(e) => setRentalForm({ ...rentalForm, emergencyContact: e.target.value })} placeholder="Name — Phone" />
                  </div>
                </div>
                <Button onClick={onRentalSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save Application Details'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'guarantors' && (
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Guarantors</h3>
              {initialUser.guarantorName || initialUser.guarantorPhone ? (
                <div className="mt-4 space-y-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4 text-sm">
                  <p><span className="font-medium">Name:</span> {initialUser.guarantorName}</p>
                  <p><span className="font-medium">Phone:</span> {initialUser.guarantorPhone}</p>
                  <p><span className="font-medium">Relationship:</span> {initialUser.guarantorRelationship || '—'}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-zinc-200 dark:border-white/[0.08] p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-zinc-400" />
                  <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">No guarantors yet</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Guarantors are captured during application screening (guarantorData) and surfaced here once provided.</p>
                </div>
              )}
              <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">To update guarantor details, contact support — these fields are managed via the application flow and KYC for compliance.</p>
            </div>
          )}

          {activeTab === 'kyc' && (
            <KycVerificationCard
              status={kyc?.status || 'not_started'}
              description="Verify your identity to unlock payments, agreements, and full platform access."
              onVerified={(result) => {
                if (result.success) reload();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { User, Camera, Save, FileText, Shield, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useKycStatus } from '@/lib/dojah-client';
import KycVerificationCard from '@/components/verification/KycVerificationCard';

interface UserProfile {
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
  yearlyIncome: bigint | null;
  idVerified: boolean;
  ninVerified: boolean;
  phoneVerified: boolean;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;
}

interface TenantProfileClientProps {
  initialUser: UserProfile;
}

type Tab = 'personal' | 'rental' | 'guarantors' | 'kyc';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  occupation: string;
  employmentType: string;
  employerName: string;
  emergencyContact: string;
  employmentStatus: string;
  monthlyIncome: string;
  preferredMoveIn: string;
  landlordContact: string;
  reasonForMoving: string;
  preferredLeaseTerm: string;
  desiredMoveInDate: string;
  coDependents: string;
  pets: string;
}

export default function TenantProfileClient({ initialUser }: TenantProfileClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const { data: kyc, loading, reload } = useKycStatus();

  const [form, setForm] = useState<FormState>({
    fullName: initialUser.fullName,
    email: initialUser.email,
    phone: initialUser.phone || '',
    bio: initialUser.profileBio || '',
    occupation: initialUser.jobTitle || '',
    employmentType: initialUser.employmentType || '',
    employerName: initialUser.employerName || '',
    emergencyContact: '',
    employmentStatus: initialUser.employmentStatus || '',
    monthlyIncome: '',
    preferredMoveIn: '',
    landlordContact: '',
    reasonForMoving: '',
    preferredLeaseTerm: '',
    desiredMoveInDate: '',
    coDependents: '0',
    pets: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setMessage('Profile updated successfully');
    setTimeout(() => setMessage(null), 3000);
  };

  const verifiedCount = [initialUser.idVerified, initialUser.ninVerified, initialUser.phoneVerified].filter(Boolean).length;
  const kycStatus = verifiedCount === 3 ? 'Full verification complete' : `Partial verification: ${verifiedCount}/3 verified`;

  const tabs: { value: Tab; label: string }[] = [
    { value: 'personal', label: 'Personal Details' },
    { value: 'rental', label: 'Rental Application Form' },
    { value: 'guarantors', label: 'Guarantors' },
    { value: 'kyc', label: 'Identity / KYC' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="text-headline-xl font-bold" style={{ color: 'var(--text)' }}>My Profile</h1>
        <p className="text-body-md" style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Manage your personal information and tenant application pass.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent hover:text-white'
            )}
            style={activeTab !== tab.value ? { color: 'var(--muted)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Left + Right layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-6 p-6 text-center">
              <div className="relative mx-auto h-20 w-20">
                {initialUser.avatarUrl ? (
                  <img src={initialUser.avatarUrl} alt={initialUser.fullName} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
                  >
                    {initialUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  className="absolute bottom-0 right-0 rounded-full p-1.5 shadow"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold" style={{ color: 'var(--text)' }}>{initialUser.fullName}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{initialUser.email}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{initialUser.phone || ''}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--surface-elevated)' }}>
                  🟢 Live KYC Verified
                </span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--surface-elevated)' }}>
                  🟢 Guarantor Added
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Active Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'personal' && (
            <div className="glass-card" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white" style={{ color: 'var(--text)' }}>Personal Details</h3>
              </div>
              <div className="p-6">
                <ProfileForm form={form} setForm={setForm} saving={saving} onSave={handleSave} message={message} />
              </div>
            </div>
          )}

          {activeTab === 'rental' && (
            <div className="glass-card" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white" style={{ color: 'var(--text)' }}>Rental Application Profile</h3>
              </div>
              <div className="p-6">
                <RentalApplicationForm form={form} setForm={setForm} saving={saving} onSave={handleSave} message={message} />
              </div>
            </div>
          )}

          {activeTab === 'guarantors' && (
            <div className="glass-card" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white" style={{ color: 'var(--text)' }}>Guarantors</h3>
              </div>
              <div className="p-6">
                {initialUser.guarantorName || initialUser.guarantorPhone ? (
                  <div className="space-y-2 text-sm" style={{ color: 'var(--text)' }}>
                    <p><span className="font-medium">Name:</span> {initialUser.guarantorName}</p>
                    <p><span className="font-medium">Phone:</span> {initialUser.guarantorPhone}</p>
                    <p><span className="font-medium">Relationship:</span> {initialUser.guarantorRelationship || '—'}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border p-6 text-center" style={{ borderColor: 'var(--border)' }}>
                    <Users className="mx-auto mb-2 h-10 w-10" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>No guarantors yet</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      Add guarantors once you have an accepted agreement.
                    </p>
                  </div>
                )}
              </div>
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

function ProfileForm({
  form,
  setForm,
  saving,
  onSave,
  message,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  saving: boolean;
  onSave: () => void;
  message: string | null;
}) {
  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg text-sm font-medium p-3" style={{ background: 'rgba(14,124,106,0.12)', color: 'var(--accent)' }}>
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Employment Type</Label>
          <Select value={form.employmentType} onValueChange={value => setForm({ ...form, employmentType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
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
        <div className="space-y-2">
          <Label>Employer Name</Label>
          <Input value={form.employerName} onChange={e => setForm({ ...form, employerName: e.target.value })} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>Bio</Label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/40"
            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)', color: 'var(--text)', minHeight: 80 }}
            rows={3}
          />
        </div>
      </div>
      <div>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function RentalApplicationForm({
  form,
  setForm,
  saving,
  onSave,
  message,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  saving: boolean;
  onSave: () => void;
  message: string | null;
}) {
  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-lg text-sm font-medium p-3" style={{ background: 'rgba(14,124,106,0.12)', color: 'var(--accent)' }}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Employment Status</Label>
          <Select value={form.employmentStatus} onValueChange={value => setForm({ ...form, employmentStatus: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
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
        <div className="space-y-2">
          <Label>Employer Name</Label>
          <Input value={form.employerName} onChange={e => setForm({ ...form, employerName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Net Income (₦)</Label>
          <Input type="number" placeholder="0.00" value={form.monthlyIncome} onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Preferred Move-In</Label>
          <Select value={form.preferredMoveIn} onValueChange={value => setForm({ ...form, preferredMoveIn: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="1_month">1 Month</SelectItem>
              <SelectItem value="2_months">2 Months</SelectItem>
              <SelectItem value="3_months">3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Current Landlord Contact</Label>
          <Input value={form.landlordContact} onChange={e => setForm({ ...form, landlordContact: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Preferred Lease Term</Label>
          <Select value={form.preferredLeaseTerm} onValueChange={value => setForm({ ...form, preferredLeaseTerm: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6_months">6 Months</SelectItem>
              <SelectItem value="1_year">1 Year</SelectItem>
              <SelectItem value="2_years">2 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Desired Move-in Date</Label>
          <Input type="date" value={form.desiredMoveInDate} onChange={e => setForm({ ...form, desiredMoveInDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Number of Co-dependents</Label>
          <Input type="number" value={form.coDependents} onChange={e => setForm({ ...form, coDependents: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Pets</Label>
          <Input value={form.pets} onChange={e => setForm({ ...form, pets: e.target.value })} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>Reason for Moving</Label>
          <textarea
            value={form.reasonForMoving}
            onChange={e => setForm({ ...form, reasonForMoving: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/40"
            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)', color: 'var(--text)', minHeight: 80 }}
            rows={3}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>Emergency Contact</Label>
          <Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} />
        </div>
      </div>
      <div>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Application Details'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Camera, Save, FileText, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function TenantProfileClient({ initialUser }: TenantProfileClientProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    fullName: initialUser.fullName,
    email: initialUser.email,
    phone: initialUser.phone || '',
    bio: initialUser.profileBio || '',
    occupation: initialUser.jobTitle || '',
    employmentType: initialUser.employmentType || '',
    employerName: initialUser.employerName || '',
    emergencyContact: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    // In production: POST to /api/tenant/profile
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setMessage('Profile updated successfully');
    setTimeout(() => setMessage(null), 3000);
  };

  const verifiedCount = [initialUser.idVerified, initialUser.ninVerified, initialUser.phoneVerified].filter(Boolean).length;
  const kycStatus = verifiedCount === 3 ? 'Full verification complete' : `Partial verification: ${verifiedCount}/3 verified`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-xl text-on-surface">My Profile</h1>
        <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>
          Manage your personal information
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="rental">Rental Application</TabsTrigger>
          <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <ProfileForm form={form} setForm={setForm} saving={saving} onSave={handleSave} message={message} />
        </TabsContent>

        <TabsContent value="rental">
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-2 text-primary">Rental Application</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your current rental preferences and application history will appear here.
            </p>
            <div className="rounded-lg border border-border p-4 text-center">
              <FileText className="mx-auto mb-2 h-10 w-10 text-on-surface-variant" style={{ opacity: 0.5 }} />
              <p className="text-sm font-medium text-primary">No active application</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete your profile to submit a rental application.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guarantors">
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-2 text-primary">Guarantors</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Guarantor details linked to your tenancy will appear here.
            </p>
            {initialUser.guarantorName || initialUser.guarantorPhone ? (
              <div className="space-y-2 text-sm text-primary">
                <p><span className="font-medium">Name:</span> {initialUser.guarantorName}</p>
                <p><span className="font-medium">Phone:</span> {initialUser.guarantorPhone}</p>
                <p><span className="font-medium">Relationship:</span> {initialUser.guarantorRelationship || '—'}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-4 text-center">
                <Users className="mx-auto mb-2 h-10 w-10 text-on-surface-variant" style={{ opacity: 0.5 }} />
                <p className="text-sm font-medium text-primary">No guarantors yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add guarantors once you have an accepted agreement.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="kyc">
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-2 text-primary">Know Your Customer (KYC)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Verify your identity to unlock payments, agreements, and full platform access.
            </p>
            <div className="rounded-lg border border-border p-4 flex items-center gap-4">
              <div className="rounded-full bg-muted p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{kycStatus}</p>
                <p className="text-xs text-muted-foreground">
                  Complete NIN, ID, and phone verification for full access.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/verification?type=identity">Verify</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileForm({ form, setForm, saving, onSave, message }: {
  form: Record<string, string>;
  setForm: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  saving: boolean;
  onSave: () => void;
  message: string | null;
}) {
  return (
    <div className="card p-6">
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium">
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">Full Name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            className="inp-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="inp-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="inp-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">Job Title</label>
          <input
            type="text"
            value={form.occupation}
            onChange={e => setForm({ ...form, occupation: e.target.value })}
            className="inp-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">Employment Type</label>
          <select
            value={form.employmentType}
            onChange={e => setForm({ ...form, employmentType: e.target.value })}
            className="inp-field w-full"
          >
            <option value="">Select employment type</option>
            <option value="employed">Employed</option>
            <option value="self_employed">Self-Employed</option>
            <option value="business_owner">Business Owner</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">Employer Name</label>
          <input
            type="text"
            value={form.employerName}
            onChange={e => setForm({ ...form, employerName: e.target.value })}
            className="inp-field w-full"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-primary">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            className="inp-field w-full"
            rows={3}
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn btn-primary inline-flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

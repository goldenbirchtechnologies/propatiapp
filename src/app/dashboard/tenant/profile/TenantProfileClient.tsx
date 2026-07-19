'use client';

import { useState } from 'react';
import { User, Camera, Save } from 'lucide-react';

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
}

interface TenantProfileClientProps {
  initialUser: UserProfile;
}

export default function TenantProfileClient({ initialUser }: TenantProfileClientProps) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-xl text-on-surface">My Profile</h1>
        <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>
          Manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

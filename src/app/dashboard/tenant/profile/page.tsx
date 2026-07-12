'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { User, Camera, Save } from 'lucide-react';

export default function TenantProfilePage() {
  const [form, setForm] = useState({ fullName: 'John Doe', email: 'john@example.com', phone: '0803 456 7890', bio: 'Looking for a serene home.', occupation: 'Engineer', emergencyContact: '0806 123 4567' });

  return (
    <DashboardShell navigation={TENANT_NAVIGATION} userRole="tenant" userName={form.fullName} userAvatar={undefined}>
      <div className="space-y-6">
        <div>
          <h1 className="text-headline-sm" className="text-primary" style={{ fontSize: 'var(--text-page-title)' }}>My Profile</h1>
          <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Full Name</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Occupation</label>
                <input type="text" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="inp-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-primary">Emergency Contact</label>
                <input type="tel" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="inp-field w-full" />
              </div>
              <div className=" md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-primary">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="inp-field w-full" rows={3} />
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full flex items-center justify-center" className="bg-primary/10 text-primary">
                <User className="w-10 h-10" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full border border-border bg-surface-container-lowest border-outline-variant">
                <Camera className="w-4 h-4 text-primary" />
              </button>
            </div>
            <p className="mt-4 font-medium text-primary">{form.fullName}</p>
            <p className="text-xs text-on-surface-variant">Tenant since 2026</p>
            <button className="btn btn-primary mt-4 w-full inline-flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
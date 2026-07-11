'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { User, Camera, Save } from 'lucide-react';

export default function AdminProfileClient({ user }: { user: any }) {
  const [form, setForm] = useState({
    fullName: user.fullName || 'Admin User',
    email: user.email || 'admin@propati.ng',
    phone: user.phone || '+234 812 345 6789',
    role: user.role,
  });

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={form.fullName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Manage your administrative account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="inp-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="inp-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="inp-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  disabled
                  className="inp-field w-full opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              >
                <User className="w-10 h-10" />
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 rounded-full border border-border bg-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <Camera className="w-4 h-4" style={{ color: 'var(--text)' }} />
              </button>
            </div>
            <p className="mt-4 font-medium" style={{ color: 'var(--text)' }}>
              {form.fullName}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Admin since 2024
            </p>
            <button className="btn btn-primary mt-4 w-full inline-flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

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
          <h1 className="font-headline-sm text-primary mb-1">My Profile</h1>
          <p className="text-on-surface-variant">Manage your administrative account settings</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-shell p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1 block">My Profile</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="inp-field w-full"
                />
                <p className="text-xs text-on-surface-variant mt-1">Display name used across admin actions.</p>
              </div>
              <div>
                <label className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="inp-field w-full"
                />
              </div>
              <div>
                <label className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="inp-field w-full"
                />
                <p className="text-xs text-on-surface-variant mt-1">Used for admin alerts and audit logs.</p>
              </div>
              <div>
                <label className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="inp-field w-full"
                />
                <p className="text-xs text-on-surface-variant mt-1">Prefer +234 country format for SMS verifications.</p>
              </div>
              <div>
                <label className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1 block">Platform Role</label>
                <input
                  type="text"
                  value={form.role}
                  disabled
                  className="inp-field w-full opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-on-surface-variant mt-1">Contact super admin to change platform role.</p>
              </div>
              <div>
                <label className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1 block">Account Status</label>
                <input
                  type="text"
                  value="Active"
                  disabled
                  className="inp-field w-full opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-on-surface-variant mt-1">Locked status blocks dashboard access until cleared.</p>
              </div>
            </div>
          </div>

          <div className="card-shell p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full flex items-center justify-center bg-primary text-on-primary">
                <User className="w-10 h-10" />
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 rounded-full border border-outline-variant bg-surface-container-lowest"
              >
                <Camera className="w-4 h-4 text-primary" />
              </button>
            </div>
            <p className="mt-4 font-medium text-primary">{form.fullName}</p>
            <p className="text-xs text-on-surface-variant">Admin since 2024</p>
            <button className="btn btn-primary mt-4 w-full inline-flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

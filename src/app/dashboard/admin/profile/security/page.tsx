'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function AdminProfileSecurityPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from admin_profile_security_settings_propati_admin.html */}

      <div className="p-margin-desktop space-y-gutter max-w-7xl mx-auto">
        {/* Section 1: Profile Overview (Bento Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-lg">
          {/* Profile Card */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-outline-variant flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl"></div>
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  data-alt="Professional studio portrait of an administrative executive, Ade Ben-G., featuring confident posture and soft, professional lighting."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzJdCgsEd4j5tDEETrQKsocY3MM4zLUViPHSRUcTC1IUaeWjw8Mm_YbIJDsxI1ZFAEaoQMqHGVr-cWWge0xIvK31upjouaqv5FnH41z7wJdmBmJiwL5FqDeLU3Y211YD7w4XUccHMf9cPmuD6oygHKup0SpKDCsMPJe19wrH0dHrQz0GTv0YwK_Ohg3lJ_aDzAuBCcjDldSud1hC1kLuBCQycV8bSdEIXQcoSBwzXx-6g6SvLwLDhAvCkaj_-WJjhiBLz7BdzDi90"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h3 className="font-headline-lg text-headline-lg text-primary">Ade Ben-G.</h3>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-label-md text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified
                </span>
                <span className="px-3 py-1 rounded-full bg-primary-container text-white font-label-md text-[10px]">Super Admin</span>
              </div>
              <p className="text-on-surface-variant text-body-md max-w-lg">
                Overseeing regional operations and high-value asset verification across West Africa. Active member since January 2023.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-body-sm hover:translate-y-[-2px] transition-all shadow-md">
                  Edit Profile
                </button>
                <button className="px-6 py-2.5 border border-primary text-primary rounded-xl font-medium text-body-sm hover:bg-primary-container hover:text-white transition-all">
                  Download Bio
                </button>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="lg:col-span-4 bg-primary-container text-white rounded-xl p-lg shadow-lg flex flex-col justify-between overflow-hidden relative">
            <div className="z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-headline-sm text-headline-sm text-secondary-fixed">Account Security</h4>
                <span className="material-symbols-outlined text-secondary-container">shield_with_heart</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-on-primary-container/30">
                  <span className="text-on-primary-container font-label-md text-label-md">Status</span>
                  <span className="text-emerald-400 font-bold">Optimal</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-on-primary-container/30">
                  <span className="text-on-primary-container font-label-md text-label-md">Last Login</span>
                  <span className="font-label-md text-label-md">24m ago</span>
                </div>
              </div>
            </div>
            <div className="z-10 mt-6">
              <p className="text-xs text-on-primary-container mb-4">Your security level is at 94%. Enabling Biometric login will reach 100%.</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container w-[94%]"></div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <span className="material-symbols-outlined text-[160px]">lock</span>
            </div>
          </div>
        </div>

        {/* Section 2 & 3: Forms & Security (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-lg">
          {/* Personal Information */}
          <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-outline-variant">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-primary">Personal Information</h4>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-label-md font-mono text-on-surface-variant mb-2">FULL NAME</label>
                  <input
                    className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all text-body-md outline-none"
                    type="text"
                    defaultValue="Ade Ben-G."
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-label-md font-mono text-on-surface-variant mb-2">EMAIL ADDRESS</label>
                  <input
                    className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all text-body-md outline-none"
                    type="email"
                    defaultValue="ade.b@propati.ng"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-label-md font-mono text-on-surface-variant mb-2">PHONE NUMBER</label>
                  <input
                    className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all text-body-md outline-none"
                    type="tel"
                    defaultValue="+234 812 345 6789"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-label-md font-mono text-on-surface-variant mb-2">OFFICE LOCATION</label>
                  <select className="w-full h-11 px-4 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-all text-body-md outline-none bg-white">
                    <option>Lagos HQ, Victoria Island</option>
                    <option>Abuja Hub, Garki</option>
                    <option>Port Harcourt Branch</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md active:scale-95" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security & Authentication */}
          <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-outline-variant flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-primary">Security & Authentication</h4>
            </div>
            <div className="space-y-6 flex-1">
              {/* Password Management */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">lock_reset</span>
                  <div>
                    <p className="font-bold text-primary text-body-md">Password Management</p>
                    <p className="text-xs text-on-surface-variant">Last changed 2 days ago</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Change
                </button>
              </div>

              {/* MFA Setup */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary-container">smartphone</span>
                  <div>
                    <p className="font-bold text-primary text-body-md">Multi-Factor Authentication</p>
                    <p className="text-xs text-on-surface-variant">Authenticator app enabled</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary-container font-label-sm text-xs font-bold border border-secondary-container/30">
                  ENABLED
                </span>
              </div>

              {/* Active Sessions */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">devices</span>
                  <div>
                    <p className="font-bold text-primary text-body-md">Active Sessions</p>
                    <p className="text-xs text-on-surface-variant">3 sessions across 2 devices</p>
                  </div>
                </div>
                <button className="text-error font-bold text-label-sm px-4 py-2 hover:bg-error/5 rounded-lg transition-colors">
                  Revoke All
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Section 4: Security Audit Log (Personal) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-outline-variant">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">history_edu</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary">Security Audit Log</h4>
          </div>
          <div className="space-y-6 relative before:content-[''] before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            <div className="relative pl-10">
              <div className="absolute left-2.5 top-1 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm"></div>
              <p className="font-bold text-body-sm text-primary">Password changed successfully</p>
              <p className="text-xs text-on-surface-variant">2 days ago • IP: 102.89.23.41</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-2.5 top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
              <p className="font-bold text-body-sm text-primary">2FA verified at 09:41 AM</p>
              <p className="text-xs text-on-surface-variant">Today • iPhone 15 Pro</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-2.5 top-1 w-3 h-3 bg-secondary-container rounded-full border-2 border-white shadow-sm"></div>
              <p className="font-bold text-body-sm text-primary">New device login detected</p>
              <p className="text-xs text-on-surface-variant">Yesterday • Lagos, Nigeria</p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-2.5 top-1 w-3 h-3 bg-outline-variant rounded-full border-2 border-white shadow-sm"></div>
              <p className="font-bold text-body-sm text-primary">Recovery codes viewed</p>
              <p className="text-xs text-on-surface-variant">Oct 12, 2023 • MacBook Pro</p>
            </div>
          </div>
          <button className="w-full mt-8 py-3 border border-outline-variant rounded-xl text-label-sm font-bold text-primary hover:bg-surface-container-low transition-all">
            View Full Security Log
          </button>
        </div>

        {/* Sticky footer for mobile actions */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-outline-variant flex gap-3 z-50">
          <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg">Save All Changes</button>
          <button className="w-14 h-14 bg-surface-container-high text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

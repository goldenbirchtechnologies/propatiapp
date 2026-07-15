'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function SettingsDashboardPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from system_settings_dashboard_propati_admin.html */}

      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-xl min-h-screen">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">System Settings</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage platform-wide configurations, security, and integrations.
            </p>
          </div>
          <div className="flex gap-md">
            <button className="px-lg py-md rounded-lg border border-primary text-primary font-label-md hover:bg-surface-container transition-all">
              Discard
            </button>
            <button className="px-xl py-md rounded-lg bg-primary text-on-primary font-label-md shadow-sm hover:shadow-md transition-all">
              Save Changes
            </button>
          </div>
        </section>

        {/* Dashboard Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mb-xl">
          {/* General Configuration */}
          <div className="lg:col-span-4 glass-card p-lg rounded-xl flex flex-col gap-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary"><MaterialIcon name=tune className="material-symbols-outlined" />
              <h3 className="font-headline-sm text-headline-sm">General Configuration</h3>
            </div>
            <div className="space-y-md">
              <div className="group">
                <label className="font-label-sm text-on-surface-variant block mb-xs">Platform Name</label>
                <input
                  className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  type="text"
                  defaultValue="PROPATI"
                />
              </div>
              <div className="group">
                <label className="font-label-sm text-on-surface-variant block mb-xs">Contact Email</label>
                <input
                  className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  type="email"
                  defaultValue="admin@propati.ng"
                />
              </div>
              <div className="group">
                <label className="font-label-sm text-on-surface-variant block mb-xs">Timezone</label>
                <select className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                  <option selected={true}>WAT (West Africa Time)</option>
                  <option>GMT (Greenwich Mean Time)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Overview Card */}
          <div className="lg:col-span-4 glass-card p-lg rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary"><MaterialIcon name=security className="material-symbols-outlined" />
                  <h3 className="font-headline-sm text-headline-sm">Security Overview</h3>
                </div>
                <span className="px-md py-1 rounded-full text-label-sm font-label-sm verified-pill">Secured</span>
              </div>
              <div className="space-y-md">
                <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                  <span className="text-body-sm font-medium">2FA Status</span>
                  <span className="text-on-tertiary-container font-label-md">Enforced</span>
                </div>
                <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                  <span className="text-body-sm font-medium">Active Admin Sessions</span>
                  <span className="bg-surface-container-high px-md py-xs rounded text-label-sm font-label-sm">12 Active</span>
                </div>
                <div className="flex justify-between items-center py-sm">
                  <span className="text-body-sm font-medium">Last Security Audit</span>
                  <span className="text-on-surface-variant font-label-sm">Oct 24, 2023</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-md text-primary font-label-md flex items-center justify-center gap-sm hover:underline">
              View Full Security Log <span className="material-symbols-outlined text-[16px]"><MaterialIcon name=arrow_forward className="material-symbols-outlined" />
            </button>
          </div>

          {/* Integration Status Widget */}
          <div className="lg:col-span-4 glass-card p-lg rounded-xl">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary"><MaterialIcon name=hub className="material-symbols-outlined" />
              <h3 className="font-headline-sm text-headline-sm">Integration Status</h3>
            </div>
            <div className="space-y-lg">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <span className="material-symbols-outlined"><MaterialIcon name=check_circle className="material-symbols-outlined" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Payment Gateway</p>
                  <p className="text-xs text-on-surface-variant">Paystack • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <span className="material-symbols-outlined"><MaterialIcon name=check_circle className="material-symbols-outlined" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">SMS Service</p>
                  <p className="text-xs text-on-surface-variant">Twilio • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                  <span className="material-symbols-outlined"><MaterialIcon name=warning className="material-symbols-outlined" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Email (SendGrid)</p>
                  <p className="text-xs text-on-surface-variant">Degraded • Check logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Settings Section */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-lg">
          <div className="flex border-b border-outline-variant overflow-x-auto">
            <button className="px-lg py-md font-label-md text-label-md text-primary border-b-2 border-primary font-bold whitespace-nowrap">
              Platform Logic
            </button>
            <button className="px-lg py-md font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">
              Localization & Advanced
            </button>
            <button className="px-lg py-md font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">
              Maintenance Mode
            </button>
          </div>

          {/* Platform Logic Content */}
          <div className="p-lg space-y-xl">
            <div>
              <h4 className="font-headline-sm text-primary mb-md">Registration Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-surface-container-low">
                  <div>
                    <p className="font-bold text-primary text-sm">Auto-Verify Properties</p>
                    <p className="text-xs text-on-surface-variant">Automatically approve properties with valid docs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={true} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface-container-lowest after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-surface-container-low">
                  <div>
                    <p className="font-bold text-primary text-sm">Require Email Verification</p>
                    <p className="text-xs text-on-surface-variant">Block logins until email is confirmed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={true} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface-container-lowest after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-surface-container-low">
                  <div>
                    <p className="font-bold text-primary text-sm">Enable Agent Commissions</p>
                    <p className="text-xs text-on-surface-variant">Allow agents to earn on closed deals</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface-container-lowest after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Asymmetric Detail Section: System Health */}
            <div className="p-lg rounded-xl bg-surface-container-low border border-outline-variant">
              <div className="flex items-center gap-sm mb-lg">
                <span className="material-symbols-outlined text-on-surface-variant"><MaterialIcon name=monitoring className="material-symbols-outlined" />
                <h4 className="font-headline-sm text-primary">System Health</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-outline-variant">
                  <p className="text-xs text-on-surface-variant mb-1">API Latency</p>
                  <p className="text-2xl font-bold text-primary">42ms</p>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mt-2">
                    <div className="h-full bg-success rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-outline-variant">
                  <p className="text-xs text-on-surface-variant mb-1">DB Connection Pool</p>
                  <p className="text-2xl font-bold text-primary">68/100</p>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mt-2">
                    <div className="h-full bg-warning rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixed Save Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant py-4 px-gutter flex justify-between items-center z-40">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="text-body-sm text-on-surface-variant">
              System-wide auto-save enabled. Last saved <span className="font-bold text-primary">12 seconds ago</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mr-4">
              Revision History: V4.1.09
            </p>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm" data-icon="cloud_upload">cloud_upload</span>
              Sync to Global Edge
            </button>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

'use client';

import AppIcon from '@/components/icons/app-icon';

export default function SettingsDashboardClient() {
  return (
    <main className="dashboard-content-area">
      {/* Ported from system_settings_dashboard_propati_admin.html */}

      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-xl min-h-screen">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-white">System Settings</h2>
            <p className="font-body-md text-body-md text-neutral-400">
              Manage platform-wide configurations, security, and integrations.
            </p>
          </div>
          <div className="flex gap-md">
            <button className="px-lg py-md rounded-lg border border-primary text-white font-label-md hover:bg-obsidian-800 transition-all">
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
              <AppIcon name="tune" className="lucide" />
              <h3 className="font-headline-sm text-headline-sm">General Configuration</h3>
            </div>
            <div className="space-y-md">
              <div className="group">
                <label className="font-label-sm text-neutral-400 block mb-xs">Platform Name</label>
                <input
                  className="w-full border border-[#262626] rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  type="text"
                  defaultValue="PROPATI"
                />
              </div>
              <div className="group">
                <label className="font-label-sm text-neutral-400 block mb-xs">Contact Email</label>
                <input
                  className="w-full border border-[#262626] rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  type="email"
                  defaultValue="admin@propati.ng"
                />
              </div>
              <div className="group">
                <label className="font-label-sm text-neutral-400 block mb-xs">Timezone</label>
                <select className="w-full border border-[#262626] rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all">
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
                  <AppIcon name="security" className="lucide" />
                  <h3 className="font-headline-sm text-headline-sm">Security Overview</h3>
                </div>
                <span className="px-md py-1 rounded-full text-label-sm font-label-sm verified-pill">Secured</span>
              </div>
              <div className="space-y-md">
                <div className="flex justify-between items-center py-sm border-b border-[#262626]">
                  <span className="text-body-sm font-medium">2FA Status</span>
                  <span className="text-[#00ff66] font-label-md">Enforced</span>
                </div>
                <div className="flex justify-between items-center py-sm border-b border-[#262626]">
                  <span className="text-body-sm font-medium">Active Admin Sessions</span>
                  <span className="bg-surface-container-high px-md py-xs rounded text-label-sm font-label-sm">12 Active</span>
                </div>
                <div className="flex justify-between items-center py-sm">
                  <span className="text-body-sm font-medium">Last Security Audit</span>
                  <span className="text-neutral-400 font-label-sm">Oct 24, 2023</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-md text-white font-label-md flex items-center justify-center gap-sm hover:underline">
              View Full Security Log <AppIcon name="arrow_forward" className="lucide" />
            </button>
          </div>

          {/* Integration Status Widget */}
          <div className="lg:col-span-4 glass-card p-lg rounded-xl">
            <div className="flex items-center gap-sm mb-lg">
              <AppIcon name="hub" className="lucide" />
              <h3 className="font-headline-sm text-headline-sm">Integration Status</h3>
            </div>
            <div className="space-y-lg">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-[#00ff66]">
                  <AppIcon name="check_circle" className="lucide" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Payment Gateway</p>
                  <p className="text-xs text-neutral-400">Paystack • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-[#00ff66]">
                  <AppIcon name="check_circle" className="lucide" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">SMS Service</p>
                  <p className="text-xs text-neutral-400">Twilio • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                  <AppIcon name="warning" className="lucide" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Email (SendGrid)</p>
                  <p className="text-xs text-neutral-400">Degraded • Check logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Settings Section */}
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] shadow-sm overflow-hidden mb-lg">
          <div className="flex border-b border-[#262626] overflow-x-auto">
            <button className="px-lg py-md font-label-md text-label-md text-white border-b-2 border-primary font-bold whitespace-nowrap">
              Platform Logic
            </button>
            <button className="px-lg py-md font-label-md text-label-md text-neutral-400 hover:text-white transition-colors whitespace-nowrap">
              Localization & Advanced
            </button>
            <button className="px-lg py-md font-label-md text-label-md text-neutral-400 hover:text-white transition-colors whitespace-nowrap">
              Maintenance Mode
            </button>
          </div>

          {/* Platform Logic Content */}
          <div className="p-lg space-y-xl">
            <div>
              <h4 className="font-headline-sm text-white mb-md">Registration Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#262626] bg-obsidian-800/30">
                  <div>
                    <p className="font-bold text-white text-sm">Auto-Verify Properties</p>
                    <p className="text-xs text-neutral-400">Automatically approve properties with valid docs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={true} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-obsidian-800/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#262626] bg-obsidian-800/30">
                  <div>
                    <p className="font-bold text-white text-sm">Require Email Verification</p>
                    <p className="text-xs text-neutral-400">Block logins until email is confirmed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={true} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-obsidian-800/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#262626] bg-obsidian-800/30">
                  <div>
                    <p className="font-bold text-white text-sm">Enable Agent Commissions</p>
                    <p className="text-xs text-neutral-400">Allow agents to earn on closed deals</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-obsidian-800/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Asymmetric Detail Section: System Health */}
            <div className="p-lg rounded-xl bg-obsidian-800/30 border border-[#262626]">
              <div className="flex items-center gap-sm mb-lg">
                <AppIcon name="monitoring" className="lucide" />
                <h4 className="font-headline-sm text-white">System Health</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-[#262626]">
                  <p className="text-xs text-neutral-400 mb-1">API Latency</p>
                  <p className="text-2xl font-bold text-white">42ms</p>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mt-2">
                    <div className="h-full bg-success rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-[#262626]">
                  <p className="text-xs text-neutral-400 mb-1">DB Connection Pool</p>
                  <p className="text-2xl font-bold text-white">68/100</p>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mt-2">
                    <div className="h-full bg-warning rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixed Save Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-obsidian-800/30/80 backdrop-blur-md border-t border-[#262626] py-4 px-gutter flex justify-between items-center z-40">
          <div className="flex items-center gap-4">
            <span className="lucide text-[#00ff66]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="text-body-sm text-neutral-400">
              System-wide auto-save enabled. Last saved <span className="font-bold text-white">12 seconds ago</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mr-4">
              Revision History: V4.1.09
            </p>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <span className="lucide text-sm" data-icon="cloud_upload">cloud_upload</span>
              Sync to Global Edge
            </button>
          </div>
        </div>
      </main>
    </main>
  );
}

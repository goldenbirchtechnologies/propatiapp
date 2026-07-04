'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function SettingsDashboardPagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from system_settings_dashboard_propati_admin.html */}
      
{'{'}/* SideNavBar (Authority Source: JSON) */{'}'}
<aside className="h-screen w-64 fixed left-0 top-0 bg-primary dark:bg-primary flex flex-col py-xl z-50">
<div className="px-lg mb-xl">
<h1 className="font-headline-md text-headline-md font-bold text-secondary-container">PROPATI</h1>
<p className="font-body-sm text-body-sm text-on-primary-container">Admin Console</p>
</div>
<nav className="flex-1 space-y-xs overflow-y-auto">
<a className="flex items-center gap-md px-lg py-md text-on-primary-container hover:bg-primary-container hover:text-secondary-container transition-colors duration-200" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container hover:bg-primary-container hover:text-secondary-container transition-colors duration-200" href="#">
<span className="material-symbols-outlined">domain</span>
<span className="font-label-md text-label-md">Property Listings</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container hover:bg-primary-container hover:text-secondary-container transition-colors duration-200" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-md text-label-md">User Management</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container hover:bg-primary-container hover:text-secondary-container transition-colors duration-200" href="#">
<span className="material-symbols-outlined">payments</span>
<span className="font-label-md text-label-md">Financials</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container hover:bg-primary-container hover:text-secondary-container transition-colors duration-200" href="#">
<span className="material-symbols-outlined">history_edu</span>
<span className="font-label-md text-label-md">Audit Logs</span>
</a>
{'{'}/* Active State: System Settings */{'}'}
<a className="flex items-center gap-md px-lg py-md border-l-4 border-secondary-container bg-primary-container text-secondary-container scale-[0.98]" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">System Settings</span>
</a>
</nav>
<div className="px-lg mt-auto pt-xl space-y-xs">
<a className="flex items-center gap-md px-md py-sm text-on-primary-container hover:text-secondary-container transition-colors" href="#">
<span className="material-symbols-outlined">help</span>
<span className="font-label-md text-label-md">Help Center</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-primary-container hover:text-secondary-container transition-colors" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="font-label-md text-label-md">Logout</span>
</a>
</div>
</aside>
{'{'}/* TopNavBar (Authority Source: JSON) */{'}'}
<header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-gutter z-40">
<div className="flex items-center bg-surface-container-low rounded-lg px-md py-xs w-96">
<span className="material-symbols-outlined text-outline">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-sm w-full" placeholder="Search configurations..." type="text"/>
</div>
<div className="flex items-center gap-lg">
<div className="flex items-center gap-md">
<button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-all">notifications</button>
<button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-all">help</button>
<button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-all">settings</button>
</div>
<div className="flex items-center gap-sm pl-md border-l border-outline-variant">
<div className="text-right">
<p className="font-label-md text-label-md text-on-surface">Admin User</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Administrator Profile</p>
</div>
<div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a Nigerian male administrator in a modern business suit, smiling confidently. High-end office background with soft lighting, reflecting a corporate and trustworthy aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpJt71wcF4GLhD97jg_XHuv6MojEUF_ZyV0P0TFclwvdWQEbPMjcCP3oK0I2QMtc6RME23sHqPZZQ7WxnIManmchktckWQxxsRM6eShkIXRPXPG37cHuukPDxdnqkfmMKCpy4NfbFPh8ygXUgZApOInrZEIHrk3h_JGuKsGOAUJ3OO9xEhUAIRTwK1NYG8v-EmiGB96i7ySycljLTXV4CzuyFiyVzQpaHjiy4lsYHaKUeVGY5-HfcLnUrSadlomYK1JrrY8cTF2o4"/>
</div>
</div>
</div>
</header>
{'{'}/* Main Content Area */{'}'}
<main className="ml-64 mt-16 p-xl min-h-screen">
{'{'}/* Header Section */{'}'}
<section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">System Settings</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Manage platform-wide configurations, security, and integrations.</p>
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
{'{'}/* Dashboard Overview Grid */{'}'}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mb-xl">
{'{'}/* General Configuration */{'}'}
<div className="lg:col-span-4 glass-card p-lg rounded-xl flex flex-col gap-md">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary">tune</span>
<h3 className="font-headline-sm text-headline-sm">General Configuration</h3>
</div>
<div className="space-y-md">
<div className="group">
<label className="font-label-sm text-on-surface-variant block mb-xs">Platform Name</label>
<input className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="text" value="PROPATI"/>
</div>
<div className="group">
<label className="font-label-sm text-on-surface-variant block mb-xs">Contact Email</label>
<input className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="email" value="admin@propati.ng"/>
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
{'{'}/* Security Overview Card */{'}'}
<div className="lg:col-span-4 glass-card p-lg rounded-xl flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-lg">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary">security</span>
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
                    View Full Security Log <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
{'{'}/* Integration Status Widget */{'}'}
<div className="lg:col-span-4 glass-card p-lg rounded-xl">
<div className="flex items-center gap-sm mb-lg">
<span className="material-symbols-outlined text-primary">hub</span>
<h3 className="font-headline-sm text-headline-sm">Integration Status</h3>
</div>
<div className="space-y-lg">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary">fingerprint</span>
</div>
<div className="flex-1">
<p className="font-label-md text-label-md">NIMC Identity API</p>
<div className="flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="text-label-sm text-on-tertiary-container">Connected</span>
</div>
</div>
</div>
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary">landscape</span>
</div>
<div className="flex-1">
<p className="font-label-md text-label-md">Land Registry API</p>
<div className="flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="text-label-sm text-on-tertiary-container">Healthy</span>
</div>
</div>
</div>
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary">mail</span>
</div>
<div className="flex-1">
<p className="font-label-md text-label-md">Email/SMS Gateways</p>
<div className="flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-secondary-container"></span>
<span className="text-label-sm text-secondary">Latency Alert</span>
</div>
</div>
</div>
</div>
</div>
</div>
{'{'}/* Tabbed Settings Section */{'}'}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
<div className="flex border-b border-outline-variant bg-surface-container-low">
<button className="px-xl py-lg border-b-2 border-primary text-primary font-label-md bg-surface-container-lowest">Platform Logic</button>
<button className="px-xl py-lg text-on-surface-variant font-label-md hover:bg-surface-container transition-all">Localization</button>
<button className="px-xl py-lg text-on-surface-variant font-label-md hover:bg-surface-container transition-all">Notifications</button>
<button className="px-xl py-lg text-on-surface-variant font-label-md hover:bg-surface-container transition-all">API Access</button>
</div>
<div className="p-xl grid grid-cols-1 md:grid-cols-2 gap-xl">
{'{'}/* Platform Logic */{'}'}
<div className="space-y-lg">
<h4 className="font-headline-sm text-headline-sm flex items-center gap-sm">
<span className="material-symbols-outlined text-primary">architecture</span> Platform Logic
                    </h4>
<div className="space-y-md">
<div className="flex justify-between items-center">
<div>
<p className="font-label-md">Automatic Listing Expiry</p>
<p className="text-body-sm text-on-surface-variant">Set days before unverified listings expire</p>
</div>
<div className="flex items-center gap-sm">
<input className="w-20 border border-outline-variant rounded-lg px-md py-sm focus:ring-primary text-center" type="number" value="90"/>
<span className="font-label-sm">Days</span>
</div>
</div>
<div className="flex justify-between items-center">
<div>
<p className="font-label-md">Max Images per Listing</p>
<p className="text-body-sm text-on-surface-variant">Limit media uploads to optimize storage</p>
</div>
<input className="w-20 border border-outline-variant rounded-lg px-md py-sm focus:ring-primary text-center" type="number" value="20"/>
</div>
<div>
<p className="font-label-md mb-sm">Verification Priority</p>
<div className="flex gap-md">
<label className="flex-1 border border-outline-variant rounded-lg p-md cursor-pointer hover:bg-surface-container-low flex items-center gap-md">
<input checked={true} className="text-primary focus:ring-primary" name="priority" type="radio"/>
<span>Standard</span>
</label>
<label className="flex-1 border border-primary bg-primary-container/5 rounded-lg p-md cursor-pointer flex items-center gap-md">
<input className="text-primary focus:ring-primary" name="priority" type="radio"/>
<span className="text-primary font-bold">Express</span>
</label>
</div>
</div>
</div>
</div>
{'{'}/* Localization & Advanced */{'}'}
<div className="space-y-lg">
<h4 className="font-headline-sm text-headline-sm flex items-center gap-sm">
<span className="material-symbols-outlined text-primary">language</span> Localization
                    </h4>
<div className="space-y-md">
<div className="group">
<label className="font-label-sm text-on-surface-variant block mb-xs">Default Currency</label>
<select className="w-full border border-outline-variant rounded-lg px-md py-sm focus:border-primary">
<option>NGN - Nigerian Naira (₦)</option>
<option>USD - US Dollar ($)</option>
<option>GBP - British Pound (£)</option>
</select>
</div>
<div className="group">
<label className="font-label-sm text-on-surface-variant block mb-xs">Regional Focus</label>
<div className="flex flex-wrap gap-sm">
<span className="bg-primary text-on-primary px-md py-1 rounded-full text-label-sm">Lagos</span>
<span className="bg-primary text-on-primary px-md py-1 rounded-full text-label-sm">Abuja</span>
<span className="bg-primary text-on-primary px-md py-1 rounded-full text-label-sm">Port Harcourt</span>
<button className="border border-dashed border-outline px-md py-1 rounded-full text-label-sm hover:border-primary transition-all">+ Add City</button>
</div>
</div>
{'{'}/* Maintenance Mode Toggle */{'}'}
<div className="mt-xl p-lg rounded-xl bg-error-container/20 border border-error/20">
<div className="flex justify-between items-start mb-md">
<div className="flex items-center gap-sm text-on-error-container">
<span className="material-symbols-outlined">warning</span>
<p className="font-label-md font-bold">Maintenance Mode</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" onchange="toggleMaintenance(this)" type="checkbox" value=""/>
<div className="w-14 h-7 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-error"></div>
</label>
</div>
<p className="text-body-sm text-on-error-container">When enabled, the platform will be inaccessible to end-users. Only administrators can bypass this screen.</p>
</div>
</div>
</div>
</div>
</div>
{'{'}/* Asymmetric Detail Section: System Health */{'}'}
<section className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-lg">
<div className="lg:col-span-2 glass-card rounded-xl p-lg overflow-hidden relative min-h-[300px]">
<div className="relative z-10">
<h3 className="font-headline-sm text-headline-sm mb-sm">System Health Pulse</h3>
<p className="text-body-md text-on-surface-variant mb-xl">Real-time performance across all node clusters in the Lagos and Abuja regions.</p>
<div className="grid grid-cols-2 md:grid-cols-4 gap-md">
<div className="p-md bg-surface-container-lowest rounded-lg border border-outline-variant hover-lift">
<p className="text-label-sm text-on-surface-variant">CPU Usage</p>
<p className="text-headline-sm font-bold text-primary">24.5%</p>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-sm">
<div className="bg-on-tertiary-container h-1 rounded-full" style="width: 24%"></div>
</div>
</div>
<div className="p-md bg-surface-container-lowest rounded-lg border border-outline-variant hover-lift">
<p className="text-label-sm text-on-surface-variant">Memory</p>
<p className="text-headline-sm font-bold text-primary">4.2 GB</p>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-sm">
<div className="bg-on-tertiary-container h-1 rounded-full" style="width: 52%"></div>
</div>
</div>
<div className="p-md bg-surface-container-lowest rounded-lg border border-outline-variant hover-lift">
<p className="text-label-sm text-on-surface-variant">API Latency</p>
<p className="text-headline-sm font-bold text-primary">42ms</p>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-sm">
<div className="bg-on-tertiary-container h-1 rounded-full" style="width: 15%"></div>
</div>
</div>
<div className="p-md bg-surface-container-lowest rounded-lg border border-outline-variant hover-lift">
<p className="text-label-sm text-on-surface-variant">Active Socket</p>
<p className="text-headline-sm font-bold text-primary">2,491</p>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-sm">
<div className="bg-secondary-container h-1 rounded-full" style="width: 80%"></div>
</div>
</div>
</div>
</div>
{'{'}/* Subtle graphic background */{'}'}
<div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
<span className="material-symbols-outlined text-[200px] text-primary">monitoring</span>
</div>
</div>
<div className="bg-primary-container p-lg rounded-xl text-on-primary-container flex flex-col justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-secondary-container mb-md">Admin Audit Pulse</h3>
<div className="space-y-md">
<div className="flex gap-md items-start">
<div className="w-2 h-2 rounded-full bg-secondary-container mt-2"></div>
<div>
<p className="text-label-md text-secondary-fixed">Global Tax Rate Updated</p>
<p className="text-label-sm opacity-60">Admin_01 • 2 mins ago</p>
</div>
</div>
<div className="flex gap-md items-start">
<div className="w-2 h-2 rounded-full bg-on-tertiary-fixed mt-2"></div>
<div>
<p className="text-label-md text-secondary-fixed">NIMC Sync Successful</p>
<p className="text-label-sm opacity-60">System • 15 mins ago</p>
</div>
</div>
<div className="flex gap-md items-start">
<div className="w-2 h-2 rounded-full bg-error mt-2"></div>
<div>
<p className="text-label-md text-secondary-fixed">Failed Login Attempt</p>
<p className="text-label-sm opacity-60">IP: 192.168.1.1 • 45 mins ago</p>
</div>
</div>
</div>
</div>
<button className="w-full mt-lg py-md border border-on-primary-container rounded-lg font-label-md hover:bg-white hover:text-primary transition-all">
                    Full Audit Trail
                </button>
</div>
</section>
</main>


    </DashboardShell>
  );
}

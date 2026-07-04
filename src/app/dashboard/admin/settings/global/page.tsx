'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function SettingsGlobalPagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from global_settings_configuration_propati_admin.html */}
      
{'{'}/* SIDEBAR NAVIGATION (Immutable Content from JSON) */{'}'}
<aside className="h-screen w-64 fixed left-0 top-0 bg-primary-container z-50 flex flex-col py-6 shadow-md transition-all duration-300">
<div className="px-6 mb-10">
<h1 className="font-headline-md text-headline-md font-extrabold text-secondary-container">PROPATI</h1>
<p className="font-label-sm text-label-sm text-on-primary-container/70 uppercase tracking-widest mt-1">Admin Console</p>
</div>
<nav className="flex-grow flex flex-col gap-1">
{'{'}/* Dashboard */{'}'}
<div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed/70 hover:text-on-primary hover:bg-on-primary-fixed-variant/5 transition-colors duration-200 cursor-pointer active:scale-95">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</div>
{'{'}/* Verification Queues */{'}'}
<div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed/70 hover:text-on-primary hover:bg-on-primary-fixed-variant/5 transition-colors duration-200 cursor-pointer active:scale-95">
<span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
<span className="font-label-md text-label-md">Verification Queues</span>
</div>
{'{'}/* User Management */{'}'}
<div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed/70 hover:text-on-primary hover:bg-on-primary-fixed-variant/5 transition-colors duration-200 cursor-pointer active:scale-95">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span className="font-label-md text-label-md">User Management</span>
</div>
{'{'}/* Property Listings */{'}'}
<div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed/70 hover:text-on-primary hover:bg-on-primary-fixed-variant/5 transition-colors duration-200 cursor-pointer active:scale-95">
<span className="material-symbols-outlined" data-icon="domain">domain</span>
<span className="font-label-md text-label-md">Property Listings</span>
</div>
{'{'}/* Transactions */{'}'}
<div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed/70 hover:text-on-primary hover:bg-on-primary-fixed-variant/5 transition-colors duration-200 cursor-pointer active:scale-95">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
<span className="font-label-md text-label-md">Transactions</span>
</div>
{'{'}/* Settings (ACTIVE) */{'}'}
<div className="flex items-center gap-3 px-4 py-3 text-secondary-container border-l-4 border-secondary-container bg-on-primary-fixed-variant/10 cursor-pointer active:scale-95 transition-transform">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</div>
</nav>
<div className="px-6 pt-6 border-t border-on-primary-fixed-variant/20">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold">JD</div>
<div>
<p className="font-body-sm text-on-primary font-semibold">Jane Doe</p>
<p className="text-[10px] text-on-primary-container/70">Master Admin</p>
</div>
</div>
</div>
</aside>
{'{'}/* TOP APP BAR */{'}'}
<header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface-container-lowest border-b border-outline-variant z-40 flex justify-between items-center px-gutter">
<div className="flex items-center gap-4 flex-grow max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/10 text-body-md" placeholder="Search parameters, rules, or keys..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4">
<button className="p-2 hover:bg-surface-container-low rounded-full transition-all relative">
<span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-surface-container-lowest"></span>
</button>
<button className="p-2 hover:bg-surface-container-low rounded-full transition-all">
<span className="material-symbols-outlined text-primary" data-icon="help">help</span>
</button>
</div>
<div className="h-8 w-px bg-outline-variant"></div>
<div className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low p-1 pr-3 rounded-full transition-all">
<div className="w-8 h-8 rounded-full overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A clean, professional headshot of a female tech executive with a confident smile, wearing a modern navy blazer, set against a blurred office background with warm lighting. The image follows a high-end corporate photography style with crisp detail and natural skin tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN_D0V3U-7Fs7MRCTyMn0-7K1aIE-X8C5fpZA37rm2i2iwHwKoZ-sVjoXGd639DQHXmqpq58OXSJ76xM7XLFI0_XuOKMs6XYJ7Q70KOS5HjVHSK-DVPkuL1aZL5dbr5xZnlS2WC0YZGRPuaNttGaISJwKT0NlWyc_4OlfYMqcgaDG8XzVD6qFbcN4tBT2Dk4bwOpFKlbYdwqbpb6FEXM38kRa6bfrQTN9N5wEu1OaP_WW_85v8winclSagiM_pwr1lNtqKpEm1JsY"/>
</div>
<span className="font-label-md text-label-md text-primary">Admin Profile</span>
</div>
</div>
</header>
{'{'}/* MAIN CONTENT AREA */{'}'}
<main className="ml-64 mt-16 p-gutter pb-24">
{'{'}/* Header Section */{'}'}
<div className="mb-8 flex justify-between items-end">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">Global Settings &amp; Configuration</h2>
<p className="font-body-md text-on-surface-variant max-w-2xl mt-2">Manage the foundational logic of the PROPATI ecosystem. Changes to these parameters impact all active listings and financial settlements.</p>
</div>
<div className="flex gap-3">
<button className="px-6 py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition-all active:scale-95">Discard Changes</button>
<button className="px-8 py-2 rounded-lg bg-primary text-on-primary font-semibold shadow-md hover:translate-y-[-1px] transition-all active:scale-95">Publish Updates</button>
</div>
</div>
{'{'}/* Settings Grid (Bento Style) */{'}'}
<div className="grid grid-cols-12 gap-6">
{'{'}/* Sidebar Selection (Internal Page Nav) */{'}'}
<div className="col-span-3 flex flex-col gap-2">
<button className="group text-left px-5 py-4 bg-surface-container-lowest rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-all flex items-center justify-between" onclick="scrollToSection('platform')">
<div>
<p className="font-headline-sm text-headline-sm text-primary">Platform Parameters</p>
<p className="text-xs text-on-surface-variant font-medium">Commissions &amp; Escrow</p>
</div>
<span className="material-symbols-outlined text-primary opacity-50 group-hover:opacity-100" data-icon="chevron_right">chevron_right</span>
</button>
<button className="group text-left px-5 py-4 bg-surface-container-lowest rounded-lg border-l-4 border-transparent shadow-sm hover:shadow-md hover:border-outline-variant transition-all flex items-center justify-between" onclick="scrollToSection('verification')">
<div>
<p className="font-headline-sm text-headline-sm text-on-surface">Verification Rules</p>
<p className="text-xs text-on-surface-variant font-medium">Listing Standards</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100" data-icon="chevron_right">chevron_right</span>
</button>
<button className="group text-left px-5 py-4 bg-surface-container-lowest rounded-lg border-l-4 border-transparent shadow-sm hover:shadow-md hover:border-outline-variant transition-all flex items-center justify-between" onclick="scrollToSection('security')">
<div>
<p className="font-headline-sm text-headline-sm text-on-surface">Security &amp; Access</p>
<p className="text-xs text-on-surface-variant font-medium">RBAC &amp; Enforcement</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100" data-icon="chevron_right">chevron_right</span>
</button>
<button className="group text-left px-5 py-4 bg-surface-container-lowest rounded-lg border-l-4 border-transparent shadow-sm hover:shadow-md hover:border-outline-variant transition-all flex items-center justify-between" onclick="scrollToSection('notifications')">
<div>
<p className="font-headline-sm text-headline-sm text-on-surface">Notifications &amp; API</p>
<p className="text-xs text-on-surface-variant font-medium">External Integrations</p>
</div>
<span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100" data-icon="chevron_right">chevron_right</span>
</button>
</div>
{'{'}/* Configuration Forms */{'}'}
<div className="col-span-9 space-y-8">
{'{'}/* SECTION: Platform Parameters */{'}'}
<section className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/30 shadow-sm" id="platform">
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="settings_input_component">settings_input_component</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">Platform Parameters</h3>
<p className="text-body-sm text-on-surface-variant">Configure core business logic and transaction mechanics.</p>
</div>
</div>
<div className="grid grid-cols-2 gap-8">
<div className="space-y-6">
<div>
<label className="block font-label-md text-label-md text-on-surface-variant mb-2">Primary Sales Commission</label>
<div className="relative">
<input className="w-full h-[44px] rounded-lg border-outline-variant border px-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-semibold" type="number" value="2.5"/>
<span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
</div>
<p className="text-[11px] text-on-surface-variant mt-1.5 px-1">Applied to the total transaction value of verified sales.</p>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface-variant mb-2">Escrow Holding Period</label>
<div className="relative">
<input className="w-full h-[44px] rounded-lg border-outline-variant border px-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-semibold" type="number" value="14"/>
<span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">DAYS</span>
</div>
<p className="text-[11px] text-on-surface-variant mt-1.5 px-1">Mandatory buffer before funds release to sellers.</p>
</div>
</div>
<div className="space-y-6">
<div>
<label className="block font-label-md text-label-md text-on-surface-variant mb-2">Rental Service Fee</label>
<div className="relative">
<input className="w-full h-[44px] rounded-lg border-outline-variant border px-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-semibold" type="number" value="5.0"/>
<span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
</div>
<p className="text-[11px] text-on-surface-variant mt-1.5 px-1">Standard processing fee for automated rent collection.</p>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface-variant mb-2">Min. Verification Level (Public)</label>
<select className="w-full h-[44px] rounded-lg border-outline-variant border px-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-semibold appearance-none bg-no-repeat bg-[right_1rem_center]">
<option>Level 3 - Inspected</option>
<option selected={true}>Level 4 - Verified Gold</option>
<option>Level 5 - Platinum Certified</option>
</select>
<p className="text-[11px] text-on-surface-variant mt-1.5 px-1">Threshold for property listings to appear in public search.</p>
</div>
</div>
</div>
</section>
{'{'}/* SECTION: Verification Rules (Bento Grid Internal) */{'}'}
<section className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/30 shadow-sm relative overflow-hidden" id="verification">
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-secondary" data-icon="verified_user">verified_user</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">Verification Rules</h3>
<p className="text-body-sm text-on-surface-variant">Global thresholds for fraud detection and document integrity.</p>
</div>
</div>
<div className="grid grid-cols-3 gap-6">
{'{'}/* Rule Card */{'}'}
<div className="p-4 bg-surface rounded-lg border border-outline-variant/50">
<div className="flex justify-between items-start mb-4">
<span className="px-2 py-1 bg-on-tertiary-container/10 text-on-tertiary-container text-[10px] font-bold rounded uppercase tracking-wider">Automated</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={true} className="sr-only peer" type="checkbox"/>
<div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<h4 className="font-label-md text-label-md text-on-surface mb-1">Suspicious Listing Flag</h4>
<p className="text-xs text-on-surface-variant mb-4">Price variance threshold against market average.</p>
<div className="flex items-center gap-2">
<input className="w-16 h-8 text-center rounded border-outline-variant border text-sm font-bold" type="number" value="30"/>
<span className="text-sm font-medium">% variance</span>
</div>
</div>
{'{'}/* Rule Card */{'}'}
<div className="p-4 bg-surface rounded-lg border border-outline-variant/50">
<div className="flex justify-between items-start mb-4">
<span className="px-2 py-1 bg-secondary-container/20 text-secondary text-[10px] font-bold rounded uppercase tracking-wider">Document</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={true} className="sr-only peer" type="checkbox"/>
<div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<h4 className="font-label-md text-label-md text-on-surface mb-1">Expiry Notifications</h4>
<p className="text-xs text-on-surface-variant mb-4">Alert period for land title re-validation.</p>
<div className="flex items-center gap-2">
<input className="w-16 h-8 text-center rounded border-outline-variant border text-sm font-bold" type="number" value="90"/>
<span className="text-sm font-medium">days before</span>
</div>
</div>
{'{'}/* Rule Card */{'}'}
<div className="p-4 bg-primary text-on-primary rounded-lg shadow-lg">
<div className="flex justify-between items-start mb-4">
<span className="px-2 py-1 bg-white/20 text-white text-[10px] font-bold rounded uppercase tracking-wider">Premium</span>
<span className="material-symbols-outlined text-secondary-container" data-icon="star" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<h4 className="font-label-md text-label-md mb-1">AI-Photo Analysis</h4>
<p className="text-xs text-on-primary/70 mb-4">Auto-reject listings with stock images or heavy watermarks.</p>
<div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
<div className="bg-secondary-container h-full w-[85%]"></div>
</div>
<p className="text-[10px] mt-2 opacity-80">85% Accuracy Confidence Required</p>
</div>
</div>
</section>
{'{'}/* SECTION: Security & Access */{'}'}
<section className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/30 shadow-sm" id="security">
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-lg bg-on-error-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-error" data-icon="security">security</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">Security &amp; Access</h3>
<p className="text-body-sm text-on-surface-variant">Restrict administrative access and enforce authentication protocols.</p>
</div>
</div>
<div className="space-y-6">
<div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
<div className="flex gap-4">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="key">key</span>
<div>
<p className="font-body-md text-on-surface font-semibold">Two-Factor Authentication (2FA)</p>
<p className="text-xs text-on-surface-variant">Enforce biometric or TOTP authentication for all Admin levels.</p>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={true} className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div className="grid grid-cols-12 gap-6">
<div className="col-span-8">
<label className="block font-label-md text-label-md text-on-surface-variant mb-2">Admin IP Whitelist</label>
<textarea className="w-full rounded-lg border-outline-variant border p-4 font-label-md text-label-md focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" placeholder="192.168.1.1, 45.32.11.200 (Separated by commas)" rows="3">192.168.1.1, 102.176.4.55, 102.176.4.56</textarea>
<p className="text-[11px] text-on-surface-variant mt-2 italic">Only requests from these IP addresses will be granted access to the /admin route.</p>
</div>
<div className="col-span-4 flex flex-col justify-end">
<button className="w-full h-[44px] flex items-center justify-center gap-2 rounded-lg border border-primary text-primary font-bold hover:bg-primary/5 transition-all">
<span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                                    Detect Current IP
                                </button>
</div>
</div>
</div>
</section>
{'{'}/* SECTION: Notifications & API */{'}'}
<section className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/30 shadow-sm" id="notifications">
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-on-tertiary-fixed-variant" data-icon="api">api</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">Notifications &amp; API</h3>
<p className="text-body-sm text-on-surface-variant">Bridge the platform with global identity and land registry systems.</p>
</div>
</div>
<div className="grid grid-cols-2 gap-6">
<div className="border border-outline-variant rounded-lg p-5">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface text-lg" data-icon="integration_instructions">integration_instructions</span>
</div>
<p className="font-label-md text-label-md">NIMC Identity API</p>
</div>
<span className="px-2 py-0.5 bg-on-tertiary-container/20 text-on-tertiary-container text-[10px] font-bold rounded">CONNECTED</span>
</div>
<div className="space-y-3">
<div className="relative">
<input className="w-full bg-surface text-xs font-label-md p-3 border border-outline-variant/50 rounded pr-10" readonly={true} type="password" value="sk_test_4eC39HqLyjWDarjtT1zdp7dc"/>
<button className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" data-icon="content_copy">content_copy</button>
</div>
<div className="flex justify-between">
<span className="text-[10px] text-on-surface-variant font-medium">Last Ping: 2m ago</span>
<span className="text-[10px] text-on-tertiary-container font-bold">Latency: 45ms</span>
</div>
</div>
</div>
<div className="border border-outline-variant rounded-lg p-5">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface text-lg" data-icon="webhook">webhook</span>
</div>
<p className="font-label-md text-label-md">Webhooks (Global)</p>
</div>
<span className="px-2 py-0.5 bg-outline-variant/20 text-on-surface-variant text-[10px] font-bold rounded uppercase">7 Active</span>
</div>
<div className="space-y-3">
<div className="flex items-center justify-between text-xs p-2 bg-surface rounded">
<span className="font-medium text-primary">transaction.success</span>
<span className="material-symbols-outlined text-xs text-on-surface-variant cursor-pointer" data-icon="edit">edit</span>
</div>
<div className="flex items-center justify-between text-xs p-2 bg-surface rounded">
<span className="font-medium text-primary">listing.flagged</span>
<span className="material-symbols-outlined text-xs text-on-surface-variant cursor-pointer" data-icon="edit">edit</span>
</div>
<button className="w-full py-1 text-[10px] font-bold text-center border border-dashed border-outline-variant rounded hover:bg-surface-container-low transition-colors">Add Webhook Secret</button>
</div>
</div>
</div>
</section>
{'{'}/* SECTION: Data Map Integration (Mockup) */{'}'}
<section className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/30 shadow-sm">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="map">map</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-primary">Regional Jurisdiction Map</h3>
<p className="text-body-sm text-on-surface-variant">Active integration regions for Nigerian Land Registries.</p>
</div>
</div>
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-body-sm font-semibold hover:bg-surface-container-high transition-all">
<span className="material-symbols-outlined text-sm" data-icon="download">download</span>
                            Coverage Report
                        </button>
</div>
<div className="w-full h-64 bg-surface-container rounded-lg overflow-hidden relative">
<img className="w-full h-full object-cover grayscale opacity-60" data-location="Lagos, Nigeria" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJA_bc_EeapztB2A5CPUWfmWaE6vTnSiwVA1wpS4Nvsivsb1U2Kx5qdD861gYTtqo3_euD5j5aZgaTjKNdP7PYWFVmPVw1mUtoK4i_klWeWnXDPGeXf71GkPHWo_8_W3r52HyWNDz0U5qsEfFJrRJnB9GiPOqfZM2w9E4WuK_H72yoaXb4M6KS6Z8AO2bpwsr65yHmsJ6y-wD7GIGYucSpAmuk3sAHfOxX318qqKP4VVtEj_3xQ-NAmClMNhu8OrnRTWQwdl51K2I"/>
<div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
<div className="w-4 h-4 bg-secondary-container rounded-full animate-ping absolute"></div>
<div className="w-4 h-4 bg-secondary-container rounded-full relative shadow-[0_0_10px_rgba(254,174,44,0.8)]"></div>
</div>
<div className="absolute bottom-4 left-4 flex gap-2">
<span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold shadow-sm">LAGOS: INTEGRATED</span>
<span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold shadow-sm">ABUJA: PENDING</span>
</div>
</div>
</section>
</div>
</div>
</main>
{'{'}/* Footer Fixed Save Bar */{'}'}
<div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant py-4 px-gutter flex justify-between items-center z-40">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-on-tertiary-container" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
<p className="text-body-sm text-on-surface-variant">System-wide auto-save enabled. Last saved <span className="font-bold text-primary">12 seconds ago</span>.</p>
</div>
<div className="flex items-center gap-3">
<p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mr-4">Revision History: V4.1.09</p>
<button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
<span className="material-symbols-outlined text-sm" data-icon="cloud_upload">cloud_upload</span>
                Sync to Global Edge
            </button>
</div>
</div>


    </DashboardShell>
  );
}

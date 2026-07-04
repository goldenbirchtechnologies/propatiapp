'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuditEventDetailPagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from audit_event_detail_permission_update_propati_admin.html */}
      
{'{'}/* Sidebar Navigation */{'}'}
<aside className="h-screen w-64 fixed left-0 top-0 bg-primary-container dark:bg-tertiary-container border-r border-outline-variant flex flex-col py-xl z-50">
<div className="px-lg mb-xl">
<h1 className="font-headline-md text-headline-md font-bold text-on-primary dark:text-on-tertiary-fixed tracking-tight">VeriProp Admin</h1>
<p className="text-label-sm text-on-primary-container/60">Verified Marketplace</p>
</div>
<nav className="flex-1 space-y-xs">
<a className="flex items-center gap-md px-lg py-md text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/10 transition-colors duration-200" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-lg py-md border-l-4 border-secondary-container text-secondary-container bg-primary/20 transition-colors duration-200" href="#">
<span className="material-symbols-outlined">fact_check</span>
<span className="font-label-md">Verification Queues</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/10 transition-colors duration-200" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-md">User Management</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/10 transition-colors duration-200" href="#">
<span className="material-symbols-outlined">domain</span>
<span className="font-label-md">Property Listings</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/10 transition-colors duration-200" href="#">
<span className="material-symbols-outlined">payments</span>
<span className="font-label-md">Transactions</span>
</a>
<a className="flex items-center gap-md px-lg py-md text-on-primary-container/70 hover:text-on-primary-container hover:bg-primary/10 transition-colors duration-200" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md">Settings</span>
</a>
</nav>
<div className="px-lg mt-auto pt-lg border-t border-outline-variant/20">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">AB</div>
<div>
<p className="text-label-md font-bold text-on-primary">Ade Ben-G.</p>
<p className="text-label-sm text-on-primary-container/50">Super Admin</p>
</div>
</div>
</div>
</aside>
{'{'}/* Main Content Area */{'}'}
<main className="ml-64 min-h-screen flex flex-col">
{'{'}/* Top Nav Bar */{'}'}
<header className="fixed top-0 right-0 left-64 h-16 z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant shadow-sm flex justify-between items-center px-gutter">
<div className="flex items-center gap-md w-1/2">
<span className="material-symbols-outlined text-on-surface-variant">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant/50" placeholder="Search audit logs, users, or properties..." type="text"/>
</div>
<div className="flex items-center gap-lg">
<button className="relative text-on-surface-variant hover:bg-surface-container-low p-sm rounded-lg transition-colors">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
</button>
<button className="text-on-surface-variant hover:bg-surface-container-low p-sm rounded-lg transition-colors">
<span className="material-symbols-outlined">help</span>
</button>
<div className="h-8 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-sm cursor-pointer hover:bg-surface-container-low p-xs pr-sm rounded-lg transition-colors">
<span className="material-symbols-outlined text-primary">account_circle</span>
<span className="font-label-md text-primary">Audit Center</span>
</div>
</div>
</header>
{'{'}/* View Content */{'}'}
<div className="mt-16 p-gutter space-y-lg">
{'{'}/* Breadcrumbs */{'}'}
<nav className="flex items-center gap-sm text-label-sm text-on-surface-variant">
<a className="hover:text-primary" href="#">Home</a>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<a className="hover:text-primary" href="#">Audit Logs</a>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="text-on-surface font-bold">Event #EV-9821</span>
</nav>
{'{'}/* Header Section */{'}'}
<section className="flex flex-col md:flex-row md:items-end justify-between gap-md">
<div className="space-y-sm">
<div className="flex items-center gap-sm">
<span className="px-sm py-xs bg-surface-container-highest text-primary font-label-sm rounded-lg uppercase tracking-wider">RBAC</span>
<div className="flex items-center gap-xs px-sm py-xs bg-tertiary-container text-tertiary-fixed font-label-sm rounded-full">
<span className="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">verified</span>
<span>Verified Immutable</span>
</div>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Event Detail: Permission Update</h2>
</div>
<div className="flex items-center gap-sm">
<button className="flex items-center gap-sm px-lg h-11 border border-outline text-primary font-label-md rounded-xl hover:bg-surface-container-low transition-all active:scale-95">
<span className="material-symbols-outlined">download</span>
                        Export JSON
                    </button>
<button className="flex items-center gap-sm px-lg h-11 bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary/90 shadow-md transition-all active:scale-95">
<span className="material-symbols-outlined">flag</span>
                        Flag for Review
                    </button>
</div>
</section>
{'{'}/* Metadata Summary Grid */{'}'}
<section className="grid grid-cols-1 md:grid-cols-4 gap-gutter bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
<div className="flex flex-col gap-xs">
<span className="text-label-sm text-on-surface-variant">Administrator</span>
<div className="flex items-center gap-sm mt-xs">
<img className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-container-high" data-alt="A professional portrait of a West African male administrator in a clean-cut corporate attire, set against a blurred modern office background with high-key lighting. The style is professional and trustworthy, reflecting a high-security fintech environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC70xn2f3s3ytMUkkwMiesnbYx9CktoNe1hoctJ-VjdX55c9j5cf3UdyUbkT7UfujPVJOkVUHO3idHG44TJyAcLTXw-F0rCBT52MZqgPGRRo6KcvufW7sXk6mskfR0I-yhmaZFJCIOxxBpLj3DRx3E-aCEe-Xohuppfft_3QjeE8y51FJH4WQthENaD21JN0n02X6ctoi_pTMckcE_DvHy8suRKCMpXykOERTJzV_g6PHlXYqbE-e451-sbg-FrGB6ZX_uXRSSSOzA"/>
<span className="font-body-md font-bold">Ade Ben-G.</span>
</div>
</div>
<div className="flex flex-col gap-xs">
<span className="text-label-sm text-on-surface-variant">Timestamp</span>
<div className="flex items-center gap-sm mt-xs text-on-surface">
<span className="material-symbols-outlined text-on-surface-variant">schedule</span>
<span className="font-body-md font-medium">Oct 27, 2023 - 14:22:10 <span className="text-label-sm opacity-60">WAT</span></span>
</div>
</div>
<div className="flex flex-col gap-xs">
<span className="text-label-sm text-on-surface-variant">Origin IP</span>
<div className="flex items-center gap-sm mt-xs text-on-surface">
<span className="material-symbols-outlined text-on-surface-variant">location_on</span>
<span className="font-body-md font-medium">192.168.1.1 <span className="text-label-sm opacity-60">(Lagos, NG)</span></span>
</div>
</div>
<div className="flex flex-col gap-xs">
<span className="text-label-sm text-on-surface-variant">Action</span>
<div className="flex items-center gap-sm mt-xs text-on-surface">
<span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
<span className="font-body-md font-medium">Modified "Verification Officer" Role</span>
</div>
</div>
</section>
{'{'}/* Main Workspace: Diff & Sidebar */{'}'}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{'{'}/* Change Diff Code Container */{'}'}
<section className="lg:col-span-8 flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div className="bg-surface-container p-md border-b border-outline-variant flex justify-between items-center">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant">code</span>
<h3 className="font-label-md text-primary uppercase tracking-wider font-bold">JSON Payload Diff</h3>
</div>
<div className="flex gap-sm">
<div className="w-3 h-3 rounded-full bg-error/40"></div>
<div className="w-3 h-3 rounded-full bg-secondary/40"></div>
<div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/40"></div>
</div>
</div>
<div className="p-lg font-label-md overflow-x-auto">
<div className="min-w-[600px] bg-surface rounded-lg p-md border border-outline-variant/30 space-y-1">
<div className="text-on-surface-variant/40">{'{'}</div>
<div className="pl-4 text-on-surface-variant/70">"role": "Verification Officer",</div>
<div className="pl-4 text-on-surface-variant/70">"module": "Identity_Verification",</div>
<div className="pl-4 text-on-surface-variant/70">"permissions": {'{'}</div>
{'{'}/* Removed Line */{'}'}
<div className="pl-8 flex items-center gap-md diff-removed py-1 px-2 rounded -mx-2">
<span className="w-4 text-center opacity-30">-</span>
<span className="flex-1">"verification.approve": <span className="font-bold">false</span>,</span>
</div>
{'{'}/* Added Line */{'}'}
<div className="pl-8 flex items-center gap-md diff-added py-1 px-2 rounded -mx-2">
<span className="w-4 text-center opacity-30">+</span>
<span className="flex-1">"verification.approve": <span className="font-bold">true</span>,</span>
</div>
<div className="pl-8 text-on-surface-variant/70">"verification.reject": true,</div>
<div className="pl-8 text-on-surface-variant/70">"document.view": true</div>
<div className="pl-4 text-on-surface-variant/40">{'}'},</div>
<div className="pl-4 text-on-surface-variant/70">"updated_at": "2023-10-27T14:22:10Z"</div>
<div className="text-on-surface-variant/40">{'}'}</div>
</div>
</div>
<div className="mt-auto p-md bg-surface-container-low text-label-sm text-on-surface-variant/70 italic flex items-center gap-sm">
<span className="material-symbols-outlined text-[18px]">info</span>
                        Hash SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
</section>
{'{'}/* Contextual Timeline Sidebar */{'}'}
<aside className="lg:col-span-4 space-y-lg">
<div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm h-full">
<h3 className="font-headline-sm text-headline-sm text-primary mb-lg">Related Activity</h3>
<p className="text-body-sm text-on-surface-variant mb-xl">Activity within 1-hour window for Admin <span className="font-bold">Ade Ben-G.</span></p>
<div className="relative space-y-xl pl-6 border-l-2 border-outline-variant/30">
{'{'}/* Timeline Item 1 */{'}'}
<div className="relative">
<div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-secondary-container ring-4 ring-surface-container-lowest"></div>
<div className="flex flex-col gap-1">
<span className="text-label-sm font-bold text-primary">14:15:02 WAT</span>
<p className="text-body-sm text-on-surface">Initiated session login from 192.168.1.1</p>
<span className="text-label-sm text-on-surface-variant/60">System Security Log</span>
</div>
</div>
{'{'}/* Timeline Item 2 (Current) */{'}'}
<div className="relative">
<div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
<div className="flex flex-col gap-1 p-md bg-primary-fixed/30 rounded-lg -mx-2 border border-primary-fixed">
<div className="flex justify-between items-start">
<span className="text-label-sm font-bold text-primary">14:22:10 WAT</span>
<span className="px-xs py-[2px] bg-primary text-on-primary text-[10px] rounded uppercase font-bold">Current</span>
</div>
<p className="text-body-sm text-on-surface">Modified "Verification Officer" Role Permissions</p>
</div>
</div>
{'{'}/* Timeline Item 3 */{'}'}
<div className="relative">
<div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-secondary-container ring-4 ring-surface-container-lowest"></div>
<div className="flex flex-col gap-1">
<span className="text-label-sm font-bold text-primary">14:38:55 WAT</span>
<p className="text-body-sm text-on-surface">Updated Property #PR-2201 verification status</p>
<span className="text-label-sm text-on-surface-variant/60">Property Management</span>
</div>
</div>
{'{'}/* Timeline Item 4 */{'}'}
<div className="relative">
<div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-secondary-container ring-4 ring-surface-container-lowest"></div>
<div className="flex flex-col gap-1">
<span className="text-label-sm font-bold text-primary">14:55:12 WAT</span>
<p className="text-body-sm text-on-surface">Session Terminated (Manual Logout)</p>
<span className="text-label-sm text-on-surface-variant/60">System Security Log</span>
</div>
</div>
</div>
<button className="w-full mt-xl py-md text-label-md font-bold text-primary hover:text-secondary transition-colors border-t border-outline-variant/30 flex items-center justify-center gap-sm">
                            View Full Admin Audit Trail
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
{'{'}/* Integrity Badge Large */{'}'}
<div className="glass-panel p-lg rounded-xl flex items-center gap-lg">
<div className="w-16 h-16 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container border-2 border-dashed border-tertiary-container/30">
<span className="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">security</span>
</div>
<div>
<h4 className="font-headline-sm text-primary">System Integrity Guaranteed</h4>
<p className="text-body-sm text-on-surface-variant mt-1">This entry is cryptographically signed and archived on a write-once read-many (WORM) storage layer.</p>
</div>
</div>
</aside>
</div>
</div>
</main>


    </DashboardShell>
  );
}

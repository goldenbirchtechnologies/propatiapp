'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function UsersManagementPagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from user_management_console_propati_admin.html */}
      
{'{'}/* SideNavBar */{'}'}
<aside className="h-screen w-64 fixed left-0 top-0 bg-primary-container z-50 flex flex-col border-r border-outline-variant/10">
<div className="p-6 flex items-center gap-3">
<div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center text-primary font-bold">P</div>
<div>
<h1 className="font-headline-sm text-headline-sm font-bold text-on-primary tracking-tight">PROPATI</h1>
<p className="text-[10px] uppercase tracking-widest text-on-primary-container font-label-md">Admin Console</p>
</div>
</div>
<nav className="flex-1 px-3 mt-4 space-y-1 custom-scrollbar overflow-y-auto">
<a className="flex items-center gap-3 px-4 py-3 text-on-primary-container hover:text-on-primary hover:bg-on-primary-container/5 transition-colors font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
                Dashboard
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-primary-container hover:text-on-primary hover:bg-on-primary-container/5 transition-colors font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined">fact_check</span>
                Verification Queues
            </a>
{'{'}/* Active Navigation State for User Management */{'}'}
<a className="flex items-center gap-3 px-4 py-3 border-l-4 border-secondary-container text-secondary-container bg-on-primary-container/10 font-label-md text-label-md rounded-r-lg transition-all duration-200 active:scale-95" href="#">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">group</span>
                User Management
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-primary-container hover:text-on-primary hover:bg-on-primary-container/5 transition-colors font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined">domain</span>
                Property Listings
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-primary-container hover:text-on-primary hover:bg-on-primary-container/5 transition-colors font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined">payments</span>
                Transactions
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-primary-container hover:text-on-primary hover:bg-on-primary-container/5 transition-colors font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
                Settings
            </a>
</nav>
<div className="p-4 bg-on-primary-container/5 m-4 rounded-xl border border-outline-variant/10">
<button className="w-full bg-secondary-container text-primary font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95">
<span className="material-symbols-outlined">add</span>
                Add New User
            </button>
</div>
</aside>
{'{'}/* Main Content Shell */{'}'}
<main className="ml-64 min-h-screen flex flex-col">
{'{'}/* TopAppBar */{'}'}
<header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 border-b border-outline-variant bg-surface flex justify-between items-center h-16 px-6">
<div className="flex items-center flex-1 max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all" placeholder="Search for users, IDs, or activity..." type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">help</span>
</button>
<div className="h-8 w-[1px] bg-outline-variant/50 mx-2"></div>
<div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-surface-container-high transition-colors">
<div className="text-right">
<p className="text-label-md font-bold text-primary">Admin_Tolu</p>
<p className="text-[10px] text-on-surface-variant">Super Admin</p>
</div>
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-[12px] font-bold">TA</div>
</div>
</div>
</header>
{'{'}/* Content Canvas */{'}'}
<div className="mt-16 p-lg space-y-lg flex-1 overflow-y-auto custom-scrollbar bg-surface-bright">
{'{'}/* Summary Row */{'}'}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-4">
<div className="p-3 bg-primary-container/5 rounded-lg text-primary">
<span className="material-symbols-outlined text-[32px]">group</span>
</div>
<div>
<p className="text-label-sm text-on-surface-variant">Total Users</p>
<h2 className="text-headline-md font-bold text-primary">24,502</h2>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-4">
<div className="p-3 bg-tertiary-container/5 rounded-lg text-on-tertiary-container">
<span className="material-symbols-outlined text-[32px]">bolt</span>
</div>
<div>
<p className="text-label-sm text-on-surface-variant">Active Today</p>
<h2 className="text-headline-md font-bold text-on-tertiary-container">1,240</h2>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-4">
<div className="p-3 bg-secondary-container/10 rounded-lg text-secondary">
<span className="material-symbols-outlined text-[32px]">verified_user</span>
</div>
<div>
<p className="text-label-sm text-on-surface-variant">Pending Verification</p>
<h2 className="text-headline-md font-bold text-secondary">84</h2>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-4">
<div className="p-3 bg-error-container rounded-lg text-error">
<span className="material-symbols-outlined text-[32px]">report</span>
</div>
<div>
<p className="text-label-sm text-on-surface-variant">Flagged Accounts</p>
<h2 className="text-headline-md font-bold text-error">12</h2>
</div>
</div>
</div>
{'{'}/* Management Table Section */{'}'}
<section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
{'{'}/* Filters Header */{'}'}
<div className="p-lg border-b border-outline-variant bg-white flex flex-wrap items-center justify-between gap-4">
<div className="flex flex-wrap items-center gap-4">
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Name or Email" type="text"/>
</div>
<select className="border border-outline-variant rounded-lg px-4 py-2 text-body-sm bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/10 outline-none min-w-[140px]">
<option value="">All Roles</option>
<option>Tenant</option>
<option>Landlord</option>
<option>Agent</option>
<option>Estate Manager</option>
</select>
<select className="border border-outline-variant rounded-lg px-4 py-2 text-body-sm bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/10 outline-none min-w-[140px]">
<option value="">Verification Level</option>
<option>Level 1</option>
<option>Level 2</option>
<option>Level 3</option>
<option>Level 4</option>
<option>Level 5</option>
</select>
<select className="border border-outline-variant rounded-lg px-4 py-2 text-body-sm bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/10 outline-none min-w-[140px]">
<option value="">Status</option>
<option>Active</option>
<option>Suspended</option>
<option>Inactive</option>
</select>
</div>
<button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md transition-all active:scale-95 shadow-sm">
<span className="material-symbols-outlined text-sm">filter_list</span>
                        Advanced Filters
                    </button>
</div>
{'{'}/* Table Content */{'}'}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant">
<th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">User</th>
<th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Role</th>
<th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Status</th>
<th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Verification</th>
<th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider">Joined Date</th>
<th className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/50">
{'{'}/* Row 1 */{'}'}
<tr className="row-hover-effect transition-all duration-200">
<td className="px-lg py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary-container font-bold">CO</div>
<div>
<p className="font-bold text-primary">Chidi Okoro</p>
<p className="text-body-sm text-on-surface-variant">chidi.okoro@example.ng</p>
</div>
</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm text-on-surface-variant font-medium">Landlord</span>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2 text-on-tertiary-container font-medium">
<span className="w-2 h-2 bg-on-tertiary-container rounded-full"></span>
                                        Active
                                    </div>
</td>
<td className="px-lg py-4">
<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-on-tertiary-container/10 text-on-tertiary-container font-label-sm text-label-sm border border-on-tertiary-container/20">
<span className="material-symbols-outlined text-[14px]">stars</span>
                                        Level 5
                                    </div>
</td>
<td className="px-lg py-4 text-on-surface-variant text-body-sm">
                                    Oct 12, 2023
                                </td>
<td className="px-lg py-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-label-md text-label-sm underline decoration-primary/20">View Profile</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
<span className="material-symbols-outlined">more_vert</span>
</button>
</div>
</td>
</tr>
{'{'}/* Row 2 */{'}'}
<tr className="row-hover-effect transition-all duration-200">
<td className="px-lg py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold">AA</div>
<div>
<p className="font-bold text-primary">Amina Abubakar</p>
<p className="text-body-sm text-on-surface-variant">a.abubakar@realestate.com</p>
</div>
</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm text-on-surface-variant font-medium">Agent</span>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2 text-secondary font-medium">
<span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                                        Suspended
                                    </div>
</td>
<td className="px-lg py-4">
<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm border border-secondary/20">
<span className="material-symbols-outlined text-[14px]">shield</span>
                                        Level 3
                                    </div>
</td>
<td className="px-lg py-4 text-on-surface-variant text-body-sm">
                                    Jan 05, 2024
                                </td>
<td className="px-lg py-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-label-md text-label-sm underline decoration-primary/20">View Profile</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
<span className="material-symbols-outlined">more_vert</span>
</button>
</div>
</td>
</tr>
{'{'}/* Row 3 */{'}'}
<tr className="row-hover-effect transition-all duration-200">
<td className="px-lg py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant font-bold">EM</div>
<div>
<p className="font-bold text-primary">Emeka Mensah</p>
<p className="text-body-sm text-on-surface-variant">emeka.m@gmail.com</p>
</div>
</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm text-on-surface-variant font-medium">Tenant</span>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2 text-on-surface-variant font-medium">
<span className="w-2 h-2 bg-outline rounded-full"></span>
                                        Inactive
                                    </div>
</td>
<td className="px-lg py-4">
<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">lock_open</span>
                                        Level 1
                                    </div>
</td>
<td className="px-lg py-4 text-on-surface-variant text-body-sm">
                                    Mar 22, 2024
                                </td>
<td className="px-lg py-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-label-md text-label-sm underline decoration-primary/20">View Profile</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
<span className="material-symbols-outlined">more_vert</span>
</button>
</div>
</td>
</tr>
{'{'}/* Row 4 */{'}'}
<tr className="row-hover-effect transition-all duration-200">
<td className="px-lg py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed font-bold">SJ</div>
<div>
<p className="font-bold text-primary">Sarah Johnson</p>
<p className="text-body-sm text-on-surface-variant">s.johnson@propati.manager</p>
</div>
</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm text-on-surface-variant font-medium">Estate Manager</span>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2 text-on-tertiary-container font-medium">
<span className="w-2 h-2 bg-on-tertiary-container rounded-full"></span>
                                        Active
                                    </div>
</td>
<td className="px-lg py-4">
<div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-on-tertiary-container/10 text-on-tertiary-container font-label-sm text-label-sm border border-on-tertiary-container/20 relative overflow-hidden">
<div className="verification-shimmer absolute inset-0 opacity-20"></div>
<span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                                        Level 4
                                    </div>
</td>
<td className="px-lg py-4 text-on-surface-variant text-body-sm">
                                    Nov 30, 2023
                                </td>
<td className="px-lg py-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-label-md text-label-sm underline decoration-primary/20">View Profile</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
<span className="material-symbols-outlined">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{'{'}/* Pagination Footer */{'}'}
<div className="p-lg border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
<p className="text-body-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">1 - 10</span> of 24,502 users</p>
<div className="flex items-center gap-1">
<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30" disabled={true}>
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-sm">1</button>
<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors">2</button>
<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors">3</button>
<span className="px-2 text-on-surface-variant">...</span>
<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors">245</button>
<button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</section>
</div>
{'{'}/* Floating Action Button (for specific tasks only) */{'}'}
{'{'}/* Suppressed per Relevance Check: Primary action 'Add New User' is in Sidebar and Header logic could handle it, but adding a subtle FAB for 'Support/Reports' could be valid if allowed, however we will follow the suppression rule for Details/Transactional. */{'}'}
</main>


    </DashboardShell>
  );
}

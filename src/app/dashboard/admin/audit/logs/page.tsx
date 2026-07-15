'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuditLogsPagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from system_audit_logs_propati_admin.html */}
      
{'{'}/* Main Sidebar Shell */{'}'}

{'{'}/* Top App Bar Shell */{'}'}
<header className="fixed top-0 left-64 right-0 h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-lg z-40">
<div className="flex items-center w-1/3">
<div className="relative w-full max-w-sm">
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
    <MaterialIcon name="search" className="material-symbols-outlined" />
  </span>
  <input className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded-lg bg-surface-container-low text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Search audit events, IPs, or admins..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
<MaterialIcon name="notifications" className="material-symbols-outlined" />
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
<MaterialIcon name="help" className="material-symbols-outlined" />
</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
<MaterialIcon name="settings" className="material-symbols-outlined" />
</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
<div className="flex items-center gap-3 cursor-pointer group">
<div className="text-right hidden md:block">
<p className="font-label-md text-label-md text-on-surface font-bold">Ade Ben-G.</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Super Admin</p>
</div>
<img className="w-10 h-10 rounded-full object-cover border-2 border-outline-variant group-hover:border-primary transition-colors" data-alt="Close up professional portrait of a tech executive wearing glasses and a smart-casual blazer, set against a blurred high-tech corporate office interior with navy and wood accents, sharp focus, premium corporate photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYuboVJkW6HSl9KjyjwFRIX2Zo__cpRDOpgyp70VRQsrf8GqM_axp0Bkwef3hBlwIfKZjt6vnNCtaGRS39KjsqRKle2Qhl1JFPzy3cRvJz8k4Gmx5cwD4637L8lh3gdcRpB9BRcaXc9QpwPfJbZJO1xNnQo0dWJEFAkLhIB4Hd7XDza73I_Ft_B3KLvcyzf-YFT_2Zpir1K0S__lbglUENP-jU7Gj-bCEF7JTtQKSW6zsngqj8j-Bkir0eKSMREaFoTg_pGOJYn5I"/>
</div>
</div>
</header>
{'{'}/* Main Content Canvas */{'}'}
<main className="ml-64 mt-16 p-lg min-h-screen">
{'{'}/* Header Section */{'}'}
<div className="mb-lg">
<h2 className="font-headline-md text-headline-md text-primary">System Audit Logs</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Comprehensive immutable records of all administrative and system-level activities.</p>
</div>
{'{'}/* Metrics Row */{'}'}
<div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
{'{'}/* Metric Card 1 */{'}'}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-start justify-between">
<div>
<p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Events (24h)</p>
<h3 className="font-headline-lg text-headline-lg text-primary">12,842</h3>
<p className="text-on-tertiary-container flex items-center font-label-sm text-label-sm mt-2">
<MaterialIcon name="trending_up" className="material-symbols-outlined" />
                        +14.2% from yesterday
                    </p>
</div>
<div className="bg-surface-container-low p-3 rounded-lg text-primary">
<MaterialIcon name="query_stats" className="material-symbols-outlined" />
</div>
</div>
{'{'}/* Metric Card 2 */{'}'}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-start justify-between">
<div>
<p className="font-label-md text-label-md text-on-surface-variant mb-1">Security Flags</p>
<h3 className="font-headline-lg text-headline-lg text-error">24</h3>
<p className="text-error flex items-center font-label-sm text-label-sm mt-2">
<MaterialIcon name="warning" className="material-symbols-outlined" />
                        3 critical pending review
                    </p>
</div>
<div className="bg-error-container p-3 rounded-lg text-on-error-container">
<MaterialIcon name="gpp_maybe" className="material-symbols-outlined" />
</div>
</div>
{'{'}/* Metric Card 3 */{'}'}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-start justify-between">
<div>
<p className="font-label-md text-label-md text-on-surface-variant mb-1">Admin Actions</p>
<h3 className="font-headline-lg text-headline-lg text-primary">458</h3>
<p className="text-on-surface-variant flex items-center font-label-sm text-label-sm mt-2">
                        Across 12 active administrators
                    </p>
</div>
<div className="bg-secondary-fixed p-3 rounded-lg text-on-secondary-fixed">
<MaterialIcon name="admin_panel_settings" className="material-symbols-outlined" />
</div>
</div>
</div>
{'{'}/* Filter Bar */{'}'}
<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant mb-lg flex flex-wrap items-center gap-4">
<div className="flex items-center gap-2">
<MaterialIcon name="filter_list" className="material-symbols-outlined" />
<span className="font-label-md text-label-md text-on-surface font-bold">Filters</span>
</div>
<div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
{'{'}/* Date Range */{'}'}
<div className="relative">
<button className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded-lg font-label-md text-label-md bg-surface hover:bg-surface-container-low transition-colors">
<span>Oct 20 - Oct 27, 2023</span>
<MaterialIcon name="calendar_today" className="material-symbols-outlined" />
</button>
</div>
{'{'}/* Administrator */{'}'}
<select className="px-3 py-2 border border-outline-variant rounded-lg font-label-md text-label-md bg-surface focus:ring-primary focus:border-primary">
<option>All Administrators</option>
<option>Ade Ben-G.</option>
<option>Adewale K.</option>
<option>Chioma O.</option>
</select>
{'{'}/* Action Type */{'}'}
<select className="px-3 py-2 border border-outline-variant rounded-lg font-label-md text-label-md bg-surface focus:ring-primary focus:border-primary">
<option>All Action Types</option>
<option>Create</option>
<option>Update</option>
<option>Delete</option>
<option>Verify</option>
<option>Login</option>
</select>
{'{'}/* Severity */{'}'}
<select className="px-3 py-2 border border-outline-variant rounded-lg font-label-md text-label-md bg-surface focus:ring-primary focus:border-primary">
<option>All Severity Levels</option>
<option>Low</option>
<option>Medium</option>
<option>High / Critical</option>
</select>
<button className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
<MaterialIcon name="download" className="material-symbols-outlined" />
                Export CSV
            </button>
</div>
{'{'}/* Main Audit Table Section */{'}'}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
<div className="overflow-x-auto custom-scrollbar">
<table className="w-full border-collapse text-left">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant">
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Timestamp</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Administrator</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Module</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Action</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">Description</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">IP Address</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider text-center">Detail</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{'{'}/* Row 1: High Severity */{'}'}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4 whitespace-nowrap">
<p className="font-label-md text-label-md text-on-surface">Oct 27, 2023</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">14:22:10 WAT</p>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full border border-outline-variant" data-alt="Portrait of a male professional in his 40s with a warm and approachable expression, short hair, wearing a clean white dress shirt, studio lighting, corporate aesthetic with a soft blue background tint." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDItnq8DVTZDFsNV98HeqZ1gULDnVquKYJw-EHGTWf14OShcsie9pNc9fY4cRmBxf31Yk11dTc6hNSmEQMrzDf7cA5HuiIjM22ZY7rEPem1V6zVPmebqmbE-XfotGjnma9YV3XaiITPdKQPZi7VvXweaHBCneJgNlCwKVAD6wDwktPKh6pMhZbPM1xdRo3dF4Tp09puDqqL6H8HhMcdYojRVCaoeWbtuDy7-O5PDeHXQ2LQB3Pp63Xqv9clvC2z6WYn3Am-niB8xo"/>
<span className="font-label-md text-label-md text-on-surface font-semibold">Ade Ben-G.</span>
</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container-high text-primary uppercase">RBAC</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-label-md text-label-md text-on-surface">Permission Update</span>
</div>
</td>
<td className="px-6 py-4">
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs truncate">Modified Verification Officer role permissions to include Escrow release access.</p>
</td>
<td className="px-6 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
                                192.168.1.104
                            </td>
<td className="px-6 py-4 text-center">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<MaterialIcon name="visibility" className="material-symbols-outlined" />
</button>
</td>
</tr>
{'{'}/* Row 2: Success/Info */{'}'}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4 whitespace-nowrap">
<p className="font-label-md text-label-md text-on-surface">Oct 27, 2023</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">13:45:02 WAT</p>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full border border-outline-variant" data-alt="Professional headshot of a younger female administrator with a friendly yet professional smile, braided hair, wearing a navy blazer, high-quality corporate photography, minimalist bright background with emerald green accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuClOB-z4Ti_Kavd0QCD4EI0r35fiWSyO9q7CkL6jeVjuuRg7-cIigpH53CsBuRRNqRpspqbvHtqQ0bn5Fipt1DxXCeySb3q-JoTqOmXNthyjvVGgRD9pAeOeOOqzmiu8bqZnBL6w3QmXjSVVG-0ZOoj0qLj5zk4FIBG4yxMnYngt9RHsOthEb0r-I3moo0gu7NTtfArH_kCATyhjOC4qz4VcjCNzWJpj2NWtakiq-mcJAba29R1n7BLmGiIPtThU74WZUZgVa4KFO8"/>
<span className="font-label-md text-label-md text-on-surface font-semibold">Adewale K.</span>
</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container-high text-primary uppercase">Property Listings</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="font-label-md text-label-md text-on-surface">Property Verified</span>
</div>
</td>
<td className="px-6 py-4">
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs truncate">Verified "The Obsidian Penthouse" - LVL 5, Block C.</p>
</td>
<td className="px-6 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
                                102.89.33.210
                            </td>
<td className="px-6 py-4 text-center">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<MaterialIcon name="visibility" className="material-symbols-outlined" />
</button>
</td>
</tr>
{'{'}/* Row 3: Warning/Escrow */{'}'}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4 whitespace-nowrap">
<p className="font-label-md text-label-md text-on-surface">Oct 27, 2023</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">12:10:55 WAT</p>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full border border-outline-variant" data-alt="Portrait of a senior male executive in a grey suit, distinguished silver hair, very professional and authoritative presence, clean minimalist office background with soft amber lighting, high-contrast digital photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTWFUkMshtc_fb6K_Y8UfWJ-szg5J1fMo-xXLpcEBvbaez8qLjV8gln8wlfNg5avlQhVqgc4OcBY_G0RKKBgNmJPNUnKdUunDJZSwtTszzq5eEUu5Tmlb1t_f-86IzQhOO9KxKPUKYyqo3r08FvKw_-6uJF10r6zZGzdBk9qI6kSseGUJHBqZ0SdQLUxizI00rONSKHFX9Qs9ZSqZCySZxAH0R2K448QG9I0ACcumYJsPqmat91dExQ0D7i5oleCbAPVNrqK1V53M"/>
<span className="font-label-md text-label-md text-on-surface font-semibold">Chioma O.</span>
</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container-high text-primary uppercase">Escrow</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary-container"></span>
<span className="font-label-md text-label-md text-on-surface">Funds Released</span>
</div>
</td>
<td className="px-6 py-4">
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs truncate">Released ₦24,500,000 for Transaction #PRP-9022-X.</p>
</td>
<td className="px-6 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
                                41.190.2.14
                            </td>
<td className="px-6 py-4 text-center">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<MaterialIcon name="visibility" className="material-symbols-outlined" />
</button>
</td>
</tr>
{'{'}/* Row 4: Security/System */{'}'}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="px-6 py-4 whitespace-nowrap">
<p className="font-label-md text-label-md text-on-surface">Oct 27, 2023</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">11:02:18 WAT</p>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[14px] text-white font-bold">SY</div>
<span className="font-label-md text-label-md text-on-surface font-semibold">System Bot</span>
</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container-high text-primary uppercase">Security</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-label-md text-label-md text-on-surface">Login Attempt Blocked</span>
</div>
</td>
<td className="px-6 py-4">
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs truncate">Multiple failed attempts from suspicious IP range in North America.</p>
</td>
<td className="px-6 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
                                72.14.192.11
                            </td>
<td className="px-6 py-4 text-center">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<MaterialIcon name="visibility" className="material-symbols-outlined" />
</button>
</td>
</tr>
{'{'}/* Filling out the rest with mock data rows for density */{'}'}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-6 py-4 whitespace-nowrap">
<p className="font-label-md text-label-md text-on-surface">Oct 27, 2023</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">10:50:33 WAT</p>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full border border-outline-variant" data-alt="Close up professional portrait of a tech executive wearing glasses and a smart-casual blazer, set against a blurred high-tech corporate office interior with navy and wood accents, sharp focus, premium corporate photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxOPDbbUdCtHv5OuAbGbohkv0aqHW0Uhz66OnFyFI_yoTCyTRm0fFaQV1ipX8rFc_4cCw5HUfPIg9YtUKBna3GAPFjQQxgM6NBRTpbgL9efSKLaOdpesi2jOoh6GmRhPoXcO0OnYBTBEvpAZNTg8t1ZHlUoeqbuGtCOrIeVPXE4BeD6kGuHQvho8BJMvw35mSHD-SRkN8kc-QmTxsVQTebFycSjNNpWIgxhzVYUL0cEIehdgK9QLpNJj3XN8lWJaJvbgg-HSfCnDI"/>
<span className="font-label-md text-label-md text-on-surface font-semibold">Ade Ben-G.</span>
</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className="font-label-sm text-label-sm px-2 py-1 rounded bg-surface-container-high text-primary uppercase">RBAC</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
<span className="font-label-md text-label-md text-on-surface">System Login</span>
</div>
</td>
<td className="px-6 py-4">
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs truncate">Admin dashboard session initiated.</p>
</td>
<td className="px-6 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">
                                192.168.1.104
                            </td>
<td className="px-6 py-4 text-center">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<MaterialIcon name="visibility" className="material-symbols-outlined" />
</button>
</td>
</tr>
</tbody>
</table>
</div>
{'{'}/* Table Pagination */{'}'}
<div className="px-6 py-4 bg-surface border-t border-outline-variant flex items-center justify-between">
<p className="font-label-sm text-label-sm text-on-surface-variant">Showing 1 to 5 of 12,842 entries</p>
<div className="flex items-center gap-2">
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-50" disabled={true}>
<MaterialIcon name="chevron_left" className="material-symbols-outlined" />
</button>
<button className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md">1</button>
<button className="px-4 py-2 hover:bg-surface-container-low rounded-lg font-label-md text-label-md">2</button>
<button className="px-4 py-2 hover:bg-surface-container-low rounded-lg font-label-md text-label-md">3</button>
<span className="px-2 text-on-surface-variant">...</span>
<button className="px-4 py-2 hover:bg-surface-container-low rounded-lg font-label-md text-label-md">2,568</button>
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low">
<MaterialIcon name="chevron_right" className="material-symbols-outlined" />
</button>
</div>
</div>
</div>
</main>
{'{'}/* Contextual Micro-Interaction Script */{'}'}

    </DashboardShell>
  );
}

'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function OverviewPagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from admin_console_propati_overview.html */}
      
{'{'}/* Sidebar Navigation */{'}'}
<aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-primary-container text-on-primary flex flex-col py-lg z-50">
<div className="px-md mb-xl flex flex-col gap-xs">
<span className="font-headline-md text-headline-md font-extrabold text-secondary tracking-tight">EstateVerify</span>
<span className="font-label-sm text-label-sm opacity-70 tracking-widest uppercase">Admin Console</span>
</div>
<nav className="flex-grow space-y-1">
{'{'}/* Active: Dashboard */{'}'}
<a className="flex items-center gap-md px-md py-sm text-secondary border-l-4 border-secondary bg-on-primary-container/10 transition-all duration-200 translate-x-1" href="#">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary transition-all" href="#">
<span className="material-symbols-outlined">verified_user</span>
<span className="font-label-md text-label-md">Verification Queues</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary transition-all" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-md text-label-md">User Management</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary transition-all" href="#">
<span className="material-symbols-outlined">domain</span>
<span className="font-label-md text-label-md">Property Listings</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary transition-all" href="#">
<span className="material-symbols-outlined">payments</span>
<span className="font-label-md text-label-md">Transactions</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-primary/70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary transition-all" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
</nav>
<div className="px-md mt-auto pt-lg">
<button className="w-full h-[44px] flex items-center justify-center gap-sm bg-secondary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity">
<span className="material-symbols-outlined">add</span>
<span>New Report</span>
</button>
<div className="mt-xl border-t border-on-primary/10 pt-md">
<a className="flex items-center gap-md px-md py-sm text-on-primary/70 hover:text-on-primary transition-colors" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="font-label-md text-label-md">Logout</span>
</a>
</div>
</div>
</aside>
{'{'}/* Main Content Shell */{'}'}
<main className="ml-64 min-h-screen flex flex-col">
{'{'}/* Top Bar */{'}'}
<header className="h-16 flex justify-between items-center px-lg sticky top-0 bg-surface border-b border-outline-variant z-40">
<div className="flex items-center gap-lg flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full h-10 pl-10 pr-4 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary-container text-body-sm" placeholder="Search users, properties, or reports..." type="text"/>
</div>
</div>
<div className="flex items-center gap-md">
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="flex items-center gap-sm px-3 py-1.5 hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant">
<span className="material-symbols-outlined text-on-surface-variant text-[20px]">help_outline</span>
<span className="text-body-sm font-medium">Support</span>
</button>
<div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="Close-up headshot of a professional African male administrator in a clean office setting with soft natural light, wearing a tailored navy suit and smiling confidently for his profile avatar. High-end fintech aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWeC1zubKt_3ly9r9p5MhZMs-dghWmaM_PLRlZir33TL3JWAi5UM3foAIYSoF5hJdSQzr-3t71hf6xpOcI8CrBk_sCErIM3Ok7PmzxR4X4skM-0AJ8G3eDeII2ajAYIWRa3Zbr1Vc-Ha-BxcnEJ0cTWf-WfipBRXtWRSxDKLBtBVAGv1NDcbj8U79SOx3Xwol7NLg_dccu4nIPEwAgOy5z6vLSxygtbhvm-LpeJHJXy1N4U1NEQZAHYmblLGse4cbV1or6_TivoHA"/>
</div>
</div>
</header>
{'{'}/* Page Content */{'}'}
<div className="p-lg space-y-lg">
{'{'}/* Header Section */{'}'}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
<div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Platform Overview</h1>
<p className="text-on-surface-variant font-body-md">System health and verification analytics for Today.</p>
</div>
<div className="flex items-center gap-sm bg-surface-container rounded-lg p-1 border border-outline-variant">
<button className="px-md py-1.5 bg-surface text-primary font-semibold rounded shadow-sm text-body-sm">Daily</button>
<button className="px-md py-1.5 text-on-surface-variant hover:text-primary transition-colors text-body-sm">Weekly</button>
<button className="px-md py-1.5 text-on-surface-variant hover:text-primary transition-colors text-body-sm">Monthly</button>
<div className="h-4 w-[1px] bg-outline-variant mx-2"></div>
<button className="flex items-center gap-xs px-md py-1.5 text-on-surface-variant hover:text-primary transition-colors text-body-sm">
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
<span>Oct 24, 2023</span>
</button>
</div>
</div>
{'{'}/* KPI Row */{'}'}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
{'{'}/* KPI Card */{'}'}
<div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-sm bg-primary-container/5 rounded-lg">
<span className="material-symbols-outlined text-primary-container">groups</span>
</div>
<span className="text-emerald-600 flex items-center text-label-sm">
<span className="material-symbols-outlined text-[16px]">trending_up</span>
                            +12.5%
                        </span>
</div>
<div className="mt-md">
<span className="text-on-surface-variant text-label-md">Total Active Users</span>
<h2 className="text-headline-md font-bold mt-xs">18,492</h2>
</div>
</div>
<div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-sm bg-error-container/10 rounded-lg">
<span className="material-symbols-outlined text-error">priority_high</span>
</div>
<span className="text-error flex items-center text-label-sm font-bold">URGENT</span>
</div>
<div className="mt-md">
<span className="text-on-surface-variant text-label-md">Pending Verifications</span>
<h2 className="text-headline-md font-bold mt-xs">142</h2>
</div>
</div>
<div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-sm bg-secondary/10 rounded-lg">
<span className="material-symbols-outlined text-secondary">payments</span>
</div>
<span className="text-emerald-600 flex items-center text-label-sm">
<span className="material-symbols-outlined text-[16px]">trending_up</span>
                            +8.2%
                        </span>
</div>
<div className="mt-md">
<span className="text-on-surface-variant text-label-md">Platform Revenue (GTV)</span>
<h2 className="text-headline-md font-bold mt-xs">₦4.2M</h2>
</div>
</div>
<div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-sm bg-on-surface-variant/10 rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant">report</span>
</div>
<span className="text-on-surface-variant flex items-center text-label-sm">Stable</span>
</div>
<div className="mt-md">
<span className="text-on-surface-variant text-label-md">Active Disputes</span>
<h2 className="text-headline-md font-bold mt-xs">24</h2>
</div>
</div>
</div>
{'{'}/* Bento Layout Main Content */{'}'}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
{'{'}/* Verification Queue Table (Left 2/3) */{'}'}
<div className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant card-shadow overflow-hidden flex flex-col">
<div className="p-lg border-b border-outline-variant flex justify-between items-center">
<h3 className="font-headline-sm text-headline-sm text-primary">Verification Queue</h3>
<button className="text-primary-container font-semibold hover:underline text-body-sm flex items-center gap-xs">
                            View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-md border-b border-outline-variant">
<th className="px-lg py-md font-medium">Property Name</th>
<th className="px-lg py-md font-medium">Landlord</th>
<th className="px-lg py-md font-medium">Level</th>
<th className="px-lg py-md font-medium">Status</th>
<th className="px-lg py-md font-medium">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{'{'}/* Row 1 */{'}'}
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A modern luxury penthouse apartment exterior at dusk in a high-end district of Lagos, Nigeria. The architecture features clean lines, expansive glass balconies, and warm interior ambient lighting. The style is premium corporate photography with a focus on structural elegance and security." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZQtGS_U_7rXrl_GFwDaiTkpoTipdwhKc_MkpfulWe3uKmygblX9DusqUpEN3t2u5eB7DAAuI8ytc_EDSTTu172_429r-8D9NCe6QyHr1ET5eH3vbcepx66gL3_h3E4bYGydFdeweS5iEGuf2EVCb4nNgL6aOON1sQAbAY8wOKvRFEdEs8ORJtX5FysxyGe4W2wVeSo7pdmI5LRk1CSSey4MQq8CjWkw4bebM_8j6gwzsRNevfDs-gVqr4JWnUEzoeaHjTGp4NpDg"/>
</div>
<div>
<div className="font-bold text-primary">Skyline Penthouse</div>
<div className="text-body-sm text-on-surface-variant">Ikoyi, Lagos</div>
</div>
</div>
</td>
<td className="px-lg py-md text-body-md">Obi Okonjo</td>
<td className="px-lg py-md">
<span className="inline-block px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed font-label-md text-xs verification-shimmer">
                                            LEVEL 5
                                        </span>
</td>
<td className="px-lg py-md">
<span className="px-sm py-1 rounded bg-secondary-container/20 text-secondary-container font-medium text-xs border border-secondary-container/30 uppercase">Review</span>
</td>
<td className="px-lg py-md">
<button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary-container">
<span className="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
{'{'}/* Row 2 */{'}'}
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A sunlit contemporary suburban villa with a manicured lawn and geometric stone paving. The house features a neutral palette with warm wooden accents and large windows. Professional real estate photography style, vibrant yet composed, communicating trust and premium living." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzn8ovhPnQdweN3-rzvricduuF78zdhf1TG4Q0bhL-18HFlCkuB7a2u9D4MUH7guBLJt5cAhF8qEqhNtxM7wiblirNefKQ1jzk1qpgz8tQyKDZLM8GCQGcbiEMTcWffjBkSVXS_zN3acaBl3PY08wSLuR8PTZKfYDzKCvYaJQ6oLtNAUrLJ23Cob1LqKiq4OLcUx0Aq1mjkJa6WMsXqtXJRgGnbOVJC2la0kvPmUtELxa9I-6_0YLvkSTqdH8R6uOH5Orkrw-LRx4"/>
</div>
<div>
<div className="font-bold text-primary">Emerald Gardens</div>
<div className="text-body-sm text-on-surface-variant">Lekki Phase 1</div>
</div>
</div>
</td>
<td className="px-lg py-md text-body-md">Fatima Yusuf</td>
<td className="px-lg py-md">
<span className="inline-block px-3 py-1 rounded-full bg-outline-variant/20 text-on-surface font-label-md text-xs">
                                            LEVEL 2
                                        </span>
</td>
<td className="px-lg py-md">
<span className="px-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-medium text-xs border border-outline-variant uppercase">Pending</span>
</td>
<td className="px-lg py-md">
<button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary-container">
<span className="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
{'{'}/* Row 3 */{'}'}
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Close-up of a modern brick-and-glass duplex entry. Sharp architectural details, high-contrast shadows, and a sense of premium security. The lighting is crisp afternoon sun, highlighting the clean textures of the property. Corporate Nigerian real estate aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6IjP3j4GUupO49vDH-v39spYdAfgMLRcVaB6hF1ACSoSkQjVhu54-bAcGPiav_TWNYixSaYLAZmI_3zaQfQ0vSDCs4_Mpuf_SNuooO32bbH4YkzKST0noZo5F-9uYatwQn85VZcZnMVOamDiMwevjJ6o3kH0h6DJRE4mt9FVRUwzDtHMaweKSPj6ZhqclcjJdeYdrKsk5nmELNehao7MaHcOm1nU5adbHLydpZEX-R7xDTy-XLqC9WgxSubfhk49Kz6LwYcR6qTA"/>
</div>
<div>
<div className="font-bold text-primary">The Apex Duplex</div>
<div className="text-body-sm text-on-surface-variant">Victoria Island</div>
</div>
</div>
</td>
<td className="px-lg py-md text-body-md">Chidi Nwosu</td>
<td className="px-lg py-md">
<span className="inline-block px-3 py-1 rounded-full bg-secondary-fixed text-secondary-fixed-dim font-label-md text-xs" style="background: linear-gradient(135deg, #835500, #ffb955); color: white;">
                                            LEVEL 4
                                        </span>
</td>
<td className="px-lg py-md">
<span className="px-sm py-1 rounded bg-error-container/20 text-error font-medium text-xs border border-error/30 uppercase">Action Required</span>
</td>
<td className="px-lg py-md">
<button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary-container">
<span className="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{'{'}/* Risk Alerts (Right 1/3) */{'}'}
<div className="bg-surface rounded-xl border border-outline-variant card-shadow p-lg flex flex-col">
<div className="flex items-center justify-between mb-lg">
<h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-sm">
<span className="material-symbols-outlined text-error">warning</span>
                            Risk Alerts
                        </h3>
<span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold">4 NEW</span>
</div>
<div className="space-y-md">
{'{'}/* Alert Item */{'}'}
<div className="p-md bg-error-container/5 border-l-4 border-error rounded-r-lg hover:bg-error-container/10 transition-colors">
<div className="flex justify-between items-start">
<span className="font-bold text-primary text-body-sm">Flagged Account: @user829</span>
<span className="text-[10px] text-on-surface-variant uppercase">14m ago</span>
</div>
<p className="text-body-sm text-on-surface-variant mt-1">High frequency transaction pattern detected from unverified IP.</p>
<div className="mt-sm flex gap-sm">
<button className="text-xs font-bold text-error hover:underline">Investigate</button>
<button className="text-xs font-bold text-on-surface-variant hover:underline">Dismiss</button>
</div>
</div>
<div className="p-md bg-surface-container-high border-l-4 border-secondary rounded-r-lg">
<div className="flex justify-between items-start">
<span className="font-bold text-primary text-body-sm">Listing Discrepancy</span>
<span className="text-[10px] text-on-surface-variant uppercase">2h ago</span>
</div>
<p className="text-body-sm text-on-surface-variant mt-1">"Maitama Manor" coordinates don't match provided land registry docs.</p>
<div className="mt-sm flex gap-sm">
<button className="text-xs font-bold text-primary-container hover:underline">Verify Map</button>
</div>
</div>
<div className="p-md bg-surface-container border-l-4 border-outline rounded-r-lg">
<div className="flex justify-between items-start">
<span className="font-bold text-primary text-body-sm">Suspicious Withdrawal</span>
<span className="text-[10px] text-on-surface-variant uppercase">4h ago</span>
</div>
<p className="text-body-sm text-on-surface-variant mt-1">₦850,000 flagged for manual AML review.</p>
</div>
</div>
<button className="mt-auto w-full py-2 border border-outline text-on-surface-variant text-body-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
                        Security Log History
                    </button>
</div>
{'{'}/* Platform Activity Chart (Full Width Bottom) */{'}'}
<div className="lg:col-span-3 bg-primary-container text-on-primary rounded-xl p-lg relative overflow-hidden h-[320px]">
{'{'}/* Background texture/pattern using CSS only */{'}'}
<div className="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
<div className="relative z-10 flex flex-col h-full">
<div className="flex justify-between items-center mb-xl">
<div>
<h3 className="font-headline-sm text-headline-sm">Platform Growth Trends</h3>
<p className="text-on-primary-container font-body-sm">New Listings vs Verified Users (Last 30 Days)</p>
</div>
<div className="flex gap-lg">
<div className="flex items-center gap-sm">
<span className="w-3 h-3 rounded-full bg-secondary"></span>
<span className="text-body-sm">Listings</span>
</div>
<div className="flex items-center gap-sm">
<span className="w-3 h-3 rounded-full bg-tertiary-fixed"></span>
<span className="text-body-sm">Verified Users</span>
</div>
</div>
</div>
{'{'}/* Visual representation of a chart using divs */{'}'}
<div className="flex-grow flex items-end gap-md pb-md">
{'{'}/* Chart bars */{'}'}
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[30%]"></div>
<div className="w-full bg-tertiary-fixed opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[45%]"></div>
</div>
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[40%]"></div>
<div className="w-full bg-tertiary-fixed opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[55%]"></div>
</div>
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[60%]"></div>
<div className="w-full bg-tertiary-fixed opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[50%]"></div>
</div>
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[75%]"></div>
<div className="w-full bg-tertiary-fixed opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[85%]"></div>
</div>
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-100 rounded-t-sm h-[85%]"></div>
<div className="w-full bg-tertiary-fixed opacity-100 rounded-t-sm h-[95%]"></div>
</div>
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[65%]"></div>
<div className="w-full bg-tertiary-fixed opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[70%]"></div>
</div>
<div className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer">
<div className="w-full bg-secondary opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[50%]"></div>
<div className="w-full bg-tertiary-fixed opacity-40 hover:opacity-100 transition-all rounded-t-sm h-[60%]"></div>
</div>
</div>
<div className="flex justify-between border-t border-on-primary/10 pt-sm text-[10px] text-on-primary-container font-medium uppercase tracking-widest">
<span>Week 1</span>
<span>Week 2</span>
<span>Week 3</span>
<span>Week 4</span>
</div>
</div>
</div>
</div>
</div>
{'{'}/* Footer / System Status */{'}'}
<footer className="mt-auto px-lg py-md border-t border-outline-variant bg-surface-container-low flex justify-between items-center text-on-surface-variant text-label-sm">
<div className="flex items-center gap-md">
<span className="flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    API: Healthy
                </span>
<span>Node: NG-LAG-01</span>
</div>
<div>
                © 2023 EstateVerify Systems. Secure Administrative Access.
            </div>
</footer>
</main>


    </DashboardShell>
  );
}

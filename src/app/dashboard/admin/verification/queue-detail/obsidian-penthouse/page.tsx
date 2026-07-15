'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';
import MaterialIcon from '@/components/icons/material-icon';


export default function VerificationQueueDetailObsidianPenthousePagePagePage() {
  const { user } = useUser();
  
  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from verification_queue_detail_the_obsidian_penthouse_propati_admin.html */}
      
{'{'}/* SideNavBar (Shared Component) */{'}'}

{'{'}/* Main Content Wrapper */{'}'}
<main className="md:ml-64 flex flex-col min-h-screen">
{'{'}/* TopNavBar (Shared Component) */{'}'}
<header className="bg-surface sticky top-0 z-40 border-b border-outline-variant flex justify-between items-center px-lg py-sm w-full">
<div className="flex items-center gap-lg">
<div className="md:hidden">
<MaterialIcon name="menu" className="material-symbols-outlined" />
</div>
<div className="relative">
<MaterialIcon name="search" className="material-symbols-outlined" />
<input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full w-64 focus:ring-2 focus:ring-primary-container font-body-sm" placeholder="Search queues..." type="text"/>
</div>
</div>
<div className="flex items-center gap-md">
<button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
<MaterialIcon name="notifications" className="material-symbols-outlined" />
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="flex items-center gap-sm px-4 py-2 hover:bg-surface-container-high rounded-full transition-colors border border-outline-variant">
<MaterialIcon name="help_outline" className="material-symbols-outlined" />
<span className="font-label-md">Support</span>
</button>
<div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline">
<img alt="Admin profile avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC4bj5GQIeefqP7dZGU5l6bbReYFGOQlhCpFOG-yyW3P_n4pg0l_ZKS1GuBOdGMPqd1SKeI8cKz7OKkZK7TquSO1wmVoI25q4JwvVx52_Jsy5PlCgTiTmFTi2Xa6z85GRHK6t71CSKxApDrTVMDPLj83M9cLb_ZkwCQLPVv4adMgIp-KUx3gIy2FU3uNdYdCmZz_s4WIbPiKqVJEa3uT3c41TOTgY2Y2f_j84MbfrJyYMEqqEcybErMJsiKPk8O8d4YewMS841KyE"/>
</div>
</div>
</header>
{'{'}/* Page Content */{'}'}
<div className="p-lg space-y-lg max-w-[1400px] mx-auto w-full">
{'{'}/* Breadcrumbs & Actions */{'}'}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
<div className="space-y-xs">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm">
<MaterialIcon name="Queues" className="material-symbols-outlined" />
<MaterialIcon name="chevron_right" className="material-symbols-outlined" />
<MaterialIcon name="High Priority" className="material-symbols-outlined" />
<MaterialIcon name="chevron_right" className="material-symbols-outlined" />
<span className="text-primary">#EV-98231</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary">The Obsidian Penthouse</h2>
<div className="flex items-center gap-sm">
<span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full font-label-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                            INSPECTED
                        </span>
<span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-label-sm">
                            Created 2h ago
                        </span>
</div>
</div>
<div className="flex items-center gap-sm">
<button className="px-lg py-sm border border-outline text-primary rounded-lg font-bold hover:bg-surface-container-low transition-colors">
                        Request Info
                    </button>
<button className="px-lg py-sm bg-error text-on-error rounded-lg font-bold hover:opacity-90 transition-opacity">
                        Reject
                    </button>
<button className="px-lg py-sm bg-primary-container text-on-primary rounded-lg font-bold shadow-lg hover:translate-y-[-2px] transition-all">
                        Approve & Certify
                    </button>
</div>
</div>
{'{'}/* Bento Grid Content */{'}'}
<div className="bento-grid">
{'{'}/* Verification Status Tracker */{'}'}
<div className="col-span-12 lg:col-span-4 glass-card rounded-lg p-lg space-y-lg shadow-sm">
<h3 className="font-headline-sm text-headline-sm text-primary">Verification Pipeline</h3>
<div className="space-y-6 relative">
{'{'}/* Connecting Line */{'}'}
<div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-outline-variant"></div>
{'{'}/* Step 1 */{'}'}
<div className="flex gap-md relative">
<div className="w-6 h-6 rounded-full bg-on-tertiary-container text-white flex items-center justify-center z-10">
<MaterialIcon name="check" className="material-symbols-outlined" />
</div>
<div className="flex-grow">
<p className="font-label-md text-primary">KYC Submission</p>
<p className="text-body-sm text-on-surface-variant">Validated via NimC Gateway</p>
</div>
</div>
{'{'}/* Step 2 */{'}'}
<div className="flex gap-md relative">
<div className="w-6 h-6 rounded-full bg-on-tertiary-container text-white flex items-center justify-center z-10">
<MaterialIcon name="check" className="material-symbols-outlined" />
</div>
<div className="flex-grow">
<p className="font-label-md text-primary">C of O Verification</p>
<p className="text-body-sm text-on-surface-variant">Lagos Land Registry Match</p>
</div>
</div>
{'{'}/* Step 3 */{'}'}
<div className="flex gap-md relative">
<div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center z-10 ring-4 ring-background">
<MaterialIcon name="pending" className="material-symbols-outlined" />
</div>
<div className="flex-grow">
<p className="font-label-md text-secondary">Physical Inspection</p>
<p className="text-body-sm text-on-surface-variant">Agent: Funke Akindele • Pending Review</p>
</div>
</div>
{'{'}/* Step 4 */{'}'}
<div className="flex gap-md relative">
<div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center z-10">
<MaterialIcon name="radio_button_unchecked" className="material-symbols-outlined" />
</div>
<div className="flex-grow">
<p className="font-label-md text-on-surface-variant">Final Certification</p>
<p className="text-body-sm text-on-surface-variant opacity-60">Signature Required</p>
</div>
</div>
</div>
</div>
{'{'}/* Property Details & Inspection Report */{'}'}
<div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-lg">
{'{'}/* Owner Info */{'}'}
<div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg space-y-md">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Property Owner</h4>
<span className="px-2 py-0.5 bg-on-tertiary-container/10 text-on-tertiary-container rounded font-label-sm">MATCHED 98%</span>
</div>
<div className="flex items-center gap-md">
<img alt="Owner avatar" className="w-12 h-12 rounded-full border border-outline" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRtVkTaJtRyCVW7YClt5jsc2v2_klnwX2OEojt3Ht0JZoh9tP55l32XVouzrCafjRxTqn0gXWoLQlMwZ7dUOMRQqvfPbBGwj5C9ADSl4K9W5PO0CLYKtPZOeCjg0c64x6OB0Z-1n8t1vVKyUqFNBoA9xJ7bu9kOue7rsijLpShIHReVxnkQXuLs4vtzyIYUV2t9Bd33yaqmh69JV0dYYiD1Y__xfrysY3JM1pZ8SSp_PFIT4oEmtJcJNE1tuX5MadK9GpxIFq6ABM"/>
<div>
<p className="font-headline-sm text-primary">Emeka Adeyemi</p>
<p className="text-body-sm text-on-surface-variant">Verified BVN: 221****092</p>
</div>
</div>
</div>
{'{'}/* Location Insight */{'}'}
<div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg space-y-md">
<h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Location Signature</h4>
<div className="space-y-1">
<p className="font-headline-sm text-primary">Banana Island, Ikoyi</p>
<p className="text-body-sm text-on-surface-variant flex items-center gap-xs">
<MaterialIcon name="location_on" className="material-symbols-outlined" />
                                Zone A, Waterfront District, Lagos
                            </p>
</div>
</div>
{'{'}/* Document Grid */{'}'}
<div className="col-span-1 md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg space-y-lg">
<h4 className="font-headline-sm text-primary">Legal Documentation</h4>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
<div className="group relative overflow-hidden rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-zoom-in">
<img alt="Certificate of Occupancy" className="w-full h-32 object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2i7-TPT6FqJ_RiV4eMfNuF9ortAX6OZ2jDO1CZj-3mgTagvRVFJa5dnl6DgdqVwfV6g85o5Ja0QjZlCGqTiGBs0wnK3RoT6HXqI9MO2cvPCNIFaNPidAz8NVbE-wRJlv51MLq8rgl4VswCKYCr3VzcNWMssvduxSd4ItCOMdKLgNZhh6A1kXW6O4oMB15KN2EIbZk_0bG1Rfa63HKwqXaqOlVJmmP2DzjoteKfWSL62-KIXsg00EdLMBCOWZ0VNghsDnZC4U77tU"/>
<div className="absolute bottom-0 inset-x-0 bg-black/60 p-2">
<p className="text-white text-[10px] font-label-sm truncate">C_of_O_Lagos_Registry.pdf</p>
</div>
</div>
<div className="group relative overflow-hidden rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-zoom-in">
<img alt="Survey Plan" className="w-full h-32 object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6xom281FrtHq7CQel9qaXaL3rxRmhejvNH51omrtIEpOSeJp2Qu6GbNFu3V573-auJ7OLCa4PZzasgoIqy7arAGtLTd7snGOKcn-CbJWd8iXX7oVHNKdAuhtfcE0sxV7swHw0Tn9ZSZIUbTCCvFgm_1SMKou77ylnIhFrmUp_1zEAefUkh7XGW7VmFyXYtx30tThwSfCfgcLJhazTU40kUbhZakgK0csCXcr4W--2zdB9dvaQ35s36V--emGQUzXqnAtryOE8W6s"/>
<div className="absolute bottom-0 inset-x-0 bg-black/60 p-2">
<p className="text-white text-[10px] font-label-sm truncate">Survey_Plan_2023.pdf</p>
</div>
</div>
<div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-lg h-32 hover:bg-surface-container-low transition-colors cursor-pointer">
<MaterialIcon name="add_circle" className="material-symbols-outlined" />
<p className="font-label-sm text-on-surface-variant mt-2">Add Document</p>
</div>
</div>
</div>
</div>
{'{'}/* Inspection Summary (Full Width) */{'}'}
<div className="col-span-12 glass-card rounded-lg p-lg space-y-lg">
<div className="flex items-center justify-between">
<h3 className="font-headline-sm text-headline-sm text-primary">Physical Inspection Report</h3>
<button className="text-secondary font-label-md flex items-center gap-xs">
                            View Full Report <MaterialIcon name="open_in_new" className="material-symbols-outlined" />
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
<div className="space-y-sm">
<p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Inspector Notes</p>
<p className="text-body-md text-on-surface italic">"The property structural integrity matches the architectural plans submitted. High-end finishing confirmed. Boundary markers are clearly visible and match survey data."</p>
</div>
<div className="space-y-sm">
<p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Utility Verification</p>
<ul className="space-y-2">
<li className="flex items-center gap-sm text-body-sm">
<MaterialIcon name="check_circle" className="material-symbols-outlined" />
                                    Independent Power Grid Access
                                </li>
<li className="flex items-center gap-sm text-body-sm">
<MaterialIcon name="check_circle" className="material-symbols-outlined" />
                                    Central Water Treatment Verified
                                </li>
<li className="flex items-center gap-sm text-body-sm">
<MaterialIcon name="check_circle" className="material-symbols-outlined" />
                                    Fibre Optic Connectivity Confirmed
                                </li>
</ul>
</div>
<div className="space-y-sm">
<p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Risk Assessment</p>
<div className="p-4 bg-on-tertiary-container/5 border-l-4 border-on-tertiary-container rounded-r-lg">
<p className="text-on-tertiary-container font-bold text-headline-sm">LOW RISK</p>
<p className="text-body-sm text-on-tertiary-container opacity-80">9.5/10 Security Score</p>
</div>
</div>
</div>
</div>
{'{'}/* Certification Preview (Asymmetric Card) */{'}'}
<div className="col-span-12 md:col-span-7 bg-primary-container text-on-primary rounded-lg p-xl relative overflow-hidden group">
<div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
<div className="relative z-10 space-y-md">
<div className="w-16 h-16 verification-badge-shimmer rounded-full flex items-center justify-center mb-md">
<span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
</div>
<h3 className="font-headline-lg text-headline-lg">EstateVerify Certified</h3>
<p className="text-body-lg text-on-primary-container max-w-md">Once approved, this property will receive the 'Diamond Certified' status, making it instantly tradable on the premium secondary market.</p>
<div className="flex gap-md pt-lg">
<div className="text-center">
<p className="font-label-sm text-secondary-container">VALIDITY</p>
<p className="font-headline-sm">24 Months</p>
</div>
<div className="w-px bg-on-primary-container/20 h-full"></div>
<div className="text-center">
<p className="font-label-sm text-secondary-container">INSURED UP TO</p>
<p className="font-headline-sm">₦500M</p>
</div>
</div>
</div>
{'{'}/* Aesthetic Corner Element */{'}'}
<div className="absolute bottom-[-10%] right-[-5%] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
<MaterialIcon name="shield" className="material-symbols-outlined" />
</div>
</div>
{'{'}/* Activity Log */{'}'}
<div className="col-span-12 md:col-span-5 glass-card rounded-lg p-lg space-y-md">
<h3 className="font-headline-sm text-primary">Audit Log</h3>
<div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
<div className="flex gap-md pb-4 border-b border-outline-variant">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center">
<MaterialIcon name="history" className="material-symbols-outlined" />
</div>
<div className="space-y-1">
<p className="text-body-sm"><span className="font-bold">System</span> automatically flagged location discrepancy</p>
<p className="text-[10px] font-label-sm text-on-surface-variant">MAY 24, 09:12 AM</p>
</div>
</div>
<div className="flex gap-md pb-4 border-b border-outline-variant">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center">
<MaterialIcon name="edit" className="material-symbols-outlined" />
</div>
<div className="space-y-1">
<p className="text-body-sm"><span className="font-bold">Admin Sarah</span> manually resolved location issue</p>
<p className="text-[10px] font-label-sm text-on-surface-variant">MAY 24, 10:45 AM</p>
</div>
</div>
<div className="flex gap-md pb-4 border-b border-outline-variant">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center">
<MaterialIcon name="image" className="material-symbols-outlined" />
</div>
<div className="space-y-1">
<p className="text-body-sm"><span className="font-bold">Inspector Funke</span> uploaded 12 inspection photos</p>
<p className="text-[10px] font-label-sm text-on-surface-variant">MAY 24, 02:30 PM</p>
</div>
</div>
<div className="flex gap-md">
<div className="w-8 h-8 rounded-full bg-secondary-container/20 flex-shrink-0 flex items-center justify-center">
<MaterialIcon name="priority_high" className="material-symbols-outlined" />
</div>
<div className="space-y-1">
<p className="text-body-sm">Pending final review by <span className="font-bold">Managing Partner</span></p>
<p className="text-[10px] font-label-sm text-on-surface-variant">JUST NOW</p>
</div>
</div>
</div>
<button className="w-full py-2 border border-outline rounded-lg text-body-sm font-bold hover:bg-surface-container-low transition-colors">
                        Add Admin Note
                    </button>
</div>
</div>
</div>
{'{'}/* Footer Spacer for Mobile */{'}'}
<div className="h-20 md:hidden"></div>
{'{'}/* BottomNavBar (Mobile Shared Component) */{'}'}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface flex justify-around items-center py-sm border-t border-outline-variant z-50">
<a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
<MaterialIcon name="dashboard" className="material-symbols-outlined" />
<span className="text-[10px] font-label-sm">Home</span>
</a>
<a className="flex flex-col items-center gap-1 text-primary font-bold" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
<span className="text-[10px] font-label-sm">Queue</span>
</a>
<a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
<MaterialIcon name="domain" className="material-symbols-outlined" />
<span className="text-[10px] font-label-sm">Units</span>
</a>
<a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
<MaterialIcon name="settings" className="material-symbols-outlined" />
<span className="text-[10px] font-label-sm">Settings</span>
</a>
</nav>
</main>

    </DashboardShell>
  );
}

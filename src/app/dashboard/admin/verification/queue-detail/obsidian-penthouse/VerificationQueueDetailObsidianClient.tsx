'use client';

import AppIcon from '@/components/icons/app-icon';

export default function VerificationQueueDetailObsidianClient() {
  return (
    <div className="mx-auto max-w-7xl w-full p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-on-surface-variant font-label-sm">
            <AppIcon name="queues" className="lucide" />
            <AppIcon name="chevron_right" className="lucide" />
            <AppIcon name="high_priority" className="lucide" />
            <AppIcon name="chevron_right" className="lucide" />
            <span className="text-primary">#EV-98231</span>
          </div>
          <h2 className="text-headline-lg text-primary font-headline-lg">The Obsidian Penthouse</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-3 py-1 text-xs font-label-sm text-on-secondary-fixed">
              <span className="lucide text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              INSPECTED
            </span>
            <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-label-sm text-on-surface-variant">
              Created 2h ago
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-outline px-5 py-2 font-bold text-primary hover:bg-surface-container-low transition-colors">Request Info</button>
          <button className="rounded-lg bg-error px-5 py-2 font-bold text-on-error hover:opacity-90 transition-opacity">Reject</button>
          <button className="rounded-lg bg-primary-container px-5 py-2 font-bold text-on-primary-container shadow-lg hover:-translate-y-0.5 transition-all">Approve & Certify</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-lg border border-outline-variant bg-surface p-6 shadow-sm space-y-6">
          <h3 className="font-headline-sm text-primary">Verification Pipeline</h3>
          <div className="relative space-y-6">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-outline-variant"></div>
            {[
              { label: 'KYC Submission', sub: 'Validated via NimC Gateway', state: 'done' },
              { label: 'C of O Verification', sub: 'Lagos Land Registry Match', state: 'done' },
              { label: 'Physical Inspection', sub: 'Agent: Funke Akindele • Pending Review', state: 'active' },
              { label: 'Final Certification', sub: 'Signature Required', state: 'locked' },
            ].map((step) => {
              const icon = step.state === 'done' ? 'check' : step.state === 'active' ? 'pending' : 'radio_button_unchecked';
              const cls = step.state === 'done'
                ? 'bg-on-tertiary-container text-white'
                : step.state === 'active'
                  ? 'bg-secondary-container text-on-secondary-fixed ring-4 ring-background'
                  : 'bg-surface-container-high text-on-surface-variant';
              return (
                <div key={step.label} className="flex gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${cls}`}>
                    <AppIcon name={icon} className="lucide" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-label-md text-primary">{step.label}</p>
                    <p className="text-sm text-on-surface-variant">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-label-md uppercase tracking-wider text-on-surface-variant">Property Owner</h4>
              <span className="rounded bg-on-tertiary-container/10 px-2 py-0.5 text-xs font-label-sm text-on-tertiary-container">MATCHED 98%</span>
            </div>
            <div className="flex items-center gap-4">
              <img alt="Owner avatar" className="h-12 w-12 rounded-full border border-outline object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRtVkTaJtRyCVW7YClt5jsc2v2_klnwX2OEojt3Ht0JZoh9tP55l32XVouzrCafjRxTqn0gXWoLQlMwZ7dUOMRQqvfPbBGwj5C9ADSl4K9W5PO0CLYKtPZOeCjg0c64x6OB0Z-1n8t1vVKyUqFNBoA9xJ7bu9kOue7rsijLpShIHReVxnkQXuLs4vtzyIYUV2t9Bd33yaqmh69JV0dYYiD1Y__xfrysY3JM1pZ8SSp_PFIT4oEmtJcJNE1tuX5MadK9GpxIFq6ABM" />
              <div>
                <p className="font-headline-sm text-primary">Emeka Adeyemi</p>
                <p className="text-sm text-on-surface-variant">Verified BVN: 221****092</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-6 space-y-3">
            <h4 className="font-label-md uppercase tracking-wider text-on-surface-variant">Location Signature</h4>
            <div className="space-y-1">
              <p className="font-headline-sm text-primary">Banana Island, Ikoyi</p>
              <p className="text-sm text-on-surface-variant flex items-center gap-1">
                <AppIcon name="location_on" className="lucide" />
                Zone A, Waterfront District, Lagos
              </p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 space-y-4">
            <h4 className="font-headline-sm text-primary">Legal Documentation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="overflow-hidden rounded-lg border border-outline-variant hover:border-primary transition-colors">
                <img alt="Certificate of Occupancy" className="h-32 w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2i7-TPT6FqJ_RiV4eMfNuF9ortAX6OZ2jDO1CZj-3mgTagvRVFJa5dnl6DgdqVwfV6g85o5Ja0QjZlCGqTiGBs0wnK3RoT6HXqI9MO2cvPCNIFaNPidAz8NVbE-wRJlv51MLq8rgl4VswCKYCr3VzcNWMssvduxSd4ItCOMdKLgNZhh6A1kXW6O4oMB15KN2EIbZk_0bG1Rfa63HKwqXaqOlVJmmP2DzjoteKfWSL62-KIXsg00EdLMBCOWZ0VNghsDnZC4U77tU" />
                <div className="bg-black/60 p-2">
                  <p className="truncate text-[10px] font-label-sm text-white">C_of_O_Lagos_Registry.pdf</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-outline-variant hover:border-primary transition-colors">
                <img alt="Survey Plan" className="h-32 w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6xom281FrtHq7CQel9qaXaL3rxRmhejvNH51omrtIEpOSeJp2Qu6GbNFu3V573-auJ7OLCa4PZzasgoIqy7arAGtLTd7snGOKcn-CbJWd8iXX7oVHNKdAuhtfcE0sxV7swHw0Tn9ZSZIUbTCCvFgm_1SMKou77ylnIhFrmUp_1zEAefUkh7XGW7VmFyXYtx30tThwSfCfgcLJhazTU40kUbhZakgK0csCXcr4W--2zdB9dvaQ35s36V--emGQUzXqnAtryOE8W6s" />
                <div className="bg-black/60 p-2">
                  <p className="truncate text-[10px] font-label-sm text-white">Survey_Plan_2023.pdf</p>
                </div>
              </div>
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant h-32 hover:bg-surface-container-low transition-colors">
                <AppIcon name="add_circle" className="lucide" />
                <p className="mt-2 text-xs font-label-sm text-on-surface-variant">Add Document</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 rounded-lg border border-outline-variant bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-primary">Physical Inspection Report</h3>
            <button className="flex items-center gap-1 text-sm font-label-md text-secondary">
              View Full Report <AppIcon name="open_in_new" className="lucide" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-label-sm">Inspector Notes</p>
              <p className="italic text-on-primary-container text-body-md">"The property structural integrity matches the architectural plans submitted. High-end finishing confirmed. Boundary markers are clearly visible and match survey data."</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-label-sm">Utility Verification</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-body-sm">
                  <AppIcon name="check_circle" className="lucide" />
                  Independent Power Grid Access
                </li>
                <li className="flex items-center gap-2 text-body-sm">
                  <AppIcon name="check_circle" className="lucide" />
                  Central Water Treatment Verified
                </li>
                <li className="flex items-center gap-2 text-body-sm">
                  <AppIcon name="check_circle" className="lucide" />
                  Fibre Optic Connectivity Confirmed
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-label-sm">Risk Assessment</p>
              <div className="rounded-r-lg border-l-4 border-on-tertiary-container bg-on-tertiary-container/5 p-4">
                <p className="font-headline-sm text-on-tertiary-container text-headline-sm">LOW RISK</p>
                <p className="text-sm opacity-80 text-on-tertiary-container">9.5/10 Security Score</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-lg bg-primary-container p-6 text-on-primary relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary-container/10 blur-3xl"></div>
          <div className="relative z-10 space-y-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full verification-badge-shimmer">
              <span className="lucide text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg">EstateVerify Certified</h3>
            <p className="max-w-md text-body-lg text-on-primary-container">Once approved, this property will receive the 'Diamond Certified' status, making it instantly tradable on the premium secondary market.</p>
            <div className="flex items-center gap-4 pt-4">
              <div className="text-center">
                <p className="font-label-sm text-secondary-container">VALIDITY</p>
                <p className="font-headline-sm">24 Months</p>
              </div>
              <div className="h-10 w-px bg-on-primary-container/20"></div>
              <div className="text-center">
                <p className="font-label-sm text-secondary-container">INSURED UP TO</p>
                <p className="font-headline-sm">₦500M</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-5 -bottom-10 rotate-12 opacity-10 transition-transform duration-700 group-hover:rotate-0">
            <AppIcon name="shield" className="lucide" />
          </div>
        </div>

        <div className="lg:col-span-5 rounded-lg border border-outline-variant bg-surface p-6 shadow-sm space-y-4">
          <h3 className="font-headline-sm text-primary">Audit Log</h3>
          <div className="max-h-[320px] space-y-4 overflow-y-auto pr-2">
            {[['System', 'automatically flagged location discrepancy', 'history', 'MAY 24, 09:12 AM'], ['Admin Sarah', 'manually resolved location issue', 'edit', 'MAY 24, 10:45 AM'], ['Inspector Funke', 'uploaded 12 inspection photos', 'image', 'MAY 24, 02:30 PM'], ['Managing Partner', 'pending final review', 'priority_high', 'JUST NOW']].map(([who, what, icon, time]) => (
              <div key={time} className="flex gap-4 border-b border-outline-variant pb-4 last:border-0">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                  <AppIcon name={icon} className="lucide" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-bold">{who}</span> {what}</p>
                  <p className="text-[10px] font-label-sm text-on-surface-variant">{time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full rounded-lg border border-outline py-2 font-bold text-sm hover:bg-surface-container-low transition-colors">Add Admin Note</button>
        </div>
      </div>

      <div className="h-20 md:hidden"></div>
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-outline-variant bg-surface py-3">
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#"><AppIcon name="dashboard" className="lucide" /><span className="text-[10px] font-label-sm">Home</span></a>
        <a className="flex flex-col items-center gap-1 text-primary font-bold" href="#"><span className="lucide" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span><span className="text-[10px] font-label-sm">Queue</span></a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#"><AppIcon name="domain" className="lucide" /><span className="text-[10px] font-label-sm">Units</span></a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#"><AppIcon name="settings" className="lucide" /><span className="text-[10px] font-label-sm">Settings</span></a>
      </nav>
    </div>
  );
}

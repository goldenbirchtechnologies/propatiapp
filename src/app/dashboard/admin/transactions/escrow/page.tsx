'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function EscrowTransactionsPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from transactions_escrow_oversight_propati_admin.html */}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Transactions & Escrow Oversight</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Monitoring platform GTV, escrow security, and financial integrity.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="flex items-center bg-white border border-outline-variant px-4 py-2 rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-outline mr-2">calendar_today</span>
            <span className="text-body-sm font-medium">Oct 1 - Oct 31, 2023</span>
          </div>
          <button className="bg-primary text-white px-md py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg">
        {/* Total GTV */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-body-sm text-on-surface-variant font-medium">Total Platform GTV</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">+8.4%</span>
          </div>
          <div className="font-headline-md text-headline-md text-primary">₦1.2B</div>
          <div className="mt-2 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Active Escrow */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-body-sm text-on-surface-variant font-medium">Active Escrow Balance</span>
            <span className="text-secondary-container font-label-sm text-label-sm uppercase tracking-wider">Secure</span>
          </div>
          <div className="font-headline-md text-headline-md text-primary">₦450.5M</div>
          <div className="flex items-center gap-1 mt-2 text-emerald-600">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
            <span className="text-xs font-bold">Encrypted Ledger</span>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-body-sm text-on-surface-variant font-medium">Pending Settlements</span>
            <span className="material-symbols-outlined text-outline">pending_actions</span>
          </div>
          <div className="font-headline-md text-headline-md text-primary">
            42 <span className="text-body-sm font-normal text-on-surface-variant ml-1">(₦85.2M)</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Expected within 48 hours</p>
        </div>

        {/* Flagged / Disputed */}
        <div className="bg-white p-lg rounded-xl border-2 border-error/20 bg-error/5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-sm text-error">
            <span className="text-body-sm font-bold">Flagged / Disputed</span>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div className="font-headline-md text-headline-md text-error">
            3 <span className="text-body-sm font-normal text-on-surface-variant ml-1">(₦4.2M)</span>
          </div>
          <p className="text-xs text-error font-medium mt-2">Action required immediately</p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        {/* Column 1: Transactions Feed */}
        <div className="lg:col-span-3 space-y-md">
          <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-md border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm text-primary">Recent Transactions</h3>
              <div className="flex items-center gap-sm">
                <div className="flex items-center border border-outline-variant rounded-lg px-3 py-1.5 bg-white">
                  <span className="material-symbols-outlined text-outline text-sm mr-2">filter_alt</span>
                  <select className="border-none focus:ring-0 text-body-sm p-0 bg-transparent cursor-pointer">
                    <option>All Types</option>
                    <option>Rent</option>
                    <option>Sale</option>
                  </select>
                </div>
                <div className="flex items-center border border-outline-variant rounded-lg px-3 py-1.5 bg-white">
                  <span className="material-symbols-outlined text-outline text-sm mr-2">verified</span>
                  <select className="border-none focus:ring-0 text-body-sm p-0 bg-transparent cursor-pointer">
                    <option>All Statuses</option>
                    <option>Funded</option>
                    <option>Released</option>
                    <option>Pending</option>
                    <option>Disputed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">ID</th>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Property</th>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Amount</th>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Escrow Status</th>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors cursor-default">
                    <td className="px-md py-4 font-label-sm text-label-sm text-primary">TRN-8821</td>
                    <td className="px-md py-4">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold text-primary">Eko Atlantic Waterfront</span>
                        <span className="text-xs text-on-surface-variant">Lagos, NG</span>
                      </div>
                    </td>
                    <td className="px-md py-4 font-bold text-primary">₦25,000,000</td>
                    <td className="px-md py-4 text-body-sm">Sale</td>
                    <td className="px-md py-4">
                      <span className="bg-emerald-600 text-white text-xs font-label-sm px-3 py-1 rounded-full uppercase">Funded</span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-on-surface-variant">24 Oct, 2023</td>
                    <td className="px-md py-4">
                      <a className="text-primary hover:underline text-body-sm font-semibold flex items-center gap-1" href="#">
                        Audit Trail <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors cursor-default bg-surface-container-lowest">
                    <td className="px-md py-4 font-label-sm text-label-sm text-primary">TRN-8794</td>
                    <td className="px-md py-4">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold text-primary">Banana Island Duplex</span>
                        <span className="text-xs text-on-surface-variant">Ikoyi, Lagos</span>
                      </div>
                    </td>
                    <td className="px-md py-4 font-bold text-primary">₦4,200,000</td>
                    <td className="px-md py-4 text-body-sm">Rent</td>
                    <td className="px-md py-4">
                      <span className="bg-error text-white text-xs font-label-sm px-3 py-1 rounded-full uppercase">Disputed</span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-on-surface-variant">22 Oct, 2023</td>
                    <td className="px-md py-4">
                      <a className="text-error hover:underline text-body-sm font-semibold flex items-center gap-1" href="#">
                        Review Case <span className="material-symbols-outlined text-sm">priority_high</span>
                      </a>
                    </td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors cursor-default">
                    <td className="px-md py-4 font-label-sm text-label-sm text-primary">TRN-8752</td>
                    <td className="px-md py-4">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold text-primary">Lekki Phase 1 Flat</span>
                        <span className="text-xs text-on-surface-variant">Lekki, Lagos</span>
                      </div>
                    </td>
                    <td className="px-md py-4 font-bold text-primary">₦8,500,000</td>
                    <td className="px-md py-4 text-body-sm">Rent</td>
                    <td className="px-md py-4">
                      <span className="bg-primary-container text-on-primary-container text-xs font-label-sm px-3 py-1 rounded-full uppercase">Released</span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-on-surface-variant">20 Oct, 2023</td>
                    <td className="px-md py-4">
                      <a className="text-primary hover:underline text-body-sm font-semibold flex items-center gap-1" href="#">
                        Audit Trail <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                  {/* Row 4 */}
                  <tr className="hover:bg-surface-container-lowest transition-colors cursor-default bg-surface-container-lowest">
                    <td className="px-md py-4 font-label-sm text-label-sm text-primary">TRN-8740</td>
                    <td className="px-md py-4">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold text-primary">Maitama Luxury Suite</span>
                        <span className="text-xs text-on-surface-variant">Abuja, FCT</span>
                      </div>
                    </td>
                    <td className="px-md py-4 font-bold text-primary">₦120,000,000</td>
                    <td className="px-md py-4 text-body-sm">Sale</td>
                    <td className="px-md py-4">
                      <span className="bg-secondary-container text-primary-container text-xs font-label-sm px-3 py-1 rounded-full uppercase">Pending</span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-on-surface-variant">19 Oct, 2023</td>
                    <td className="px-md py-4">
                      <a className="text-primary hover:underline text-body-sm font-semibold flex items-center gap-1" href="#">
                        Audit Trail <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-md bg-surface-container-low flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Showing 1-4 of 1,240 transactions</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-outline-variant rounded bg-white hover:bg-surface-container-lowest text-xs font-bold">Prev</button>
                <button className="px-3 py-1 border border-outline-variant rounded bg-white hover:bg-surface-container-lowest text-xs font-bold">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Financial Integrity Sidebar */}
        <div className="space-y-gutter">
          {/* Escrow Health Widget */}
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Escrow Health</h3>
              <span className="material-symbols-outlined text-emerald-600">verified_user</span>
            </div>
            <div className="relative flex justify-center py-4">
              {/* Simple Donut Visualization */}
              <div className="w-32 h-32 rounded-full border-[12px] border-emerald-500 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 w-full h-full border-[12px] border-emerald-100 rounded-full"
                  style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0)' }}
                ></div>
                <div className="text-center">
                  <span className="font-headline-md text-headline-md text-primary">100%</span>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant">Integrity</p>
                </div>
              </div>
            </div>
            <div className="mt-md space-y-2">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Wallet Sync</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Ledger Balance</span>
                <span className="text-emerald-600 font-bold">Verified</span>
              </div>
              <hr className="border-outline-variant my-2" />
              <p className="text-center text-xs text-emerald-700 bg-emerald-50 py-2 rounded-lg font-medium">All systems secure</p>
            </div>
          </div>

          {/* Recent Flags */}
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Recent Flags</h3>
              <span className="material-symbols-outlined text-error">flag</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <p className="text-body-sm font-semibold text-primary">High Velocity Withdraw</p>
                  <p className="text-xs text-on-surface-variant">User ID: #USR-9921 • ₦4.2M</p>
                  <button className="mt-2 text-xs font-bold text-error uppercase hover:underline">Investigate</button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary-container mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <p className="text-body-sm font-semibold text-primary">KYC Mismatch</p>
                  <p className="text-xs text-on-surface-variant">ID Verification Pending • Rent</p>
                  <button className="mt-2 text-xs font-bold text-primary uppercase hover:underline">View Profile</button>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Schedule */}
          <div className="bg-primary-container p-lg rounded-xl border border-primary text-white shadow-md relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'wght' 700" }}>payments</span>
            </div>
            <div className="relative z-10">
              <h3 className="font-headline-sm text-headline-sm text-secondary-container mb-md">Payout Schedule</h3>
              <div className="space-y-md">
                <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">Next Window</span>
                    <span className="bg-secondary-container text-primary-container px-2 py-0.5 rounded text-[10px] font-bold">TOMORROW</span>
                  </div>
                  <p className="text-body-lg font-bold">
                    ₦12.5M <span className="text-xs font-normal opacity-70">Total</span>
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="opacity-70">Oct 26, 2023</span>
                    <span className="font-bold">₦8.2M</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="opacity-70">Oct 28, 2023</span>
                    <span className="font-bold">₦21.0M</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="opacity-70">Nov 01, 2023</span>
                    <span className="font-bold">₦44.5M</span>
                  </div>
                </div>
                <button className="w-full mt-2 py-2 text-xs font-bold text-secondary-container border border-secondary-container rounded-lg hover:bg-secondary-container/10 transition-colors">
                  Manage Disbursement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

'use client'

import MaterialIcon from '@/components/icons/material-icon';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';


export default function AdminOverviewPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground font-body-md">System health and verification analytics for Today.</p>
        </div>
        <div className="flex items-center gap-sm bg-surface-container rounded-lg p-1 border border-outline-variant">
          <button className="px-md py-1.5 bg-surface text-primary font-semibold rounded shadow-sm text-body-sm">Daily</button>
          <button className="px-md py-1.5 text-muted-foreground hover:text-primary transition-colors text-body-sm">Weekly</button>
          <button className="px-md py-1.5 text-muted-foreground hover:text-primary transition-colors text-body-sm">Monthly</button>
          <div className="h-4 w-[1px] bg-outline-variant mx-2"></div>
          <button className="flex items-center gap-xs px-md py-1.5 text-muted-foreground hover:text-primary transition-colors text-body-sm">
            <MaterialIcon name="calendar_today" className="material-symbols-outlined" />
            <MaterialIcon name="Oct 24, 2023" className="material-symbols-outlined" />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-lg">
        {/* KPI Card: Total Active Users */}
        <div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-sm bg-primary-container/5 rounded-lg">
              <MaterialIcon name="groups" className="material-symbols-outlined" />
            </div>
            <span className="text-emerald-600 flex items-center text-label-sm">
              <MaterialIcon name="trending_up" className="material-symbols-outlined" />
              +12.5%
            </span>
          </div>
          <div className="mt-md">
            <span className="text-muted-foreground text-label-md">Total Active Users</span>
            <h2 className="text-headline-md font-bold mt-xs">18,492</h2>
          </div>
        </div>

        {/* KPI Card: Pending Verifications */}
        <div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-sm bg-error-container/10 rounded-lg">
              <MaterialIcon name="priority_high" className="material-symbols-outlined" />
            </div>
            <span className="text-error flex items-center text-label-sm font-bold">URGENT</span>
          </div>
          <div className="mt-md">
            <span className="text-muted-foreground text-label-md">Pending Verifications</span>
            <h2 className="text-headline-md font-bold mt-xs">142</h2>
          </div>
        </div>

        {/* KPI Card: Platform Revenue */}
        <div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-sm bg-secondary/10 rounded-lg">
              <MaterialIcon name="payments" className="material-symbols-outlined" />
            </div>
            <span className="text-emerald-600 flex items-center text-label-sm">
              <MaterialIcon name="trending_up" className="material-symbols-outlined" />
              +8.2%
            </span>
          </div>
          <div className="mt-md">
            <span className="text-muted-foreground text-label-md">Platform Revenue (GTV)</span>
            <h2 className="text-headline-md font-bold mt-xs">₦4.2M</h2>
          </div>
        </div>

        {/* KPI Card: Active Disputes */}
        <div className="bg-surface p-lg rounded-xl border border-outline-variant card-shadow card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-sm bg-on-surface-variant/10 rounded-lg">
              <MaterialIcon name="report" className="material-symbols-outlined" />
            </div>
            <span className="text-muted-foreground flex items-center text-label-sm">Stable</span>
          </div>
          <div className="mt-md">
            <span className="text-muted-foreground text-label-md">Active Disputes</span>
            <h2 className="text-headline-md font-bold mt-xs">24</h2>
          </div>
        </div>
      </div>

      {/* Bento Layout Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-lg">
        {/* Verification Queue Table (Left 2/3) */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant card-shadow overflow-hidden flex flex-col">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Verification Queue</h3>
            <button className="text-primary-container font-semibold hover:underline text-body-sm flex items-center gap-xs">
              View All <MaterialIcon name="chevron_right" className="material-symbols-outlined" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-muted-foreground font-label-md border-b border-outline-variant">
                  <th className="px-lg py-md font-medium">Property Name</th>
                  <th className="px-lg py-md font-medium">Landlord</th>
                  <th className="px-lg py-md font-medium">Level</th>
                  <th className="px-lg py-md font-medium">Status</th>
                  <th className="px-lg py-md font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
                        <div className="w-full h-full bg-surface-container-high" />
                      </div>
                      <div>
                        <div className="font-bold text-primary">Skyline Penthouse</div>
                        <div className="text-body-sm text-muted-foreground">Ikoyi, Lagos</div>
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
                    <span className="px-sm py-1 rounded bg-secondary-container/20 text-secondary-container font-medium text-xs border border-secondary-container/30 uppercase">
                      Review
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary-container">
                      <MaterialIcon name="visibility" className="material-symbols-outlined" />
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
                        <div className="w-full h-full bg-surface-container-high" />
                      </div>
                      <div>
                        <div className="font-bold text-primary">Emerald Gardens</div>
                        <div className="text-body-sm text-muted-foreground">Lekki Phase 1</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md">Fatima Yusuf</td>
                  <td className="px-lg py-md">
                    <span className="inline-block px-3 py-1 rounded-full bg-outline-variant/20 text-foreground font-label-md text-xs">
                      LEVEL 2
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span className="px-sm py-1 rounded bg-surface-container-high text-muted-foreground font-medium text-xs border border-outline-variant uppercase">
                      Pending
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary-container">
                      <MaterialIcon name="visibility" className="material-symbols-outlined" />
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden">
                        <div className="w-full h-full bg-surface-container-high" />
                      </div>
                      <div>
                        <div className="font-bold text-primary">The Apex Duplex</div>
                        <div className="text-body-sm text-muted-foreground">Victoria Island</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md">Chidi Nwosu</td>
                  <td className="px-lg py-md">
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary-fixed text-secondary-fixed-dim font-label-md text-xs">
                      LEVEL 4
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span className="px-sm py-1 rounded bg-error-container/20 text-error font-medium text-xs border border-error/30 uppercase">
                      Action Required
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary-container">
                      <MaterialIcon name="visibility" className="material-symbols-outlined" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Alerts (Right 1/3) */}
        <div className="bg-surface rounded-xl border border-outline-variant card-shadow p-lg flex flex-col">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-sm">
              <MaterialIcon name="warning" className="material-symbols-outlined" />
              Risk Alerts
            </h3>
            <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold">4 NEW</span>
          </div>
          <div className="space-y-md">
            {/* Alert Item */}
            <div className="p-md bg-error-container/5 border-l-4 border-error rounded-r-lg hover:bg-error-container/10 transition-colors">
              <div className="flex justify-between items-start">
                <span className="font-bold text-primary text-body-sm">Flagged Account: @user829</span>
                <span className="text-[10px] text-muted-foreground uppercase">14m ago</span>
              </div>
              <p className="text-body-sm text-muted-foreground mt-1">
                High frequency transaction pattern detected from unverified IP.
              </p>
              <div className="mt-sm flex gap-sm">
                <button className="text-xs font-bold text-error hover:underline">Investigate</button>
                <button className="text-xs font-bold text-muted-foreground hover:underline">Dismiss</button>
              </div>
            </div>

            <div className="p-md bg-surface-container-high border-l-4 border-secondary rounded-r-lg">
              <div className="flex justify-between items-start">
                <span className="font-bold text-primary text-body-sm">Listing Discrepancy</span>
                <span className="text-[10px] text-muted-foreground uppercase">2h ago</span>
              </div>
              <p className="text-body-sm text-muted-foreground mt-1">
                &quot;Maitama Manor&quot; coordinates don&apos;t match provided land registry docs.
              </p>
              <div className="mt-sm flex gap-sm">
                <button className="text-xs font-bold text-primary-container hover:underline">Verify Map</button>
              </div>
            </div>

            <div className="p-md bg-surface-container border-l-4 border-outline rounded-r-lg">
              <div className="flex justify-between items-start">
                <span className="font-bold text-primary text-body-sm">Suspicious Withdrawal</span>
                <span className="text-[10px] text-muted-foreground uppercase">4h ago</span>
              </div>
              <p className="text-body-sm text-muted-foreground mt-1">
                ₦850,000 flagged for manual AML review.
              </p>
            </div>
          </div>
          <button className="mt-auto w-full py-2 border border-outline text-muted-foreground text-body-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
            Security Log History
          </button>
        </div>

        {/* Platform Activity Chart (Full Width Bottom) */}
        <div className="lg:col-span-3 bg-primary-container text-on-primary rounded-xl p-lg relative overflow-hidden h-[320px]">
          {/* Background texture/pattern using CSS only */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
          ></div>
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
            {/* Visual representation of a chart using divs */}
            <div className="flex-grow flex items-end gap-md pb-md">
              {/* Chart bars */}
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
              <MaterialIcon name="Week 1" className="material-symbols-outlined" />
              <MaterialIcon name="Week 2" className="material-symbols-outlined" />
              <MaterialIcon name="Week 3" className="material-symbols-outlined" />
              <MaterialIcon name="Week 4" className="material-symbols-outlined" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer / System Status */}
      <footer className="mt-auto px-lg py-md border-t border-outline-variant bg-surface-container-low flex justify-between items-center text-muted-foreground text-label-sm">
        <div className="flex items-center gap-md">
          <span className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            API: Healthy
          </span>
          <MaterialIcon name="Node: NG-LAG-01" className="material-symbols-outlined" />
        </div>
        <div>
          &copy; 2023 EstateVerify Systems. Secure Administrative Access.
        </div>
      </footer>
    </DashboardShell>
  );
}

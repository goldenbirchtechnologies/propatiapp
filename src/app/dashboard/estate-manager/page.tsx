'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function EstateManagerDashboardPage() {
  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Esther Okafor">
      <div className="p-margin-mobile md:p-margin-desktop space-y-gutter">
        {/* KPI Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-card border border-outline-variant">
            <p className="font-label-sm text-on-surface-variant mb-xs">Total Units Managed</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-lg text-headline-lg text-primary">452</h3>
              <span className="text-tertiary font-label-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +12%
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-card border border-outline-variant">
            <p className="font-label-sm text-on-surface-variant mb-xs">Portfolio Occupancy</p>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-headline-lg text-headline-lg text-primary">94.8%</h3>
                <div className="mt-2 h-1 w-24 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-fixed-dim w-[94.8%]" />
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary-container">insights</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-card border border-outline-variant">
            <p className="font-label-sm text-on-surface-variant mb-xs">Maintenance Requests</p>
            <div className="flex items-center gap-md">
              <h3 className="font-headline-lg text-headline-lg text-primary">15</h3>
              <div className="flex flex-col">
                <span className="bg-error/10 text-error font-label-sm px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                  3 Urgent
                </span>
                <span className="text-outline font-label-sm text-[10px] mt-1">12 Pending</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-card border border-outline-variant">
            <p className="font-label-sm text-on-surface-variant mb-xs">Monthly Revenue</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-lg text-headline-lg text-primary">₦42.5M</h3>
              <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container font-label-sm px-2 py-1 rounded-full text-[10px]">Verified</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
          {/* Portfolio Overview (2/3 Width) */}
          <section className="xl:col-span-2 space-y-md">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-headline-md text-primary">Portfolio Overview</h4>
              <button className="text-primary font-label-md flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-md font-label-sm text-on-surface-variant">Property Name</th>
                      <th className="px-lg py-md font-label-sm text-on-surface-variant text-center">Units</th>
                      <th className="px-lg py-md font-label-sm text-on-surface-variant">Status</th>
                      <th className="px-lg py-md font-label-sm text-on-surface-variant">Performance</th>
                      <th className="px-lg py-md font-label-sm text-on-surface-variant" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 rounded bg-outline-variant/20 flex-shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-surface-container-high" />
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">The Lexicon Towers</p>
                            <p className="text-[10px] text-outline">Victoria Island, Lagos</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md text-center font-body-sm text-on-surface">124</td>
                      <td className="px-lg py-md">
                        <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container font-label-sm px-3 py-1 rounded-full text-[12px]">Full</span>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-2">
                          <span className="font-body-sm text-on-surface">98%</span>
                          <div className="w-12 h-1 bg-surface-container-high rounded-full">
                            <div className="h-full bg-tertiary-container w-[98%]" />
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md text-right">
                        <button className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">more_vert</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 rounded bg-outline-variant/20 flex-shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-surface-container-high" />
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">Eko Atlantic Gardens</p>
                            <p className="text-[10px] text-outline">Eko Atlantic City</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md text-center font-body-sm text-on-surface">208</td>
                      <td className="px-lg py-md">
                        <span className="bg-secondary-fixed-dim/20 text-secondary font-label-sm px-3 py-1 rounded-full text-[12px]">2 Vacancies</span>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-2">
                          <span className="font-body-sm text-on-surface">85%</span>
                          <div className="w-12 h-1 bg-surface-container-high rounded-full">
                            <div className="h-full bg-secondary-container w-[85%]" />
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md text-right">
                        <button className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">more_vert</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rent Ledger Preview */}
            <div className="mt-gutter space-y-md">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-md text-headline-md text-primary">Recent Rent Ledger</h4>
                <button className="bg-surface-container-high text-primary font-label-md py-2 px-4 rounded-lg hover:bg-surface-variant transition-colors">Export CSV</button>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="px-lg py-md font-label-sm text-on-surface-variant">Unit</th>
                        <th className="px-lg py-md font-label-sm text-on-surface-variant">Tenant</th>
                        <th className="px-lg py-md font-label-sm text-on-surface-variant">Amount</th>
                        <th className="px-lg py-md font-label-sm text-on-surface-variant">Due Date</th>
                        <th className="px-lg py-md font-label-sm text-on-surface-variant">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      <tr>
                        <td className="px-lg py-md font-label-md">LEX-A402</td>
                        <td className="px-lg py-md font-body-sm">Chinedu Okafor</td>
                        <td className="px-lg py-md font-label-md">₦1,250,000</td>
                        <td className="px-lg py-md font-body-sm">Oct 12, 2024</td>
                        <td className="px-lg py-md">
                          <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container font-label-sm px-2 py-0.5 rounded text-[11px]">Paid</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-lg py-md font-label-md">EKO-B12</td>
                        <td className="px-lg py-md font-body-sm">Fatima Bello</td>
                        <td className="px-lg py-md font-label-md">₦3,500,000</td>
                        <td className="px-lg py-md font-body-sm">Oct 10, 2024</td>
                        <td className="px-lg py-md">
                          <span className="bg-error-container text-on-error-container font-label-sm px-2 py-0.5 rounded text-[11px]">Overdue</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-lg py-md font-label-md">LEX-C009</td>
                        <td className="px-lg py-md font-body-sm">Adeola Adeyemi</td>
                        <td className="px-lg py-md font-label-md">₦850,000</td>
                        <td className="px-lg py-md font-body-sm">Oct 15, 2024</td>
                        <td className="px-lg py-md">
                          <span className="bg-secondary-fixed/20 text-secondary font-label-sm px-2 py-0.5 rounded text-[11px]">Partial</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Operations Sidebar (1/3 Width) */}
          <aside className="space-y-gutter">
            {/* Urgent Maintenance */}
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-card">
              <div className="flex items-center justify-between mb-md">
                <h4 className="font-headline-sm text-headline-sm text-primary">Urgent Tasks</h4>
                <span className="w-6 h-6 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">3</span>
              </div>
              <div className="space-y-md max-h-[400px] overflow-y-auto pr-2">
                <div className="p-md rounded-lg border border-error/20 bg-error-container/10 space-y-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label-md text-on-surface">LEX-A402 • Plumbing</p>
                      <p className="text-[11px] text-on-surface-variant">Leak in Master Bathroom</p>
                    </div>
                    <span className="bg-error text-white font-label-sm text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter">High</span>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg font-label-sm hover:bg-primary-container transition-colors active:scale-[0.98]">Assign Vendor</button>
                </div>
                <div className="p-md rounded-lg border border-outline-variant space-y-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label-md text-on-surface">EKO-B12 • Electrical</p>
                      <p className="text-[11px] text-on-surface-variant">AC Unit non-functional</p>
                    </div>
                    <span className="bg-secondary-container text-on-secondary-container font-label-sm text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter">Medium</span>
                  </div>
                  <button className="w-full py-2 border border-outline text-primary rounded-lg font-label-sm hover:bg-surface-container transition-colors">Assign Vendor</button>
                </div>
                <div className="p-md rounded-lg border border-outline-variant space-y-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label-md text-on-surface">LEX-C001 • Structural</p>
                      <p className="text-[11px] text-on-surface-variant">Balcony railing loose</p>
                    </div>
                    <span className="bg-error text-white font-label-sm text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter">High</span>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg font-label-sm hover:bg-primary-container transition-colors">Assign Vendor</button>
                </div>
              </div>
            </div>

            {/* Lease Expirations */}
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-card">
              <div className="flex items-center gap-2 mb-md">
                <span className="material-symbols-outlined text-secondary-container">event_note</span>
                <h4 className="font-headline-sm text-headline-sm text-primary">Lease Expirations</h4>
              </div>
              <p className="text-[11px] text-outline mb-md uppercase tracking-wider font-label-sm">Next 30 Days</p>
              <div className="divide-y divide-outline-variant">
                <div className="py-md flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface">John Dumelo</p>
                    <p className="text-[11px] text-on-surface-variant">LEX-B11 • 14 days left</p>
                  </div>
                  <button className="text-secondary font-bold font-label-sm hover:text-on-secondary-container">Renew</button>
                </div>
                <div className="py-md flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface">Sarah Alade</p>
                    <p className="text-[11px] text-on-surface-variant">EKO-A05 • 22 days left</p>
                  </div>
                  <button className="text-secondary font-bold font-label-sm hover:text-on-secondary-container">Renew</button>
                </div>
              </div>
              <button className="w-full mt-md py-2 text-on-surface-variant font-label-sm hover:bg-surface-container rounded transition-all">View Full Schedule</button>
            </div>

            {/* Verification Signal */}
            <div className="bg-primary-container p-lg rounded-xl relative overflow-hidden group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-secondary-container text-[48px] mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <h5 className="text-white font-headline-sm text-headline-sm mb-sm">Premium Security Active</h5>
                <p className="text-on-primary-container font-body-sm mb-lg">All transactions and maintenance reports are encrypted and backed by EstateVerify's trust guarantee.</p>
                <button className="text-secondary-fixed-dim font-label-md flex items-center gap-1">Learn More <span className="material-symbols-outlined text-[18px]">open_in_new</span></button>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[200px] text-white">shield</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

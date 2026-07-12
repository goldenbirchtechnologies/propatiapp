'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function EstateManagerDashboardPage() {
  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Esther Okafor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Welcome back, Esther
            </h2>
            <p className="text-on-surface-variant mt-1">
              Here is what is happening with your portfolio today.
            </p>
          </div>
        </header>

        {/* KPI Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <p className="mb-2 font-label-sm text-on-surface-variant">Total Units Managed</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-lg text-headline-lg text-primary">452</h3>
              <span className="flex items-center gap-1 font-label-sm text-secondary-fixed-dim">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +12%
              </span>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <p className="mb-2 font-label-sm text-on-surface-variant">Portfolio Occupancy</p>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-headline-lg text-headline-lg text-primary">94.8%</h3>
                <div className="mt-2 h-1 w-24 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-fixed-dim w-[94.8%]" />
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary-container">insights</span>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <p className="mb-2 font-label-sm text-on-surface-variant">Maintenance Requests</p>
            <div className="flex items-center gap-3">
              <h3 className="font-headline-lg text-headline-lg text-primary">15</h3>
              <div className="flex flex-col">
                <span className="bg-error/10 text-error font-label-sm px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                  3 Urgent
                </span>
                <span className="font-label-sm text-outline text-[10px] mt-1">12 Pending</span>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <p className="mb-2 font-label-sm text-on-surface-variant">Monthly Revenue</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-lg text-headline-lg text-primary">₦42.5M</h3>
              <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container font-label-sm px-2 py-1 rounded-full text-[10px]">Verified</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Portfolio Overview (2/3 Width) */}
          <section className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-sm text-headline-sm text-primary">Portfolio Overview</h4>
              <button className="font-bold text-body-sm text-primary transition-colors hover:underline">
                View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <div className="rounded-xl border border-outline-variant overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-high/50 border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Property Name</th>
                      <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-center">Units</th>
                      <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
                      <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Performance</th>
                      <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    <tr className="transition-colors hover:bg-surface-container/30 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-outline-variant/20 flex-shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-surface-container-high" />
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">The Lexicon Towers</p>
                            <p className="text-[10px] text-outline">Victoria Island, Lagos</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-body-sm text-on-surface">124</td>
                      <td className="px-6 py-4">
                        <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container font-label-sm px-3 py-1 rounded-full text-[12px]">Full</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-body-sm text-on-surface">98%</span>
                          <div className="w-12 h-1 bg-surface-container-high rounded-full">
                            <div className="h-full bg-tertiary-container w-[98%]" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-outline transition-colors group-hover:text-primary">more_vert</button>
                      </td>
                    </tr>
                    <tr className="transition-colors hover:bg-surface-container/30 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-outline-variant/20 flex-shrink-0 overflow-hidden">
                            <div className="w-full h-full bg-surface-container-high" />
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">Eko Atlantic Gardens</p>
                            <p className="text-[10px] text-outline">Eko Atlantic City</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-body-sm text-on-surface">208</td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary-fixed-dim/20 text-secondary font-label-sm px-3 py-1 rounded-full text-[12px]">2 Vacancies</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-body-sm text-on-surface">85%</span>
                          <div className="w-12 h-1 bg-surface-container-high rounded-full">
                            <div className="h-full bg-secondary-container w-[85%]" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-outline transition-colors group-hover:text-primary">more_vert</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rent Ledger Preview */}
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm text-primary">Recent Rent Ledger</h4>
                <button className="bg-surface-container-high text-primary font-label-md py-2 px-4 rounded-lg hover:bg-surface-variant transition-all hover:shadow-card-hover">Export CSV</button>
              </div>
              <div className="rounded-xl border border-outline-variant overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high/50 border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Unit</th>
                        <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Tenant</th>
                        <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Amount</th>
                        <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Due Date</th>
                        <th className="px-6 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      <tr>
                        <td className="px-6 py-4 font-label-md">LEX-A402</td>
                        <td className="px-6 py-4 font-body-sm">Chinedu Okafor</td>
                        <td className="px-6 py-4 font-label-md">₦1,250,000</td>
                        <td className="px-6 py-4 font-body-sm">Oct 12, 2024</td>
                        <td className="px-6 py-4">
                          <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container font-label-sm px-2 py-0.5 rounded text-[11px]">Paid</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-label-md">EKO-B12</td>
                        <td className="px-6 py-4 font-body-sm">Fatima Bello</td>
                        <td className="px-6 py-4 font-label-md">₦3,500,000</td>
                        <td className="px-6 py-4 font-body-sm">Oct 10, 2024</td>
                        <td className="px-6 py-4">
                          <span className="bg-error-container text-on-error-container font-label-sm px-2 py-0.5 rounded text-[11px]">Overdue</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-label-md">LEX-C009</td>
                        <td className="px-6 py-4 font-body-sm">Adeola Adeyemi</td>
                        <td className="px-6 py-4 font-label-md">₦850,000</td>
                        <td className="px-6 py-4 font-body-sm">Oct 15, 2024</td>
                        <td className="px-6 py-4">
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
          <aside className="space-y-6">
            {/* Urgent Maintenance */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-headline-sm text-headline-sm text-primary">Urgent Tasks</h4>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error text-white text-[10px] font-bold">3</span>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="p-4 rounded-lg border border-error/20 bg-error-container/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label-md text-on-surface">LEX-A402 • Plumbing</p>
                      <p className="text-[11px] text-on-surface-variant">Leak in Master Bathroom</p>
                    </div>
                    <span className="bg-error text-white font-label-sm text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter">High</span>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg font-label-sm hover:bg-primary-container transition-all active:scale-[0.98]">Assign Vendor</button>
                </div>
                <div className="p-4 rounded-lg border border-outline-variant space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label-md text-on-surface">EKO-B12 • Electrical</p>
                      <p className="text-[11px] text-on-surface-variant">AC Unit non-functional</p>
                    </div>
                    <span className="bg-secondary-container text-on-secondary-container font-label-sm text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter">Medium</span>
                  </div>
                  <button className="w-full py-2 border border-outline text-primary rounded-lg font-label-sm hover:bg-surface-container transition-all">Assign Vendor</button>
                </div>
                <div className="p-4 rounded-lg border border-outline-variant space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label-md text-on-surface">LEX-C001 • Structural</p>
                      <p className="text-[11px] text-on-surface-variant">Balcony railing loose</p>
                    </div>
                    <span className="bg-error text-white font-label-sm text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter">High</span>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg font-label-sm hover:bg-primary-container transition-all active:scale-[0.98]">Assign Vendor</button>
                </div>
              </div>
            </div>

            {/* Lease Expirations */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary-container">event_note</span>
                <h4 className="font-headline-sm text-headline-sm text-primary">Lease Expirations</h4>
              </div>
              <p className="mb-4 text-[11px] font-label-sm uppercase tracking-wider text-outline">Next 30 Days</p>
              <div className="divide-y divide-outline-variant">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface">John Dumelo</p>
                    <p className="text-[11px] text-on-surface-variant">LEX-B11 • 14 days left</p>
                  </div>
                  <button className="font-bold text-body-sm text-secondary transition-colors hover:text-secondary-container">Renew</button>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface">Sarah Alade</p>
                    <p className="text-[11px] text-on-surface-variant">EKO-A05 • 22 days left</p>
                  </div>
                  <button className="font-bold text-body-sm text-secondary transition-colors hover:text-secondary-container">Renew</button>
                </div>
              </div>
              <button className="mt-4 w-full py-2 text-on-surface-variant font-label-sm rounded hover:bg-surface-container transition-all">View Full Schedule</button>
            </div>

            {/* Verification Signal */}
            <div className="bg-primary-container p-6 rounded-xl relative overflow-hidden group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-secondary-container text-[48px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <h5 className="mb-2 font-headline-sm text-headline-sm text-white">Premium Security Active</h5>
                <p className="mb-6 font-body-sm text-on-primary-container">All transactions and maintenance reports are encrypted and backed by EstateVerify's trust guarantee.</p>
                <button className="font-label-md flex items-center gap-1 text-secondary-fixed-dim transition-colors hover:underline">Learn More <span className="material-symbols-outlined text-[18px]">open_in_new</span></button>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-[200px] text-white">shield</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

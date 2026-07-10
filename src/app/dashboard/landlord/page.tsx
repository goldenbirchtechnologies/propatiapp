'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function LandlordDashboardPage() {
  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Adebayo Adeyemi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h3 className="font-heading text-headline-lg text-primary">
              Welcome back, Chief Adebayo
            </h3>
            <p className="text-on-surface-variant">Here is what is happening with your Lagos portfolio today.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-body-sm text-on-primary transition-all hover:shadow-lg">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Listing
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-primary bg-surface px-6 py-2.5 font-bold text-body-sm text-primary transition-all hover:bg-primary/5">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              View Applications
            </button>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">home_work</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Active Listings</p>
            <h4 className="font-heading text-2xl text-primary">12</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-on-tertiary-container">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+2 since last month</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">pending_actions</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Pending Applications</p>
            <h4 className="font-heading text-2xl text-primary">08</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-secondary-container">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>3 require urgent review</span>
            </div>
          </div>

          {/* Card 3 - Premium with shimmer */}
          <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-primary-container p-6 shadow-xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite linear',
              }}
            />
            <p className="mb-1 font-label-sm text-on-primary-container">This Month&apos;s Rent</p>
            <h4 className="font-heading text-2xl text-secondary-fixed">₦4,250,000</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>85% Collected</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">verified_user</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Verification Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-on-tertiary-container px-3 py-1 text-[11px] font-label-sm uppercase tracking-wider text-white">Certified</span>
            </div>
            <div className="mt-4 text-on-surface-variant font-label-sm">
              Platinum Partner Level
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Applications Table - 2 cols */}
          <div className="lg:col-span-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant p-6">
              <h5 className="font-heading text-primary">Recent Applications</h5>
              <button className="font-bold text-body-sm text-primary transition-all hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Tenant Name</th>
                    <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Listing</th>
                    <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Status</th>
                    <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase">Date</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr className="transition-colors hover:bg-surface-container">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim font-bold text-xs text-primary">EO</div>
                        <span className="font-body-md text-primary font-medium">Emeka Okafor</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">3BR Luxury Flat, Lekki Ph 1</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-secondary-container px-3 py-1 text-[12px] font-label-md bg-secondary-container/20 text-on-secondary-container">Pending</span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Oct 24, 2023</td>
                    <td className="px-6 py-4 text-right">
                      <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">more_vert</button>
                    </td>
                  </tr>
                  <tr className="transition-colors hover:bg-surface-container">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim font-bold text-xs text-primary">SA</div>
                        <span className="font-body-md text-primary font-medium">Sade Adekunle</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Penthouse, Victoria Island</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-on-tertiary-container px-3 py-1 text-[12px] font-label-md bg-on-tertiary-container/20 text-on-tertiary-container">Verified</span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Oct 22, 2023</td>
                    <td className="px-6 py-4 text-right">
                      <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">more_vert</button>
                    </td>
                  </tr>
                  <tr className="transition-colors hover:bg-surface-container">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim font-bold text-xs text-primary">JO</div>
                        <span className="font-body-md text-primary font-medium">John Obinna</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Modern Duplex, Ikoyi</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-error px-3 py-1 text-[12px] font-label-md bg-error-container text-on-error-container">Rejected</span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Oct 20, 2023</td>
                    <td className="px-6 py-4 text-right">
                      <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">more_vert</button>
                    </td>
                  </tr>
                  <tr className="transition-colors hover:bg-surface-container">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim font-bold text-xs text-primary">FA</div>
                        <span className="font-body-md text-primary font-medium">Funmi Alakija</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Studio, Maryland</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-secondary-container px-3 py-1 text-[12px] font-label-md bg-secondary-container/20 text-on-secondary-container">Pending</span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">Oct 19, 2023</td>
                    <td className="px-6 py-4 text-right">
                      <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">more_vert</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rent Schedule Timeline */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h5 className="font-heading text-primary">Rent Schedule</h5>
              <button className="material-symbols-outlined text-on-surface-variant">calendar_month</button>
            </div>
            <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:-translate-x-px before:bg-surface-container-highest">
              {/* Timeline Item 1 */}
              <div className="relative flex items-center gap-6">
                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-on-tertiary-container ring-8 ring-surface">
                  <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="ml-12">
                  <p className="text-body-sm font-bold text-primary">Rent Received - Apt 4B</p>
                  <p className="text-label-sm text-on-tertiary-container">₦450,000 • Received Today</p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex items-center gap-6">
                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container ring-8 ring-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                </div>
                <div className="ml-12">
                  <p className="text-body-sm font-bold text-primary">Rent Due - Villa 12</p>
                  <p className="text-label-sm text-secondary-container">₦1,200,000 • Due in 2 days</p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative flex items-center gap-6">
                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-surface-dim ring-8 ring-surface">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>notifications_active</span>
                </div>
                <div className="ml-12">
                  <p className="text-body-sm font-bold text-primary">Auto-Reminders Sent</p>
                  <p className="text-label-sm text-on-surface-variant">6 Tenants Notified • Oct 25</p>
                </div>
              </div>

              {/* Timeline Item 4 */}
              <div className="relative flex items-center gap-6">
                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-surface-dim ring-8 ring-surface">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>event</span>
                </div>
                <div className="ml-12">
                  <p className="text-body-sm font-bold text-primary">Upcoming Renewal</p>
                  <p className="text-label-sm text-on-surface-variant">Lekki Flat C • Oct 30</p>
                </div>
              </div>
            </div>

            {/* Ecosystem Health */}
            <div className="mt-8 rounded-lg bg-primary-container p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-label-sm text-on-primary-container">Ecosystem Health</p>
                <span className="font-bold text-secondary-fixed">98%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-primary">
                <div className="h-full w-[98%] bg-secondary-container"></div>
              </div>
              <p className="mt-2 text-[11px] text-on-primary-container">Your portfolio trust rating is exceptional this month.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

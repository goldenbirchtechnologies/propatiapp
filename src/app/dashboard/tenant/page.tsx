'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function TenantDashboardPage() {
  return (
    <DashboardShell navigation={TENANT_NAVIGATION} userRole="tenant" userName="Chidi Okafor">
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Welcome back, Chidi
            </h2>
            <p className="text-on-surface-variant mt-1">
              Your portfolio status is currently <span className="text-success-bright font-bold">Excellent</span>.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Current Property Card */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden relative group">
                  <div className="absolute top-2 left-2 z-10 bg-success-bright text-white text-[10px] font-label-md px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    ACTIVE LEASE
                  </div>
                  <div className="w-full h-full bg-surface-container-high" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline-sm text-headline-sm text-primary">The Obsidian Penthouse</h3>
                      <p className="font-heading text-lg text-primary">
                        ₦2,500,000<span className="text-on-surface-variant text-sm font-normal">/yr</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="text-body-sm">Plot 12, Admiralty Way, Lekki Phase 1</span>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
                        <p className="text-[10px] font-label-md text-on-surface-variant uppercase tracking-wider">Landlord</p>
                        <p className="text-body-sm text-primary font-bold">Chief Adebayo</p>
                      </div>
                      <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
                        <p className="text-[10px] font-label-md text-on-surface-variant uppercase tracking-wider">Next Rent Due</p>
                        <p className="text-body-sm text-error font-bold">15 Dec 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 py-3 bg-primary-container text-white font-label-md rounded-lg hover:opacity-90 transition-all flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined text-sm">file_open</span>
                      View Agreement
                    </button>
                    <button className="px-4 py-3 border border-primary-container text-primary-container font-label-md rounded-lg hover:bg-primary-container/5 transition-all">
                      Contact Agent
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Payments Table */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h4 className="font-headline-sm text-headline-sm text-primary">Recent Payments</h4>
                <button className="text-primary-container font-label-md flex items-center gap-1 hover:underline">
                  View All <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high/50 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Reference No.</th>
                      <th className="px-6 py-3">Amount (₦)</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    <tr>
                      <td className="px-6 py-4 font-body-sm">Nov 12, 2023</td>
                      <td className="px-6 py-4 font-label-md text-on-surface-variant">EV-TX-99082</td>
                      <td className="px-6 py-4 font-bold text-primary">₦2,500,000</td>
                      <td className="px-6 py-4">
                        <span className="bg-success-bright/10 text-success-bright px-3 py-1 rounded-full text-[10px] font-bold">
                          SUCCESS
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary-container hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-body-sm">Oct 05, 2023</td>
                      <td className="px-6 py-4 font-label-md text-on-surface-variant">EV-TX-88123</td>
                      <td className="px-6 py-4 font-bold text-primary">₦150,000</td>
                      <td className="px-6 py-4">
                        <span className="bg-success-bright/10 text-success-bright px-3 py-1 rounded-full text-[10px] font-bold">
                          SUCCESS
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary-container hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-body-sm">Aug 20, 2023</td>
                      <td className="px-6 py-4 font-label-md text-on-surface-variant">EV-TX-77456</td>
                      <td className="px-6 py-4 font-bold text-primary">₦2,150,000</td>
                      <td className="px-6 py-4">
                        <span className="bg-on-secondary-container/10 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold">
                          PENDING
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-outline cursor-not-allowed">
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recommended Listings */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-headline-sm text-headline-sm text-primary">Recommended for You</h4>
                <p className="text-on-surface-variant text-sm italic">Based on your Ikoyi & VI search history</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="h-40 overflow-hidden relative">
                    <div className="w-full h-full bg-surface-container-high" />
                    <div className="absolute top-2 right-2 bg-primary-container/80 backdrop-blur-md text-white text-[10px] font-label-md px-2 py-1 rounded border border-white/20">
                      ₦8.5M / yr
                    </div>
                    <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 text-primary-container text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      VERIFIED
                    </div>
                  </div>
                  <div className="p-4">
                    <h5 className="font-heading text-base text-primary">Modern Duplex in Ikoyi</h5>
                    <p className="text-on-surface-variant text-xs flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      Old Ikoyi, Lagos
                    </p>
                  </div>
                </div>
                <div className="group bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="h-40 overflow-hidden relative">
                    <div className="w-full h-full bg-surface-container-high" />
                    <div className="absolute top-2 right-2 bg-primary-container/80 backdrop-blur-md text-white text-[10px] font-label-md px-2 py-1 rounded border border-white/20">
                      ₦4.2M / yr
                    </div>
                    <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 text-primary-container text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        stars
                      </span>
                      INSPECTED
                    </div>
                  </div>
                  <div className="p-4">
                    <h5 className="font-heading text-base text-primary">Luxe Studio in Victoria Island</h5>
                    <p className="text-on-surface-variant text-xs flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      Eko Atlantic, VI
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-card-hover transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg">payments</span>
                  <span className="text-success-bright text-label-sm font-bold">+₦1.2M this year</span>
                </div>
                <p className="text-on-surface-variant font-label-md text-label-md">Total Payments Made</p>
                <h3 className="font-headline-md text-headline-md text-primary">₦4.8M</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-card-hover transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg">assignment_turned_in</span>
                </div>
                <p className="text-on-surface-variant font-label-md text-label-md">Active Applications</p>
                <h3 className="font-headline-md text-headline-md text-primary">2</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-card-hover transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg">favorite</span>
                </div>
                <p className="text-on-surface-variant font-label-md text-label-md">Saved Properties</p>
                <h3 className="font-headline-md text-headline-md text-primary">8</h3>
              </div>
            </div>

            {/* Active Agreement Preview */}
            <section className="bg-surface-variant/40 rounded-xl p-6 border border-outline-variant relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-xl">pending_actions</span>
                <h4 className="font-headline-sm text-headline-sm text-primary">Pending Lease</h4>

              </div>
              <p className="text-body-sm text-on-surface-variant mb-4">
                A second lease agreement for <span className="font-bold text-primary">VGC Studio B</span> is currently under legal review.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-[11px] font-label-md">
                  <span>Verification Stage</span>
                  <span className="text-primary">85%</span>
                </div>
                <div className="w-full h-1.5 bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container w-[85%] rounded-full" />
                </div>
              </div>
              <button className="w-full py-2 bg-surface-container-lowest border border-outline-variant text-primary font-label-md rounded-lg hover:bg-surface-container transition-all">
                Track Application
              </button>
              <div className="absolute -right-2 -top-2 opacity-5">
                <span className="material-symbols-outlined text-[80px]">gavel</span>
              </div>
            </section>

            {/* Help Center / Quick Links */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-3">Need Assistance?</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-body-sm">
                    <span className="material-symbols-outlined text-base">support_agent</span>
                    Chat with verified agent
                  </Link>
                </li>
                <li>
                  <Link href="#" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-body-sm">
                    <span className="material-symbols-outlined text-base">help</span>
                    Tenant Rights & FAQs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-body-sm">
                    <span className="material-symbols-outlined text-base">bug_report</span>
                    Report a maintenance issue
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

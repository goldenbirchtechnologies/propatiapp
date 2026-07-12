'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function AgentDashboardPage() {
  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Hassan Aliyu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h3 className="font-heading text-headline-lg text-primary">
              Welcome back, Hassan
            </h3>
            <p className="text-on-surface-variant">Here is what is happening with your deals today.</p>
          </div>
        </div>

        {/* Top Row Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">account_balance_wallet</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Total Commission (₦)</p>
            <h4 className="font-heading text-2xl text-primary">₦12,400,000</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+12% this month</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">rocket_launch</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Active Deals</p>
            <h4 className="font-heading text-2xl text-primary">18</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>3 closed today</span>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">apartment</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Managed Units</p>
            <h4 className="font-heading text-2xl text-primary">42</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>95% Occupancy</span>
            </div>
          </div>
          {/* Stat 4 */}
          <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-y-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-[48px]">event_available</span>
            </div>
            <p className="mb-1 font-label-sm text-on-surface-variant">Pending Inspections</p>
            <h4 className="font-heading text-2xl text-primary">5</h4>
            <div className="mt-4 flex items-center gap-1 font-label-sm text-error">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>Action Required</span>
            </div>
          </div>
        </div>

        {/* Main Layout: Kanban + Widgets */}
        <div className="grid grid-cols-12 gap-6">
          {/* Deal Pipeline (Kanban Board) - 8 Cols */}
          <section className="col-span-12 xl:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-heading text-headline-sm text-primary">Deal Pipeline</h4>
              <div className="flex gap-2">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {/* Column 1: Enquiry */}
              <div className="flex-shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between bg-surface-container p-2 rounded-lg">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                    Enquiry
                  </span>
                  <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                    4
                  </span>
                </div>
                <div className="space-y-3">
                  {/* Card */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-2 shadow-sm hover:-translate-y-1 hover:shadow-card-hover transition-all cursor-grab active:cursor-grabbing">
                    <div className="w-full h-32 rounded-lg mb-2 overflow-hidden">
                      <div className="w-full h-full bg-surface-container-high" />
                    </div>
                    <div className="px-2 pb-2">
                      <h5 className="font-bold text-body-sm text-primary truncate">
                        The Obsidian Penthouse
                      </h5>
                      <p className="text-body-sm text-on-surface-variant mb-2">
                        Emeka Okafor
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-label-md bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                          2 Days
                        </span>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border border-surface bg-surface-dim"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-2 shadow-sm hover:-translate-y-1 transition-all">
                    <div className="px-2 py-2">
                      <h5 className="font-bold text-body-sm text-primary truncate">
                        Ikoyi Garden Suite
                      </h5>
                      <p className="text-body-sm text-on-surface-variant mb-2">
                        Bolanle T.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-label-md bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                          4 Days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Viewing */}
              <div className="flex-shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between bg-surface-container p-2 rounded-lg">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                    Viewing
                  </span>
                  <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                    3
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-2 shadow-sm hover:-translate-y-1 transition-all">
                    <div className="px-2 py-2">
                      <h5 className="font-bold text-body-sm text-primary truncate">
                        Victoria Island Studio
                      </h5>
                      <p className="text-body-sm text-on-surface-variant mb-2">
                        James Wilson
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-label-md bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                          1 Day
                        </span>
                        <span className="material-symbols-outlined text-sm text-secondary">
                          calendar_today
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Offer */}
              <div className="flex-shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between bg-surface-container p-2 rounded-lg">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                    Offer
                  </span>
                  <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                    2
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-secondary rounded-xl p-2 shadow-sm hover:-translate-y-1 transition-all">
                    <div className="px-2 py-2">
                      <h5 className="font-bold text-body-sm text-primary truncate">
                        Banana Island Villa
                      </h5>
                      <p className="text-body-sm text-on-surface-variant mb-2">
                        Aliko D.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-label-md bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                          6 Days
                        </span>
                        <span className="font-bold text-primary">₦45M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 4: Agreement */}
              <div className="flex-shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between bg-surface-container p-2 rounded-lg">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                    Agreement
                  </span>
                  <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                    1
                  </span>
                </div>
              </div>

              {/* Column 5: Completed */}
              <div className="flex-shrink-0 w-64 space-y-3">
                <div className="flex items-center justify-between bg-surface-container-high p-2 rounded-lg">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                    Completed
                  </span>
                  <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container px-2 rounded-full text-[10px] font-bold">
                    8
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar Widgets - 4 Cols */}
          <aside className="col-span-12 xl:col-span-4 space-y-6">
            {/* Commission Tracker Widget */}
            <div className="bg-primary-container text-on-primary rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
              <h4 className="font-heading text-headline-sm text-secondary-fixed mb-6 relative z-10">
                Commission Tracker
              </h4>
              <div className="space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-label-sm font-label-sm opacity-80">Paid</span>
                    <span className="text-body-sm font-bold text-secondary-fixed">₦8.2M</span>
                  </div>
                  <div className="h-2 bg-primary/40 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-container w-[65%] rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/20 p-4 rounded-lg border border-on-primary-container/10">
                    <p className="text-label-sm font-label-sm opacity-60 uppercase mb-1">
                      Pending
                    </p>
                    <p className="font-heading text-headline-sm text-secondary-fixed">
                      ₦3.1M
                    </p>
                  </div>
                  <div className="bg-primary/20 p-4 rounded-lg border border-on-primary-container/10">
                    <p className="text-label-sm font-label-sm opacity-60 uppercase mb-1">
                      Confirmed
                    </p>
                    <p className="font-heading text-headline-sm text-secondary-fixed">
                      ₦1.1M
                    </p>
                  </div>
                </div>
                <button className="w-full text-center py-2 text-label-md font-label-md text-secondary-fixed-dim hover:underline transition-all">
                  View Full Report →
                </button>
              </div>
            </div>

            {/* Top Listings */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-heading text-headline-sm text-primary">Top Listings</h4>
                <span className="text-label-sm font-label-sm text-secondary">Active: 42</span>
              </div>
              <div className="space-y-4">
                {/* Listing Item */}
                <div className="flex items-center gap-4 group cursor-pointer p-1 hover:bg-surface-container rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-surface-container-high" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-body-sm text-primary truncate">
                      Lekki Phase 1 Duplex
                    </p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">
                      ₦120M / Year
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-body-sm text-primary">452</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Views</p>
                  </div>
                </div>
                {/* Listing Item 2 */}
                <div className="flex items-center gap-4 group cursor-pointer p-1 hover:bg-surface-container rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-surface-container-high" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-body-sm text-primary truncate">
                      Ikeja GRA Boutique
                    </p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">
                      ₦8.5M / Year
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-body-sm text-primary">318</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Views</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 rounded-xl border border-primary py-3 font-label-md text-label-md text-primary transition-all hover:bg-primary hover:text-on-primary">
                Manage All Listings
              </button>
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

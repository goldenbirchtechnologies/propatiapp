'use client';

import { useUser } from '@clerk/nextjs';
import { Building2, CheckCircle2, Clock } from 'lucide-react';

interface AgentDashboardClientProps {
  userName: string;
  managedProperties: number;
  activeListings: number;
  pendingInvites: number;
}

export default function AgentDashboardClient({ userName, managedProperties, activeListings, pendingInvites }: AgentDashboardClientProps) {
  const { user } = useUser();

  return (
    <div className="dashboard-content-area fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Welcome, {userName}
            </h2>
            <p className="text-zinc-400 mt-3 text-base">Here is what is happening with your real estate activity today.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-zinc-950-lowest rounded-xl border border-zinc-800 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#10b981]/10 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-label-md uppercase tracking-wider text-zinc-400">Managed Properties</p>
                <p className="text-2xl font-headline-sm font-bold text-white">{managedProperties}</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950-lowest rounded-xl border border-zinc-800 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#10b981]/10 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-label-md uppercase tracking-wider text-zinc-400">Active Listings</p>
                <p className="text-2xl font-headline-sm font-bold text-white">{activeListings}</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950-lowest rounded-xl border border-zinc-800 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#10b981]/10 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-label-md uppercase tracking-wider text-zinc-400">Pending Invites</p>
                <p className="text-2xl font-headline-sm font-bold text-white">{pendingInvites}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 mt-0">
          <div className="col-span-12 space-y-8">
            <section className="bg-zinc-950-lowest rounded-xl border border-zinc-800 p-lg ">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-white mb-4">Active Deals</h3>
              <div className="section-content">
                <p className="text-body-sm text-zinc-400">No active deals yet. Start by browsing available listings.</p>
              </div>
              <div className="section-empty-msg items-center justify-center py-10 text-center">
                <p className="text-sm text-zinc-400">No active deals yet. Start by browsing available listings.</p>
              </div>
            </section>

            <section className="bg-zinc-950-lowest rounded-xl border border-zinc-800 p-lg ">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-white mb-4">Recent Messages</h3>
              <div className="section-content">
                <p className="text-body-sm text-zinc-400">No messages yet.</p>
              </div>
              <div className="section-empty-msg items-center justify-center py-10 text-center">
                <p className="text-sm text-zinc-400">No messages yet.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

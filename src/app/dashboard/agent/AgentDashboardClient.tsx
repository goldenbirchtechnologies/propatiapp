'use client';

import { Building2, CheckCircle2, Clock, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { StatCard, PageHeader } from '@/components/ui';
import Link from 'next/link';

interface AgentDashboardClientProps {
  userName: string;
  managedProperties: number;
  activeListings: number;
  pendingInvites: number;
  totalUnits: number;
  vacantUnits: number;
  enquiries: number;
}

export default function AgentDashboardClient({
  userName,
  managedProperties,
  activeListings,
  pendingInvites,
  totalUnits,
  vacantUnits,
  enquiries,
}: AgentDashboardClientProps) {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Agent Dashboard"
        description={`Welcome back, ${userName}. You are managing ${managedProperties} properties.`}
        actions={
          <Link
            href="/dashboard/agent/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Properties <ArrowRight size={14} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Managed Properties" value={String(managedProperties)} icon={<Building2 className="size-5" />} />
        <StatCard label="Active Listings" value={String(activeListings)} icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Vacant Units" value={String(vacantUnits)} icon={<Clock className="size-5" />} />
        <StatCard label="Pending Invites" value={String(pendingInvites)} icon={<Users className="size-5" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Managed Properties</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Properties assigned to you by landlords</p>
            </div>
            <Link href="/dashboard/agent/properties" className="text-xs text-emerald-400 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3">
              <div>
                <p className="text-sm font-medium text-white">Total Units</p>
                <p className="text-xs text-zinc-500">Across all managed properties</p>
              </div>
              <p className="text-lg font-bold text-white">{totalUnits}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3">
              <div>
                <p className="text-sm font-medium text-white">Vacant Units</p>
                <p className="text-xs text-zinc-500">Available for listing or tenancy</p>
              </div>
              <p className="text-lg font-bold text-white">{vacantUnits}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3">
              <div>
                <p className="text-sm font-medium text-white">Enquiries</p>
                <p className="text-xs text-zinc-500">New conversations to review</p>
              </div>
              <p className="text-lg font-bold text-white">{enquiries}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            <Link href="/dashboard/agent/properties" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-emerald-400" />
                <p className="text-sm text-white">Managed Properties</p>
              </div>
              <ArrowRight size={12} className="text-zinc-500" />
            </Link>
            <Link href="/dashboard/agent/listings" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <p className="text-sm text-white">Active Listings</p>
              </div>
              <ArrowRight size={12} className="text-zinc-500" />
            </Link>
            <Link href="/dashboard/agent/messages" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-emerald-400" />
                <p className="text-sm text-white">Messages</p>
              </div>
              <ArrowRight size={12} className="text-zinc-500" />
            </Link>
            <Link href="/dashboard/agent/payments" className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <p className="text-sm text-white">Payments</p>
              </div>
              <ArrowRight size={12} className="text-zinc-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

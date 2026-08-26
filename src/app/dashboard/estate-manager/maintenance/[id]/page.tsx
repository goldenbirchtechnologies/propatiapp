'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrganizationTicket } from '@/hooks/useOrganizationTickets';

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-zinc-900 text-zinc-500 border border-white/[0.08]' },
  medium: { label: 'Medium', className: 'bg-info/10 text-info border border-white/[0.08]' },
  high: { label: 'High', className: 'bg-amber-500/10 text-amber-400 border border-white/[0.08]' },
  urgent: { label: 'Urgent', className: 'bg-red-500/10 text-red-500 border border-white/[0.08]' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-red-500/10 text-red-500 border border-white/[0.08]' },
  assigned: { label: 'Assigned', className: 'bg-info/10 text-info border border-white/[0.08]' },
  in_progress: { label: 'In Progress', className: 'bg-amber-500/10 text-amber-400 border border-white/[0.08]' },
  resolved: { label: 'Resolved', className: 'bg-emerald-500/10 text-[#00ff66] border border-white/[0.08]' },
  closed: { label: 'Closed', className: 'bg-zinc-900 text-zinc-500 border border-white/[0.08]' },
};

const statusTimeline = [
  { status: 'open', label: 'Ticket Created', icon: <MessageSquare className="h-4 w-4" /> },
  { status: 'assigned', label: 'Assigned', icon: <User className="h-4 w-4" /> },
  { status: 'in_progress', label: 'In Progress', icon: <Loader2 className="h-4 w-4" /> },
  { status: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: 'closed', label: 'Closed', icon: <XCircle className="h-4 w-4" /> },
];

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { data: orgsData, isLoading: orgsLoading, error: orgsError, refetch: refetchOrgs } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const {
    data: ticketData,
    isLoading: ticketLoading,
    error: ticketError,
    refetch: refetchTicket,
  } = useOrganizationTicket(orgId || '', ticketId, !!orgId);

  const isLoading = orgsLoading || ticketLoading;
  const error = orgsError || ticketError;
  const ticket = ticketData?.data;

  const handleRetry = async () => {
    try {
      await refetchTicket();
      await refetchOrgs();
    } catch {
      // handled by error state
    }
  };

  if (isLoading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-white font-bold" style={{ fontSize: 'text-white', color: 'text-white' }}>
                  Maintenance Request
                </h1>
              </div>
            </div>
            <div className="glass-card border-red-500/30 bg-red-500/5">
              <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
                <Wrench className="h-12 w-12 mb-4" style={{ color: 'text-zinc-500' }} />
                <p className="font-medium text-white">Unable to load maintenance request</p>
                <p className="text-sm mt-1 mb-4" style={{ color: 'text-zinc-500' }}>
                  {error instanceof Error ? error.message : 'Request not found or access denied.'}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Retry
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/estate-manager/maintenance">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back to Maintenance
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  const currentStatusIndex = statusTimeline.findIndex((s) => s.status === (ticket.status as string));

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li className="flex items-center gap-2">
              <Link href="/dashboard/estate-manager" className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Home</Link>
            </li>
            <li className="flex items-center gap-2 text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>/</li>
            <li className="flex items-center gap-2">
              <Link href="/dashboard/estate-manager/maintenance" className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Maintenance</Link>
            </li>
            <li className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>/</li>
            <li className="font-medium text-xs text-xs uppercase tracking-wider text-white">{ticket.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white font-bold" style={{ fontSize: 'text-white', color: 'text-white' }}>
                {ticket.title}
              </h1>
              <p className="flex items-center gap-1 mt-1 text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>
                <MapPin className="h-4 w-4" />
                {ticket.listing?.title || ticket.listing?.address || 'No location linked'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', priorityConfig[ticket.priority]?.className)}>{priorityConfig[ticket.priority]?.label || ticket.priority}</span>
            <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', statusConfig[ticket.status]?.className)}>{statusConfig[ticket.status]?.label || ticket.status}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card">
            <div className="px-6 py-5 border-b border-white/[0.08]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2" className="text-white">
                <MessageSquare className="h-5 w-5 text-white" /> Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Category</p>
                <p className="font-medium capitalize text-sm text-white">{ticket.category || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Description</p>
                <p className="font-medium text-sm text-white">
                  {ticket.description || 'No description provided.'}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Created</p>
                <p className="font-medium flex items-center gap-2 text-sm text-white">
                  <Calendar className="h-4 w-4" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Resolved</p>
                  <p className="font-medium flex items-center gap-2 text-sm text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    {new Date(ticket.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card">
            <div className="px-6 py-5 border-b border-white/[0.08]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2" className="text-white">
                <User className="h-5 w-5 text-white" /> Assignee
              </h3>
            </div>
            <div className="p-6">
              {ticket.assignedToUser ? (
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'bg-surface', color: 'text-white' }}
                  >
                    {ticket.assignedToUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{ticket.assignedToUser.fullName}</p>
                    <p className="text-sm" style={{ color: 'text-zinc-500' }}>{ticket.assignedToUser.email}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="h-8 w-8 mx-auto mb-2" style={{ color: 'text-zinc-500', opacity: 0.5 }} />
                  <p className="text-sm" style={{ color: 'text-zinc-500' }}>Unassigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2" className="text-white">
              <Clock className="h-5 w-5 text-white" /> Progress Timeline
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-0">
              {statusTimeline.map((step, index) => {
                const isCompleted = currentStatusIndex >= index;
                const isCurrent = currentStatusIndex === index;
                return (
                  <div key={step.status} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{
                          background: isCompleted ? 'bg-zinc-900' : 'border-white/[0.08]',
                          color: isCompleted ? 'text-white' : 'text-zinc-500',
                        }}
                      >
                        {step.icon}
                      </div>
                      {index < statusTimeline.length - 1 && (
                        <div className="w-0.5 h-12" style={{ background: isCompleted ? 'text-white' : 'border-white/[0.08]' }} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className="font-medium text-sm" style={{ color: isCompleted ? 'text-white' : 'text-zinc-500' }}>{step.label}</p>
                      {isCurrent && ticket.status === step.status && (
                        <p className="text-xs text-xs uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>
                          Current step — {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      )}
                      {isCompleted && !isCurrent && (
                        <p className="text-xs text-xs uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>
                          {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrganizationTicket } from '@/hooks/useOrganizationTickets';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'tag-gray' },
  medium: { label: 'Medium', className: 'tag-blue' },
  high: { label: 'High', className: 'tag-amber' },
  urgent: { label: 'Urgent', className: 'tag-red' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'tag-red' },
  assigned: { label: 'Assigned', className: 'tag-blue' },
  in_progress: { label: 'In Progress', className: 'tag-amber' },
  resolved: { label: 'Resolved', className: 'tag-green' },
  closed: { label: 'Closed', className: 'tag-gray' },
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
      </DashboardShell>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Maintenance Request
              </h1>
            </div>
          </div>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text)' }}>Unable to load maintenance request</p>
              <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>
                {error instanceof Error ? error.message : 'Request not found or access denied.'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button asChild>
                  <Link href="/dashboard/estate-manager/maintenance">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Maintenance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const currentStatusIndex = statusTimeline.findIndex((s) => s.status === (ticket.status as string));

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li className="flex items-center gap-2">
              <Link href="/dashboard/estate-manager" style={{ color: 'var(--muted)' }}>Home</Link>
            </li>
            <li className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>/</li>
            <li className="flex items-center gap-2">
              <Link href="/dashboard/estate-manager/maintenance" style={{ color: 'var(--muted)' }}>Maintenance</Link>
            </li>
            <li style={{ color: 'var(--muted)' }}>/</li>
            <li className="font-medium" style={{ color: 'var(--text)' }}>{ticket.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {ticket.title}
              </h1>
              <p className="flex items-center gap-1 mt-1" style={{ color: 'var(--muted)' }}>
                <MapPin className="h-4 w-4" />
                {ticket.listing?.title || ticket.listing?.address || 'No location linked'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={priorityConfig[ticket.priority]?.className || 'tag-gray'}>
              {priorityConfig[ticket.priority]?.label || ticket.priority}
            </Badge>
            <Badge className={statusConfig[ticket.status]?.className || 'tag-gray'}>
              {statusConfig[ticket.status]?.label || ticket.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <MessageSquare className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Category</p>
                <p className="font-medium capitalize" style={{ color: 'var(--text)' }}>{ticket.category || '—'}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Description</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {ticket.description || 'No description provided.'}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Created</p>
                <p className="font-medium flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Calendar className="h-4 w-4" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Resolved</p>
                  <p className="font-medium flex items-center gap-2" style={{ color: 'var(--text)' }}>
                    <CheckCircle2 className="h-4 w-4" />
                    {new Date(ticket.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                Assignee
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.assignedToUser ? (
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--accent)' }}
                  >
                    {ticket.assignedToUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{ticket.assignedToUser.fullName}</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{ticket.assignedToUser.email}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Unassigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Clock className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              Progress Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                          background: isCompleted ? 'var(--accent-bg)' : 'var(--border)',
                          color: isCompleted ? 'var(--accent)' : 'var(--muted)',
                        }}
                      >
                        {step.icon}
                      </div>
                      {index < statusTimeline.length - 1 && (
                        <div
                          className="w-0.5 h-12"
                          style={{ background: isCompleted ? 'var(--accent)' : 'var(--border)' }}
                        />
                      )}
                    </div>
                    <div className="pb-8">
                      <p
                        className="font-medium"
                        style={{ color: isCompleted ? 'var(--text)' : 'var(--muted)' }}
                      >
                        {step.label}
                      </p>
                      {isCurrent && ticket.status === step.status && (
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          Current step — {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      )}
                      {isCompleted && !isCurrent && (
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

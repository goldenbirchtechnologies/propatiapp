'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  FileText,
  Shield,
  ScrollText,
  AlertCircle,
  Scroll,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ComplianceStats {
  totalUsers: number;
  totalAgreements: number;
  totalVerifications: number;
  totalAuditLogs: number;
  pendingVerifications: number;
  disputesOpen: number;
  conflictChecks: number;
  evidencePacks: number;
}

export interface AuditCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  action: string | null;
  actionLabel: string | null;
}

export interface ActionItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  href: string;
}

interface ComplianceClientProps {
  auditChecks: AuditCheck[];
  actionItems: ActionItem[];
  stats: ComplianceStats;
}

// ─── Status helpers ──────────────────────────────────────────────────────────
function statusColor(status: AuditCheck['status']) {
  switch (status) {
    case 'pass':
      return 'tag-green';
    case 'warn':
      return 'tag-amber';
    case 'fail':
      return 'tag-red';
    default:
      return 'tag-gray';
  }
}

function statusIcon(status: AuditCheck['status']) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-5 w-5 tag-green" />;
    case 'warn':
      return <AlertTriangle className="h-5 w-5 tag-amber" />;
    case 'fail':
      return <XCircle className="h-5 w-5 tag-red" />;
    default:
      return <AlertCircle className="h-5 w-5 tag-gray" />;
  }
}

function priorityBadge(priority: ActionItem['priority']) {
  switch (priority) {
    case 'high':
      return <Badge className="tag-red">High</Badge>;
    case 'medium':
      return <Badge className="tag-amber">Medium</Badge>;
    case 'low':
      return <Badge className="tag-gray">Low</Badge>;
    default:
      return null;
  }
}

function priorityIcon(priority: ActionItem['priority']) {
  switch (priority) {
    case 'high':
      return <AlertCircle className="h-4 w-4 tag-red" />;
    case 'medium':
      return <ClipboardList className="h-4 w-4 tag-amber" />;
    case 'low':
      return <Scroll className="h-4 w-4" style={{ color: 'var(--muted)' }} />;
  }
}

// ─── Stat card factory ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <Icon className="h-6 w-6 flex-shrink-0" style={{ color }} />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ComplianceClient({
  auditChecks,
  actionItems,
  stats,
}: ComplianceClientProps) {
  const passCount = auditChecks.filter((c) => c.status === 'pass').length;
  const warnCount = auditChecks.filter((c) => c.status === 'warn').length;
  const failCount = auditChecks.filter((c) => c.status === 'fail').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Compliance Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Overview of platform health, audit checks, and outstanding action items.
        </p>
      </div>

      {/* Status cards */}
      <div
        className="grid gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .compliance-status-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .compliance-status-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="compliance-status-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Checks Passed</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold tag-green">{passCount}</p>
            <CheckCircle2 className="h-5 w-5 tag-green" />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            of {auditChecks.length} total checks
          </p>
        </div>
        <div className="compliance-status-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Warnings</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold tag-amber">{warnCount}</p>
            <AlertTriangle className="h-5 w-5 tag-amber" />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            requires attention
          </p>
        </div>
        <div className="compliance-status-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Failures</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold tag-red">{failCount}</p>
            <XCircle className="h-5 w-5 tag-red" />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            immediate action needed
          </p>
        </div>
        <div className="compliance-status-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Open Action Items</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {actionItems.length}
            </p>
            <ClipboardList className="h-5 w-5" style={{ color: 'var(--muted)' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            awaiting resolution
          </p>
        </div>
      </div>

      {/* Platform stat cards */}
      <div
        className="grid gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .compliance-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .compliance-metrics-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="compliance-metrics-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Users</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{stats.totalUsers}</p>
        </div>
        <div className="compliance-metrics-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Agreements</p>
          <p className="text-2xl font-bold mt-1 tag-blue">{stats.totalAgreements}</p>
        </div>
        <div className="compliance-metrics-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Audit Logs</p>
          <p className="text-2xl font-bold mt-1 tag-purple">{stats.totalAuditLogs}</p>
        </div>
        <div className="compliance-metrics-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Evidence Packs</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{stats.evidencePacks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Shield className="h-5 w-5" />
              Audit Checks
            </CardTitle>
            <CardDescription style={{ color: 'var(--muted)' }}>
              Automated compliance scan across platform domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditChecks.length === 0 ? (
              <div className="text-center py-10">
                <ScrollText className="mx-auto h-10 w-10" style={{ color: 'var(--muted)' }} />
                <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
                  No audit checks available at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditChecks.map((check) => (
                  <div
                    key={check.id}
                    className="card p-4 flex items-start gap-3"
                    style={{ display: 'flex' }}
                  >
                    <div className="mt-0.5">{statusIcon(check.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                        {check.label}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                        {check.detail}
                      </p>
                    </div>
                    {check.action && check.actionLabel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="flex-shrink-0"
                      >
                        <Link href={check.action}>{check.actionLabel}</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <AlertCircle className="h-5 w-5" />
              Action Items
            </CardTitle>
            <CardDescription style={{ color: 'var(--muted)' }}>
              Tasks requiring admin attention or follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {actionItems.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto h-10 w-10 tag-green" />
                <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
                  All caught up
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                  No outstanding action items.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="card p-4 flex items-start gap-3 block hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="mt-0.5">{priorityIcon(item.priority)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                          {item.title}
                        </p>
                        {priorityBadge(item.priority)}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

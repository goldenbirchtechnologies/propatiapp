'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Gavel,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Scale,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
interface DisputeDetail {
  id: string;
  listingId: string | null;
  raisedBy: string;
  type: string;
  status: string;
  description: string;
  resolution: string | null;
  adminId: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  raisedByUser: { id: string; fullName: string; email: string } | null;
  admin: { id: string; fullName: string } | null;
  listing: { id: string; title: string; address: string } | null;
  lawFirmCase: { id: string; status: string } | null;
  evidencePack: { id: string; status: string } | null;
}
interface DisputeDetailClientProps {
  dispute: DisputeDetail;
  initialError?: string;
const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  open: { label: 'Open', className: 'tag-amber', icon: <AlertCircle className="h-4 w-4" /> },
  investigating: { label: 'Investigating', className: 'tag-blue', icon: <Clock className="h-4 w-4" /> },
  routed: { label: 'Routed', className: 'tag-purple', icon: <ArrowLeftRight className="h-4 w-4" /> },
  consent_required: { label: 'Consent Required', className: 'tag-blue', icon: <User className="h-4 w-4" /> },
  consent_granted: { label: 'Consent Granted', className: 'tag-teal', icon: <User className="h-4 w-4" /> },
  conflict_check: { label: 'Conflict Check', className: 'tag-amber', icon: <Scale className="h-4 w-4" /> },
  engaged: { label: 'Engaged', className: 'tag-blue', icon: <Scale className="h-4 w-4" /> },
  mediated: { label: 'Mediated', className: 'tag-purple', icon: <Gavel className="h-4 w-4" /> },
  resolved: { label: 'Resolved', className: 'tag-green', icon: <CheckCircle2 className="h-4 w-4" /> },
  closed: { label: 'Closed', className: 'tag-gray', icon: <CheckCircle2 className="h-4 w-4" /> },
};
export default function DisputeDetailClient({ dispute: initialDispute, initialError }: DisputeDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [dispute] = useState(initialDispute);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(initialError || null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMediationForm, setShowMediationForm] = useState(false);
  const [mediationDate, setMediationDate] = useState('');
  const [mediationNotes, setMediationNotes] = useState('');
  const handleAction = async (action: string, resolution?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/disputes/${dispute.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resolution }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update dispute');
      toast({ title: 'Success', description: `Dispute marked as ${action}` });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update dispute',
        variant: 'destructive',
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
  const statusInfo = statusConfig[dispute.status] || statusConfig['open'];
  const handleConsentRequired = async () => {
    await handleAction('consent_required');
  const handleConsentGranted = async () => {
    await handleAction('consent_granted');
  const handleEngageMediation = async () => {
    if (!mediationDate) {
        title: 'Validation',
        description: 'Please select a mediation date.',
      return;
    await handleAction('engagemediation', mediationNotes || undefined);
    setShowMediationForm(false);
    setMediationDate('');
    setMediationNotes('');
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dispute Details</h1>
            <p className="text-muted-foreground mt-1">Resolve and manage platform disputes</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">Unable to load page</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
    );
        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => router.push('/admin/disputes')} className="hover:text-foreground">
              Disputes
            <MaterialIcon name="/" className="material-symbols-outlined" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{dispute.id.slice(-8).toUpperCase()}</span>
          </nav>
        <Badge className={statusInfo.className}>
          <span className="flex items-center gap-1">
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </Badge>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Dispute Information</h3>
              <div className="space-y-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.type}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</p>
                  <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Description</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{dispute.description}</p>
                {dispute.resolution && (
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Resolution</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{dispute.resolution}</p>
                )}
                <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Parties Involved</h3>
                <div className="p-3 rounded-lg bg-[var(--surface-elevated)]">
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Raised By</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.raisedByUser?.fullName || 'Unknown'}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{dispute.raisedByUser?.email}</p>
                {dispute.listing && (
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Listing</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.listing.title}</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{dispute.listing.address}</p>
                {dispute.admin && (
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Assigned Admin</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.admin.fullName}</p>
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {dispute.status === 'open' && (
                <Button onClick={() => handleAction('investigate')} disabled={actionLoading}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start Investigation
              {(dispute.status === 'open' || dispute.status === 'investigating') && (
                <Button variant="outline" onClick={() => handleAction('assign')} disabled={actionLoading}>
                  <User className="h-4 w-4 mr-2" />
                  Assign to Me
                <Button variant="outline" onClick={() => handleAction('escalate')} disabled={actionLoading}>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Escalate
              {(dispute.status === 'investigating' || dispute.status === 'routed' || dispute.status === 'conflict_check') && (
                <Button variant="outline" onClick={handleConsentRequired} disabled={actionLoading}>
                  <Users className="h-4 w-4 mr-2" />
                  Request Consent
              {dispute.status === 'consent_required' && (
                <Button variant="outline" onClick={handleConsentGranted} disabled={actionLoading}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Consent Granted
              {(dispute.status === 'consent_granted' || dispute.status === 'engaged') && (
                <Button variant="outline" onClick={() => setShowMediationForm(!showMediationForm)} disabled={actionLoading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {showMediationForm ? 'Cancel Scheduling' : 'Schedule Mediation'}
              {showMediationForm && (
                <div className="w-full rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Schedule Mediation Session</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Label htmlFor="mediation-date">Mediation Date</Label>
                      <Input
                        id="mediation-date"
                        type="date"
                        value={mediationDate}
                        onChange={(e) => setMediationDate(e.target.value)}
                        className="mt-1"
                      />
                      <Label htmlFor="mediation-notes">Session Notes</Label>
                        id="mediation-notes"
                        placeholder="Notes, venue, participants…"
                        value={mediationNotes}
                        onChange={(e) => setMediationNotes(e.target.value)}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowMediationForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleEngageMediation} disabled={actionLoading}>
                      Confirm Mediation
              {dispute.status === 'investigating' && (
                <Button onClick={() => handleAction('mediate')} disabled={actionLoading}>
                  <Gavel className="h-4 w-4 mr-2" />
                  Mark Mediated
              {(dispute.status === 'mediated' || dispute.status === 'investigating') && (
                <Button variant="success" onClick={() => handleAction('resolve')} disabled={actionLoading}>
                  Resolve
              {dispute.status !== 'closed' && dispute.status !== 'resolved' && (
                <Button variant="outline" onClick={() => handleAction('close')} disabled={actionLoading}>
                  Close Without Resolution
        </TabsContent>
        <TabsContent value="timeline" className="mt-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Event Timeline</h3>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-0.5 h-16 bg-border mt-2" />
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Dispute Raised</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {new Date(dispute.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>By {dispute.raisedByUser?.fullName}</p>
              {dispute.resolvedAt && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <p className="font-medium" style={{ color: 'var(--text)' }}>Dispute Resolved</p>
                      {new Date(dispute.resolvedAt).toLocaleString()}
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>By {dispute.admin.fullName}</p>
        <TabsContent value="evidence" className="mt-6">
          {dispute.evidencePack ? (
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Evidence Pack</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Pack ID</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.evidencePack.id}</p>
                  <Badge className="tag-blue">{dispute.evidencePack.status}</Badge>
              <div className="mt-6">
                <Button variant="outline" onClick={() => router.push(`/admin/evidence-packs/${(dispute.evidencePack!).id}`)}>
                  View Full Evidence Pack
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
              <div className="text-gray-400 mb-3">
                <FileText className="mx-auto h-12 w-12" />
              <h3 className="text-lg font-medium text-gray-900">No evidence pack attached</h3>
              <p className="mt-1 text-gray-500">Evidence will appear here once submitted for this dispute.</p>
          {dispute.lawFirmCase && (
            <div className="card p-6 mt-6">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Related Law Firm Case</h3>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Case {(dispute.lawFirmCase)!.id}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Status: {(dispute.lawFirmCase)!.status}</p>
                <Button variant="outline" onClick={() => router.push(`/admin/business/law-firm-cases/${(dispute.lawFirmCase)!.id}`)}>
                  View Case
      </Tabs>
import MaterialIcon from '@/components/icons/material-icon';

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {

  ArrowLeft,
  Gavel,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Scale,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface DisputeDetail {
  id: string;
  listingId: string | null;
  raisedBy: string;
  type: string;
  status: string;
  description: string;
  resolution: string | null;
  adminId: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  raisedByUser: { id: string; fullName: string; email: string } | null;
  admin: { id: string; fullName: string } | null;
  listing: { id: string; title: string; address: string } | null;
  lawFirmCase: { id: string; status: string } | null;
  evidencePack: { id: string; status: string } | null;
}

interface DisputeDetailClientProps {
  dispute: DisputeDetail;
  initialError?: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  open: { label: 'Open', className: 'tag-amber', icon: <AlertCircle className="h-4 w-4" /> },
  investigating: { label: 'Investigating', className: 'tag-blue', icon: <Clock className="h-4 w-4" /> },
  routed: { label: 'Routed', className: 'tag-purple', icon: <ArrowLeftRight className="h-4 w-4" /> },
  consent_required: { label: 'Consent Required', className: 'tag-blue', icon: <User className="h-4 w-4" /> },
  consent_granted: { label: 'Consent Granted', className: 'tag-teal', icon: <User className="h-4 w-4" /> },
  conflict_check: { label: 'Conflict Check', className: 'tag-amber', icon: <Scale className="h-4 w-4" /> },
  engaged: { label: 'Engaged', className: 'tag-blue', icon: <Scale className="h-4 w-4" /> },
  mediated: { label: 'Mediated', className: 'tag-purple', icon: <Gavel className="h-4 w-4" /> },
  resolved: { label: 'Resolved', className: 'tag-green', icon: <CheckCircle2 className="h-4 w-4" /> },
  closed: { label: 'Closed', className: 'tag-gray', icon: <CheckCircle2 className="h-4 w-4" /> },
};

export default function DisputeDetailClient({ dispute: initialDispute, initialError }: DisputeDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [dispute] = useState(initialDispute);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(initialError || null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMediationForm, setShowMediationForm] = useState(false);
  const [mediationDate, setMediationDate] = useState('');
  const [mediationNotes, setMediationNotes] = useState('');

  const handleAction = async (action: string, resolution?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/disputes/${dispute.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resolution }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update dispute');
      }

      toast({ title: 'Success', description: `Dispute marked as ${action}` });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update dispute',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const statusInfo = statusConfig[dispute.status] || statusConfig['open'];

  const handleConsentRequired = async () => {
    await handleAction('consent_required');
  };

  const handleConsentGranted = async () => {
    await handleAction('consent_granted');
  };

  const handleEngageMediation = async () => {
    if (!mediationDate) {
      toast({
        title: 'Validation',
        description: 'Please select a mediation date.',
        variant: 'destructive',
      });
      return;
    }
    await handleAction('engagemediation', mediationNotes || undefined);
    setShowMediationForm(false);
    setMediationDate('');
    setMediationNotes('');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dispute Details</h1>
            <p className="text-muted-foreground mt-1">Resolve and manage platform disputes</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">Unable to load page</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              router.refresh();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => router.push('/admin/disputes')} className="hover:text-foreground">
              Disputes
            </button>
            <MaterialIcon name="/" className="material-symbols-outlined" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{dispute.id.slice(-8).toUpperCase()}</span>
          </nav>
        </div>
        <Badge className={statusInfo.className}>
          <span className="flex items-center gap-1">
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Dispute Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</p>
                  <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Description</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{dispute.description}</p>
                </div>
                {dispute.resolution && (
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Resolution</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{dispute.resolution}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Parties Involved</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[var(--surface-elevated)]">
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Raised By</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.raisedByUser?.fullName || 'Unknown'}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{dispute.raisedByUser?.email}</p>
                </div>
                {dispute.listing && (
                  <div className="p-3 rounded-lg bg-[var(--surface-elevated)]">
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Listing</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.listing.title}</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{dispute.listing.address}</p>
                  </div>
                )}
                {dispute.admin && (
                  <div className="p-3 rounded-lg bg-[var(--surface-elevated)]">
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Assigned Admin</p>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.admin.fullName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {dispute.status === 'open' && (
                <Button onClick={() => handleAction('investigate')} disabled={actionLoading}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start Investigation
                </Button>
              )}
              {(dispute.status === 'open' || dispute.status === 'investigating') && (
                <Button variant="outline" onClick={() => handleAction('assign')} disabled={actionLoading}>
                  <User className="h-4 w-4 mr-2" />
                  Assign to Me
                </Button>
              )}
              {(dispute.status === 'open' || dispute.status === 'investigating') && (
                <Button variant="outline" onClick={() => handleAction('escalate')} disabled={actionLoading}>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              )}
              {(dispute.status === 'investigating' || dispute.status === 'routed' || dispute.status === 'conflict_check') && (
                <Button variant="outline" onClick={handleConsentRequired} disabled={actionLoading}>
                  <Users className="h-4 w-4 mr-2" />
                  Request Consent
                </Button>
              )}
              {dispute.status === 'consent_required' && (
                <Button variant="outline" onClick={handleConsentGranted} disabled={actionLoading}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Consent Granted
                </Button>
              )}
              {(dispute.status === 'consent_granted' || dispute.status === 'engaged') && (
                <Button variant="outline" onClick={() => setShowMediationForm(!showMediationForm)} disabled={actionLoading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {showMediationForm ? 'Cancel Scheduling' : 'Schedule Mediation'}
                </Button>
              )}
              {showMediationForm && (
                <div className="w-full rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Schedule Mediation Session</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="mediation-date">Mediation Date</Label>
                      <Input
                        id="mediation-date"
                        type="date"
                        value={mediationDate}
                        onChange={(e) => setMediationDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mediation-notes">Session Notes</Label>
                      <Input
                        id="mediation-notes"
                        placeholder="Notes, venue, participants…"
                        value={mediationNotes}
                        onChange={(e) => setMediationNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowMediationForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleEngageMediation} disabled={actionLoading}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Confirm Mediation
                    </Button>
                  </div>
                </div>
              )}
              {dispute.status === 'investigating' && (
                <Button onClick={() => handleAction('mediate')} disabled={actionLoading}>
                  <Gavel className="h-4 w-4 mr-2" />
                  Mark Mediated
                </Button>
              )}
              {(dispute.status === 'mediated' || dispute.status === 'investigating') && (
                <Button variant="success" onClick={() => handleAction('resolve')} disabled={actionLoading}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              )}
              {dispute.status !== 'closed' && dispute.status !== 'resolved' && (
                <Button variant="outline" onClick={() => handleAction('close')} disabled={actionLoading}>
                  Close Without Resolution
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Event Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-0.5 h-16 bg-border mt-2" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Dispute Raised</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {new Date(dispute.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>By {dispute.raisedByUser?.fullName}</p>
                </div>
              </div>
              {dispute.resolvedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>Dispute Resolved</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {new Date(dispute.resolvedAt).toLocaleString()}
                    </p>
                    {dispute.admin && (
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>By {dispute.admin.fullName}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          {dispute.evidencePack ? (
            <div className="card p-6">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Evidence Pack</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Pack ID</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{dispute.evidencePack.id}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</p>
                  <Badge className="tag-blue">{dispute.evidencePack.status}</Badge>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" onClick={() => router.push(`/admin/evidence-packs/${(dispute.evidencePack!).id}`)}>
                  View Full Evidence Pack
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
              <div className="text-gray-400 mb-3">
                <FileText className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No evidence pack attached</h3>
              <p className="mt-1 text-gray-500">Evidence will appear here once submitted for this dispute.</p>
            </div>
          )}
          {dispute.lawFirmCase && (
            <div className="card p-6 mt-6">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Related Law Firm Case</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Case {(dispute.lawFirmCase)!.id}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Status: {(dispute.lawFirmCase)!.status}</p>
                </div>
                <Button variant="outline" onClick={() => router.push(`/admin/business/law-firm-cases/${(dispute.lawFirmCase)!.id}`)}>
                  View Case
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

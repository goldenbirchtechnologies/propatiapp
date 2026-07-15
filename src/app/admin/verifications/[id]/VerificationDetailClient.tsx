'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, XCircle, FileText, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface VerificationDetail {
  id: string;
  listingId: string;
  ownerId: string;
  currentLayer: number;
  overallStatus: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  listing: { id: string; title: string; address: string; state: string; propertyType: string | null; price: unknown } | null;
  owner: { id: string; fullName: string; email: string; phone: string | null } | null;
  reviewer: { id: string; fullName: string } | null;
  l4Agent: { id: string; fullName: string } | null;
  documents: { id: string; documentType: string; url: string; uploadedAt: string }[];
}

interface VerificationDetailClientProps {
  verification: VerificationDetail;
  initialError?: string;
}

export default function VerificationDetailClient({ verification: initialVerification, initialError }: VerificationDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [verification] = useState(initialVerification);
  const [error, setError] = useState<string | null>(initialError || null);
  const [activeTab, setActiveTab] = useState('actions');
  const [note, setNote] = useState(verification.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const handleApprove = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/verifications/${verification.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to approve verification');
      }
      toast({ title: 'Success', description: 'Verification approved successfully' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update verification',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/verifications/${verification.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to reject verification');
      }
      toast({ title: 'Success', description: 'Verification rejected' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update verification',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Verification Details</h1>
            <p className="text-muted-foreground mt-1">Unable to load page</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
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

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="tag-green">Approved</Badge>;
      case 'rejected':
        return <Badge className="tag-red">Rejected</Badge>;
      case 'pending':
        return <Badge className="tag-amber">Pending</Badge>;
      case 'certified':
        return <Badge className="tag-green">Certified</Badge>;
      case 'in_progress':
        return <Badge className="tag-amber">In Progress</Badge>;
      default:
        return <Badge className="tag-gray">{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => router.push('/admin/verifications')} className="hover:text-foreground">
              Verifications
            </button>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[180px]">{verification.id.slice(-8).toUpperCase()}</span>
          </nav>
        </div>
        {statusBadge(verification.overallStatus)}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Verification Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Listing</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{verification.listing?.title ?? 'Unknown'}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {verification.listing?.address} — {verification.listing?.state}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Owner</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{verification.owner?.fullName ?? 'Unknown'}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{verification.owner?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Overall Status</p>
                  {statusBadge(verification.overallStatus)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Submitted</p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{new Date(verification.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Administrative Actions</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Update the verification workflow as needed.</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleApprove} disabled={saving}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Verification
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={saving}>
                  <XCircle className="h-4 w-4 mr-2" /> Reject Verification
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Evidence & Layer Timeline</h3>
            <div className="space-y-6">
              {verification.documents?.length ? (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                    Uploaded Documents ({verification.documents.length})
                  </p>
                  <div className="space-y-2">
                    {verification.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{doc.documentType}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(doc.uploadedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline"
                          style={{ color: 'var(--accent)' }}
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No documents uploaded yet.</p>
              )}

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                  Layer {verification.currentLayer} — {verification.overallStatus.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${(verification.currentLayer / 5) * 100}%`, background: 'var(--primary)' }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {verification.currentLayer}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Admin Notes</h3>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add internal notes about this verification..."
              className="w-full rounded-lg border p-3 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--text)' }}
              rows={5}
            />
            <Button disabled={saving}>{saving ? 'Saving...' : 'Save Notes'}</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

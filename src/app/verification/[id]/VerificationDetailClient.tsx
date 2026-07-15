'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {

  ArrowLeft,
  Snowflake,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  Camera,
  MapPin,
  Shield,
  Award,
  RotateCcw,
  Mail,
  ClipboardList,
} from 'lucide-react';
import { FrozenState } from '@/components/feedback/FrozenState';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { isFrozen, getStatusMessage } from '@/lib/verification-helpers';
import { VerificationLayerStatus } from '@prisma/client';

interface VerificationDetailClientProps {
  verification: {
    id: string;
    listingId: string;
    ownerId: string;
    currentLayer: number;
    overallStatus: string;
    l1Status: VerificationLayerStatus | null;
    l2Status: VerificationLayerStatus | null;
    l3Status: VerificationLayerStatus | null;
    l4Status: VerificationLayerStatus | null;
    l5Status: VerificationLayerStatus | null;
    adminNotes: string | null;
    frozenReason: string | null;
    frozenAt: string | null;
    frozenBy: string | null;
    createdAt: string;
    updatedAt: string;
    reviewedAt: string | null;
    listing: { id: string; title: string; address: string; state: string; propertyType?: string | null; price?: unknown; verificationTier: string | null } | null;
    owner: { id: string; fullName: string; email: string; phone: string | null } | null;
    reviewer: { id: string; fullName: string } | null;
    l4Agent: { id: string; fullName: string } | null;
    documents: {
      id: string;
      documentType: string;
      url: string;
      uploadedAt: string;
      fileName: string | null;
      mimeType: string | null;
    }[];
  } | null;
  error?: string;
  isOwner?: boolean;
  userRole?: string;
}

export default function VerificationDetailClient({
  verification,
  error,
  isOwner,
  userRole,
}: VerificationDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('overview');

  if (error || !verification) {
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600 font-medium">{error || 'Verification not found'}</p>
            <Button className="mt-4" onClick={() => router.refresh()}>
              <RotateCcw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const frozen = isFrozen(verification as unknown);
  const statusMessage = getStatusMessage(verification as unknown);
  const layerNames = [
    'Not Started',
    'Document Verification',
    'Identity Verification',
    'Video Verification',
    'Physical Inspection',
    'Admin Certification',
  ];
  const layerStatuses = [
    null,
    verification.l1Status || 'pending',
    verification.l2Status || 'pending',
    verification.l3Status || 'pending',
    verification.l4Status || 'pending',
    verification.l5Status || 'pending',
  ] as string[];

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
      case 'frozen':
        return <Badge className="tag-blue">Frozen</Badge>;
      case 'in_progress':
        return <Badge className="tag-blue">In Progress</Badge>;
      default:
        return <Badge>{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  const layerBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="tag-green">Approved</Badge>;
      case 'rejected':
        return <Badge className="tag-red">Rejected</Badge>;
      case 'pending':
        return <Badge className="tag-amber">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const nextSteps: string[] = [];
  if (!frozen && verification.overallStatus !== 'certified' && verification.overallStatus !== 'rejected') {
    const cl = verification.currentLayer;
    if (cl === 1 && layerStatuses[1] === 'pending') {
      nextSteps.push(
        'Upload Certificate of Occupancy',
        'Upload Deed of Assignment',
        'Upload Building Plan',
        'Upload Tax Clearance or Receipt'
      );
    }
    if (cl === 1 && layerStatuses[1] === 'pending') {
      nextSteps.push('Waiting for admin review of documents');
    }
    if (cl === 2 && layerStatuses[2] === 'pending') {
      nextSteps.push('Verify NIN or BVN');
      nextSteps.push('Ensure name matches documents from Layer 1');
      nextSteps.push('Identity will be verified via Prembly');
    }
    if (cl === 2 && layerStatuses[2] !== 'pending') {
      nextSteps.push('Identity verification in progress');
    }
    if (cl === 3 && layerStatuses[3] === 'pending') {
      nextSteps.push('Record a video walkthrough of the property');
      nextSteps.push('Show the QR code provided in the video');
      nextSteps.push('Video must be clear and show all rooms');
    }
    if (cl === 3 && layerStatuses[3] !== 'pending') {
      nextSteps.push('Waiting for admin review of video');
    }
    if (cl === 4 && layerStatuses[4] === 'pending') {
      nextSteps.push('Schedule physical inspection');
      nextSteps.push('Agent will visit the property');
      nextSteps.push('Ensure property is accessible on inspection date');
    }
    if (cl === 4 && layerStatuses[4] !== 'pending') {
      nextSteps.push('Inspection scheduled or in progress');
    }
    if (cl === 5 && layerStatuses[5] === 'pending') {
      nextSteps.push('Admin is reviewing all verification layers');
      nextSteps.push('Final certification will be granted upon approval');
      nextSteps.push('Your property will receive the Certified badge');
    }
  }

  const retryActions: { label: string; href: string; variant?: 'default' | 'outline' | 'secondary' }[] = [];
  if (verification.overallStatus === 'rejected') {
    retryActions.push({
      label: 'Resubmit Verification',
      href: `/dashboard/landlord/verify?listingId=${verification.listingId}`,
      variant: 'default',
    });
  }
  if (frozen) {
    retryActions.push({ label: 'Open Support Ticket', href: '/support', variant: 'secondary' });
    retryActions.push({ label: 'Submit Appeal', href: '/appeal', variant: 'outline' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => router.push('/verification')} className="hover:text-foreground">
              Verifications
            </button>
            <MaterialIcon name="/" className="material-symbols-outlined" />
            <span className="text-foreground font-medium truncate max-w-[180px]">
              {verification.id.slice(-8).toUpperCase()}
            </span>
          </nav>
        </div>
        {statusBadge(verification.overallStatus)}
      </div>

      {frozen ? (
        <FrozenState
          title={verification.listing?.title ? `${verification.listing.title} — Verification Frozen` : 'Verification Frozen'}
          description={verification.frozenReason || 'Your verification has been temporarily frozen.'}
          ticketHref="/support"
          ticketLabel="Open a ticket"
          appealHref="/appeal"
          appealLabel="Submit an appeal"
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Title</p>
                    <p className="font-medium">{verification.listing?.title ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Address</p>
                    <p className="text-sm">{verification.listing?.address} — {verification.listing?.state}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Owner</p>
                    <p className="text-sm">{verification.owner?.fullName ?? 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Overall</p>
                    <div className="mt-1">{statusBadge(verification.overallStatus)}</div>
                    <p className="text-xs text-muted-foreground mt-1">{statusMessage}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Current Layer</p>
                    <p className="text-sm">Layer {verification.currentLayer}: {layerNames[verification.currentLayer]}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Submitted</p>
                    <p className="text-sm">{formatDateTime(verification.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Last Updated</p>
                    <p className="text-sm">{formatRelativeTime(verification.updatedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {verification.overallStatus === 'certified' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Fully Certified</p>
                    <p className="text-sm text-green-600">This property has completed all verification layers.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {verification.overallStatus === 'rejected' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Verification Rejected</p>
                    <p className="text-sm text-red-600">
                      {verification.adminNotes || 'Please review the requirements and try again.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {nextSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {nextSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {retryActions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {retryActions.map((action) => (
                  <Button key={action.label} asChild variant={action.variant || 'default'}>
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="layers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {layerNames.slice(1).map((name, idx) => {
                    const layer = idx + 1;
                    const status = layerStatuses[layer];
                    const isCurrent = layer === verification.currentLayer && verification.overallStatus === 'in_progress';
                    return (
                      <div
                        key={layer}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          isCurrent ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                            status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : isCurrent
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {status === 'approved' ? <CheckCircle2 className="h-5 w-5" /> : layer}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">Layer {layer}</p>
                        </div>
                        <div>{layerBadge(status)}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {verification.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {verification.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.documentType}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.fileName || 'No name'} • {formatRelativeTime(doc.uploadedAt)}
                            </p>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Verification Created</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(verification.createdAt)}</p>
                    </div>
                  </div>
                  {verification.reviewedAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reviewed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(verification.reviewedAt)} • {verification.reviewer?.fullName ?? 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                  {frozen && verification.frozenAt && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <Snowflake className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Frozen</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(verification.frozenAt)}</p>
                        {verification.frozenReason && (
                          <p className="text-xs text-muted-foreground">{verification.frozenReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {verification.overallStatus === 'certified' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Certified</p>
                        <p className="text-xs text-muted-foreground">Property is fully verified and certified.</p>
                      </div>
                    </div>
                  )}
                  {verification.overallStatus === 'rejected' && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-700">Rejected</p>
                        <p className="text-xs text-muted-foreground">
                          {verification.adminNotes || 'Verification was rejected.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

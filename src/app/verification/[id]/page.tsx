import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationService } from '@/lib/verification';
import {
  VerificationOverallStatus,
  VerificationLayerStatus,
} from '@prisma/client';
import type { Metadata } from 'next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FrozenState } from '@/components/feedback/FrozenState';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verification Details — PROPATI',
};

export const dynamic = 'force-dynamic';

// ─── Status badge helper ──────────────────────────────────────────────────────
function statusBadge(status: VerificationOverallStatus) {
  const map: Record<string, { label: string; variant: string }> = {
    not_started: { label: 'Not Started', variant: 'secondary' },
    in_progress: { label: 'In Progress', variant: 'default' },
    certified: { label: 'Certified', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    frozen: { label: 'Frozen', variant: 'outline' },
  };
  const s = map[status] ?? { label: status, variant: 'secondary' };
  return <Badge variant={s.variant as unknown}>{s.label}</Badge>;
}

// ─── Layer badge helper ────────────────────────────────────────────────────────
function layerBadge(status: VerificationLayerStatus | null) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

// ─── Step-icon mapping ─────────────────────────────────────────────────────────
const STEP_LABELS = ['Documents', 'Identity Match', 'Live Video', 'Physical Inspection', 'Certification'];

function StepIcon({ index, layerStatus }: { index: number; layerStatus: VerificationLayerStatus | null }) {
  const num = index + 1;
  const bg =
    layerStatus === 'approved'
      ? 'bg-green-500 text-white'
      : layerStatus === 'rejected'
      ? 'bg-red-500 text-white'
      : layerStatus === 'pending'
      ? 'bg-yellow-500 text-white'
      : 'bg-muted text-muted-foreground';
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${bg}`}>
      {num}
    </div>
  );
}

// ─── Overview content ──────────────────────────────────────────────────────────
function OverviewTab({
  verification,
  onRetry,
  onRequestInspection,
  onUploadVideo,
  onConfirmIdentity,
}: {
  verification: unknown;
  onRetry: () => void;
  onRequestInspection: () => void;
  onUploadVideo: () => void;
  onConfirmIdentity: () => void;
}) {
  const { overallStatus, currentLayer, l1Status, l2Status, l3Status, l4Status, l5Status, listing } = verification;
  const layers = [l1Status, l2Status, l3Status, l4Status, l5Status] as (VerificationLayerStatus | null)[];

  // Next-step guidance
  let nextStep: { label: string; action: () => void; actionLabel: string } | null = null;
  if (overallStatus === 'not_started') {
    nextStep = { label: 'Submit Layer 1 documents to begin.', action: onRetry, actionLabel: 'Start Verification' };
  } else if (overallStatus === 'in_progress') {
    if (currentLayer === 1 && l1Status === 'pending')
      nextStep = { label: 'Upload your ownership documents.', action: onRetry, actionLabel: 'Upload Documents' };
    else if (currentLayer === 2 && l2Status === 'pending')
      nextStep = { label: 'Complete identity verification (NIN/BVN).', action: onConfirmIdentity, actionLabel: 'Verify Identity' };
    else if (currentLayer === 3 && l3Status === 'pending')
      nextStep = { label: 'Record and upload your live video.', action: onUploadVideo, actionLabel: 'Upload Video' };
    else if (currentLayer === 4 && l4Status === 'pending')
      nextStep = { label: 'Schedule a physical inspection appointment.', action: onRequestInspection, actionLabel: 'Schedule Inspection' };
    else if (currentLayer === 5 && l5Status === 'pending')
      nextStep = { label: 'Awaiting admin final certification.', action: () => {}, actionLabel: 'Waiting for Admin' };
    else
      nextStep = null;
  } else if (overallStatus === 'rejected') {
    nextStep = { label: 'Resubmit from Layer 1 with corrected information.', action: onRetry, actionLabel: 'Resubmit' };
  } else if (overallStatus === 'certified') {
    nextStep = { label: 'Your property is fully certified and has priority placement.', action: () => {}, actionLabel: 'View Listing' };
  }

  return (
    <div className="space-y-6">
      {/* Status summary card */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold">{listing?.title ?? 'Verification'}</h3>
          {statusBadge(overallStatus)}
          <Badge variant="outline" className="capitalize">{listing?.verificationTier ?? '—'} tier</Badge>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground">Listing ID</dt><dd className="font-mono">{listing?.id}</dd></div>
          <div><dt className="text-muted-foreground">Current Layer</dt><dd>{currentLayer} / 5</dd></div>
          <div><dt className="text-muted-foreground">Submitted</dt><dd>{verification.createdAt ? new Date(verification.createdAt).toLocaleDateString() : '—'}</dd></div>
          <div><dt className="text-muted-foreground">Last Updated</dt><dd>{verification.updatedAt ? new Date(verification.updatedAt).toLocaleDateString() : '—'}</dd></div>
        </dl>
      </div>

      {/* Progress steps */}
      <div className="rounded-lg border bg-card p-5">
        <h4 className="mb-4 font-medium">Layer Progress</h4>
        <div className="flex items-start justify-between gap-2">
          {layers.map((ls, i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-xs">
              <StepIcon index={i} layerStatus={ls} />
              <span className="max-w-[70px] text-center leading-tight">{STEP_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next step guidance */}
      {nextStep && (
        <div className="rounded-lg border bg-primary/5 p-4">
          <p className="text-sm">{nextStep.label}</p>
          {nextStep.actionLabel !== 'Waiting for Admin' && nextStep.actionLabel !== 'View Listing' && (
            <Button className="mt-2" onClick={nextStep.action}>{nextStep.actionLabel}</Button>
          )}
          {nextStep.actionLabel === 'View Listing' && (
            <Button className="mt-2" asChild>
              <Link href={`/listings/${listing?.id}`}>View Listing</Link>
            </Button>
          )}
        </div>
      )}

      {/* Admin notes */}
      {verification.adminNotes && (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <strong>Admin Notes:</strong> {verification.adminNotes}
        </div>
      )}
    </div>
  );
}

// ─── Layers content ───────────────────────────────────────────────────────────
function LayersTab({ verification }: { verification: unknown }) {
  const { currentLayer, l1Status, l2Status, l3Status, l4Status, l5Status } = verification;
  const ALL = [
    { label: 'Layer 1 - Documents', status: l1Status, approvedAt: verification.l1SubmittedAt },
    { label: 'Layer 2 - Identity Match', status: l2Status, approvedAt: verification.l2VerifiedAt },
    { label: 'Layer 3 - Live Video', status: l3Status, approvedAt: null },
    { label: 'Layer 4 - Physical Inspection', status: l4Status, approvedAt: verification.l4CompletedAt },
    { label: 'Layer 5 - Certification', status: l5Status, approvedAt: verification.reviewedAt },
  ];

  return (
    <div className="space-y-3">
      {ALL.map((l, idx) => (
        <div key={idx} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="font-medium">{l.label}</p>
            <p className="text-xs text-muted-foreground">
              {l.approvedAt ? `Reviewed: ${new Date(l.approvedAt).toLocaleString()}` : 'Not yet reviewed'}
            </p>
          </div>
          {layerBadge(l.status)}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Active layer: <strong>{currentLayer}</strong></p>
    </div>
  );
}

// ─── Documents content ────────────────────────────────────────────────────────
function DocumentsTab({ verification }: { verification: unknown }) {
  const docs = verification.verificationDocuments ?? [];
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>;
  }
  return (
    <div className="space-y-3">
      {docs.map((d: unknown) => (
        <a key={d.id} href={d.url} target="_blank" rel="noopener" className="flex items-center justify-between rounded-md border p-3 hover:bg-muted">
          <div>
            <p className="font-medium">{d.documentType}</p>
            <p className="text-xs text-muted-foreground">{d.fileName ?? 'No file name'} · {(d.fileSize ?? 0 / 1024).toFixed(1)} KB</p>
          </div>
          <Badge variant="secondary">View</Badge>
        </a>
      ))}
    </div>
  );
}

// ─── Timeline content ─────────────────────────────────────────────────────────
function TimelineTab({ verification }: { verification: unknown }) {
  const events: { date: Date; label: string }[] = [];
  if (verification.frozenAt) events.push({ date: verification.frozenAt, label: `Frozen: ${verification.frozenReason}` });
  if (verification.l4CompletedAt) events.push({ date: verification.l4CompletedAt, label: 'Layer 4 inspection completed' });
  if (verification.l2VerifiedAt) events.push({ date: verification.l2VerifiedAt, label: 'Layer 2 identity verified' });
  if (verification.l1SubmittedAt) events.push({ date: verification.l1SubmittedAt, label: 'Layer 1 documents submitted' });
  if (verification.createdAt) events.push({ date: verification.createdAt, label: 'Verification record created' });
  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return (
    <div className="space-y-0">
      {events.map((e, idx) => (
        <div key={idx} className="flex gap-3 pb-3">
          <div className="mt-1.5 hidden flex-col items-center sm:flex">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {idx < events.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
          </div>
          <div>
            <p className="text-sm font-medium">{e.label}</p>
            <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleString()}</p>
          </div>
        </div>
      ))}
      {events.length === 0 && <p className="text-sm text-muted-foreground">No timeline events yet.</p>}
    </div>
  );
}

// ─── Main server component ────────────────────────────────────────────────────
export default async function VerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Fetch verification + listing + documents
  const verification = await prisma.verification.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, verificationTier: true, status: true, area: true } },
      ...(process.env.NODE_ENV !== 'production'
        ? { documents: { select: { id: true, documentType: true, url: true, uploadedAt: true } } }
        : {}),
    },
  });

  if (!verification) notFound();

  const isOwner = verification.ownerId === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    redirect('/dashboard/verification');
  }

  // ─── Frozen state ──────────────────────────────────────────────────────────
  if (VerificationService.isFrozen(verification.overallStatus)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/verification">← Back</Link>
            </Button>
            {statusBadge(verification.overallStatus)}
          </div>
          <FrozenState
            title={`${verification.listing?.title ?? 'Verification'} — Frozen`}
            description={verification.frozenReason ?? 'This verification has been temporarily frozen.'}
            ticketHref="/support"
            ticketLabel="Open a ticket"
            appealHref="/appeal"
            appealLabel="Submit an appeal"
          />
          {verification.frozenAt && (
            <p className="mt-4 text-xs text-muted-foreground">
              Frozen on {new Date(verification.frozenAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── Certified state ───────────────────────────────────────────────────────
  if (verification.overallStatus === 'certified') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/verification">← Back</Link>
            </Button>
            {statusBadge(verification.overallStatus)}
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
              🎉 Fully Certified
            </h2>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              {verification.listing?.title ?? 'This property'} has completed all 5 layers and
              received admin certification. It will display the Certified badge and receive
              priority placement in search results.
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/listings/${verification.listing?.id}`}>View Listing</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Rejected state ────────────────────────────────────────────────────────
  if (verification.overallStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/verification">← Back</Link>
            </Button>
            {statusBadge(verification.overallStatus)}
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Application Rejected</h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {verification.adminNotes ??
                'Your verification was not approved. Please review the notes and resubmit.'}
            </p>
            <form action="/api/verification/retry" method="POST">
              <input type="hidden" name="listingId" value={verification.listingId} />
              <input type="hidden" name="userId" value={user.id} />
              <Button className="mt-4" variant="destructive">Resubmit from Layer 1</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── Not-started empty state ───────────────────────────────────────────────
  if (verification.overallStatus === 'not_started') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/verification">← Back</Link>
            </Button>
            {statusBadge(verification.overallStatus)}
          </div>
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold">Verification Not Started</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t started the verification process for this listing. Begin by
              submitting your documents.
            </p>
            <form action="/api/verification/submit-l1" method="POST" className="mt-4 inline-block">
              <input type="hidden" name="listingId" value={verification.listingId} />
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit">Start Verification</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── In-progress tabbed view ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/verification">← Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">{verification.listing?.title ?? 'Verification'}</h1>
          {statusBadge(verification.overallStatus)}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              verification={verification}
              onRetry={() => {}}
              onRequestInspection={() => {}}
              onUploadVideo={() => {}}
              onConfirmIdentity={() => {}}
            />
          </TabsContent>

          <TabsContent value="layers">
            <LayersTab verification={verification} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab verification={verification} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab verification={verification} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

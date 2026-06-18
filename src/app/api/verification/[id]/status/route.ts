import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { verificationService } from '@/lib/verification';
import {
  calculateProgress,
  getCurrentLayerDetails,
  getCompletedLayers,
  getStatusMessage,
  canSubmitForReview,
} from '@/lib/verification-helpers';

/**
 * GET /api/verification/[id]/status
 * Get current verification status and requirements for next layer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const verification = await verificationService.getVerificationStatus(id);

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification record not found' },
        { status: 404 }
      );
    }

    // Check permissions: owner, agent, or admin can view
    if (
      verification.ownerId !== user.id &&
      verification.listing.agentId !== user.id &&
      user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const progress = calculateProgress(verification);
    const currentLayer = getCurrentLayerDetails(verification);
    const completedLayers = getCompletedLayers(verification);
    const statusMessage = getStatusMessage(verification);
    const canSubmit = canSubmitForReview(verification);

    // Get next layer info
    const nextLayerNumber = verification.currentLayer + 1;
    const nextLayer = nextLayerNumber <= 5 ? {
      layer: nextLayerNumber,
      name: ['', 'Document Verification', 'Identity Verification', 'Video Verification', 'Physical Inspection', 'Admin Certification'][nextLayerNumber],
    } : null;

    const response = {
      status: verification.overallStatus,
      currentLayer: verification.currentLayer,
      progress,
      completed: completedLayers,
      current: {
        layer: currentLayer.layer,
        name: currentLayer.name,
        requirements: currentLayer.requirements,
        completed: currentLayer.completed,
        status: currentLayer.status,
      },
      next: nextLayer,
      canSubmitForReview: canSubmit,
      statusMessage,
      listing: {
        id: verification.listing.id,
        title: verification.listing.title,
        verificationTier: verification.listing.verificationTier,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Verification status GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

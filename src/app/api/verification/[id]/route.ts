import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { verificationService } from '@/lib/verification';
import { prisma } from '@/lib/prisma';
import { updateVerificationSchema } from '@/lib/validators';
import { ZodError } from 'zod';

/**
 * GET /api/verification/[id]
 * Get verification details with all layer progress
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
    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            verificationTier: true,
            ownerId: true,
            agentId: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Check permissions: owner, agent, or admin can view
    if (
      verification.ownerId !== user.id &&
      verification.listing.agentId !== user.id &&
      user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: verification });
  } catch (error) {
    console.error('Verification GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/verification/[id]
 * Update verification (admin only - for rejections, approvals)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateVerificationSchema.parse(body);

    const verification = await prisma.verification.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Update verification
    const updated = await prisma.verification.update({
      where: { id },
      data: {
        ...(data.status && { overallStatus: data.status }),
        ...(data.adminNotes && { adminNotes: data.adminNotes }),
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });

    // Update listing tier if status changed to certified
    if (data.status === 'certified') {
      await verificationService.updateListingTier(verification.listingId);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Verification PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/verification/[id]
 * Cancel verification (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const verification = await prisma.verification.findUnique({
      where: { id },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Check permissions: only owner or admin can delete
    if (verification.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Don't allow deletion if certified
    if (verification.overallStatus === 'certified') {
      return NextResponse.json(
        { error: 'Cannot cancel certified verification' },
        { status: 400 }
      );
    }

    await prisma.verification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Verification cancelled' });
  } catch (error) {
    console.error('Verification DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

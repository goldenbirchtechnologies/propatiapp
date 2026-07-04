import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { engagementSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/engagements/[id]
 * Retrieve a single engagement with full detail
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(_request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const engagement = await prisma.engagement.findUnique({
      where: { id: params.id },
      include: {
        case: {
          select: {
            id: true,
            status: true,
          },
        },
        firm: {
          select: { id: true, name: true, verified: true, cacNumber: true },
        },
        documents: {
          select: {
            id: true,
            documentId: true,
            reviewStatus: true,
            redlinedUrl: true,
            approvedAt: true,
          },
        },
      },
    });

    if (!engagement) {
      return errorResponse('Engagement not found', 404);
    }

    return successResponse(engagement);
  } catch {
    return errorResponse('Failed to fetch engagement', 500);
  }
}

/**
 * PATCH /api/admin/engagements/[id]
 * Update engagement fields (status, feeModel, etc.)
 * Body: { status?, scopeOfWork?, feeModel?, estimatedDuration?, advancePaymentRequired?, advancePaymentAmount?, clientConsentText?, lawyerReviewStatus?, lawyerReviewNotes? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();

    const existing = await prisma.engagement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse('Engagement not found', 404);
    }

    // Build update data — allow explicit top-level status transitions
    // and a dedicated lawyer review path
    const updateData: Record<string, unknown> = {};

    const allowedTopLevel = [
      'scopeOfWork',
      'estimatedDuration',
      'advancePaymentRequired',
      'advancePaymentAmount',
      'clientConsentText',
    ];
    for (const key of allowedTopLevel) {
      if (key in body) updateData[key] = body[key];
    }

    if ('feeModel' in body && body.feeModel) {
      updateData.feeModel = body.feeModel;
    }

    if ('status' in body && body.status) {
      updateData.status = body.status;
    }

    if ('lawyerReviewStatus' in body && body.lawyerReviewStatus) {
      updateData.lawyerReviewStatus = body.lawyerReviewStatus;
      updateData.lawyerReviewedAt = new Date();
    }

    if ('lawyerReviewNotes' in body) {
      updateData.lawyerReviewNotes = body.lawyerReviewNotes || null;
    }

    const engagement = await prisma.engagement.update({
      where: { id: params.id },
      data: updateData,
      include: {
        case: {
          select: {
            id: true,
            status: true,
          },
        },
        firm: {
          select: { id: true, name: true },
        },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'update_engagement',
      targetType: 'engagement',
      targetId: params.id,
      details: { updatedFields: Object.keys(updateData), status: engagement.status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ engagement }, 'Engagement updated');
  } catch (error) {
    console.error('Update engagement error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return errorResponse('Failed to update engagement', 500);
  }
}

/**
 * DELETE /api/admin/engagements/[id]
 * Delete an engagement (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.engagement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse('Engagement not found', 404);
    }

    await prisma.engagement.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'delete_engagement',
      targetType: 'engagement',
      targetId: params.id,
      details: { caseId: existing.caseId },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ id: params.id }, 'Engagement deleted');
  } catch {
    return errorResponse('Failed to delete engagement', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/conflict-checks/[id]
 * Retrieve a single conflict check with full detail
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(_request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const check = await prisma.conflictCheck.findUnique({
      where: { id: params.id },
      include: {
        case: {
          select: {
            id: true,
            status: true,
          },
        },
        lawFirm: {
          select: { id: true, name: true, cacNumber: true, verified: true },
        },
        lawyerProfile: {
          select: { id: true, fullName: true, email: true, callToBarNumber: true },
        },
      },
    });

    if (!check) {
      return errorResponse('Conflict check not found', 404);
    }

    return successResponse(check);
  } catch {
    return errorResponse('Failed to fetch conflict check', 500);
  }
}

/**
 * PATCH /api/admin/conflict-checks/[id]
 * Update conflict check status or conflict rationale
 * Body: { status?, conflictRationale?, previousWork? }
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

    const existing = await prisma.conflictCheck.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse('Conflict check not found', 404);
    }

    const allowedStatuses = ['not_checked', 'clear', 'conflict', 'waived'];
    const updateData: Record<string, unknown> = {};

    if ('status' in body && body.status) {
      if (!allowedStatuses.includes(body.status)) {
        return errorResponse(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400);
      }
      updateData.status = body.status;
    }

    if ('conflictRationale' in body) {
      updateData.conflictRationale = body.conflictRationale || null;
    }

    if ('previousWork' in body) {
      updateData.previousWork = body.previousWork || null;
    }

    const check = await prisma.conflictCheck.update({
      where: { id: params.id },
      data: updateData,
      include: {
        case: {
          select: {
            id: true,
            status: true,
          },
        },
        lawFirm: {
          select: { id: true, name: true },
        },
        lawyerProfile: {
          select: { id: true, fullName: true },
        },
      },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'update_conflict_check',
      targetType: 'conflict_check',
      targetId: params.id,
      details: { updatedFields: Object.keys(updateData), status: check.status },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ check }, 'Conflict check updated');
  } catch (error) {
    console.error('Update conflict check error:', error);
    return errorResponse('Failed to update conflict check', 500);
  }
}

/**
 * DELETE /api/admin/conflict-checks/[id]
 * Delete a conflict check
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.conflictCheck.findUnique({
      where: { id: params.id },
      select: { id: true, caseId: true },
    });

    if (!existing) {
      return errorResponse('Conflict check not found', 404);
    }

    await prisma.conflictCheck.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      adminId: user.id,
      action: 'delete_conflict_check',
      targetType: 'conflict_check',
      targetId: params.id,
      details: { caseId: existing.caseId },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ id: params.id }, 'Conflict check deleted');
  } catch {
    return errorResponse('Failed to delete conflict check', 500);
  }
}

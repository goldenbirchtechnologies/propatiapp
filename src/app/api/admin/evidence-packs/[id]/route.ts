import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/evidence-packs/[id]
 * Retrieve a single evidence pack with full section detail
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(_request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const pack = await prisma.evidencePack.findUnique({
      where: { id: params.id },
      include: {
        dispute: {
          select: {
            id: true,
            type: true,
            status: true,
            description: true,
            resolution: true,
            createdAt: true,
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                propertyType: true,
                price: true,
                owner: { select: { fullName: true, email: true, phone: true } },
              },
            },
            raisedByUser: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
            lawFirmCase: {
              select: {
                id: true,
                status: true,
                fee: true,
                firm: { select: { id: true, name: true, cacNumber: true } },
              },
            },
          },
        },
        lawFirm: {
          select: { id: true, name: true, cacNumber: true, address: true, billingEmail: true },
        },
      },
    });

    if (!pack) {
      return errorResponse('Evidence pack not found', 404);
    }

    return successResponse(pack);
  } catch {
    return errorResponse('Failed to fetch evidence pack', 500);
  }
}

/**
 * PATCH /api/admin/evidence-packs/[id]
 * Update a core field (status or firmId)
 * Body: { status?: string, firmId?: string | null }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { status, firmId, metadata } = body;

    const existing = await prisma.evidencePack.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse('Evidence pack not found', 404);
    }

    const allowedStatuses = ['draft', 'final', 'sealed', 'revoked'];
    if (status && !allowedStatuses.includes(status)) {
      return errorResponse(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400);
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (firmId !== undefined) updateData.firmId = firmId;
    if (metadata !== undefined) updateData.metadata = metadata;

    const pack = await prisma.evidencePack.update({
      where: { id: params.id },
      data: updateData,
      include: {
        dispute: {
          select: {
            id: true,
            type: true,
            status: true,
            listing: { select: { title: true } },
            raisedByUser: { select: { fullName: true, email: true } },
            lawFirmCase: {
              select: {
                id: true,
                status: true,
                firm: { select: { id: true, name: true } },
              },
            },
          },
        },
        lawFirm: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(pack, 'Evidence pack updated');
  } catch {
    return errorResponse('Failed to update evidence pack', 500);
  }
}

/**
 * POST /api/admin/evidence-packs/[id]
 * Add a chain-of-custody entry to the evidence pack
 * Body: { action: string, note?: string, exhibitRef?: string, ipAddress?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { action, note, exhibitRef, ipAddress } = body as {
      action?: string;
      note?: string;
      exhibitRef?: string;
      ipAddress?: string;
    };

    if (!action || typeof action !== 'string') {
      return errorResponse('Field "action" is required', 400);
    }

    const pack = await prisma.evidencePack.findUnique({
      where: { id: params.id },
      select: { id: true, chainHash: true },
    });

    if (!pack) {
      return errorResponse('Evidence pack not found', 404);
    }

    const clientIp = (ipAddress || request.headers.get('x-forwarded-for') || 'unknown') as string;
    const createdAt = new Date();

    // Build a simple deterministic state-hash for this entry.
    // NOTE: Replace with a real HMAC/hash-chain scheme in production.
    const hashInput = `${pack.id}:${action}:${createdAt.toISOString()}:${clientIp}:${note ?? ''}:${exhibitRef ?? ''}:${pack.chainHash ?? ''}`;
    const stateHash = Buffer.from(hashInput).toString('base64').slice(0, 32);

    // Persist the custody entry
    const entry = await prisma.evidenceCustodyEntry.create({
      data: {
        packId: params.id,
        action,
        note: note ?? null,
        exhibitRef: exhibitRef ?? null,
        ipAddress: clientIp,
        stateHash,
        createdAt,
      },
    });

    // Update the pack's chainHash to the new head
    await prisma.evidencePack.update({
      where: { id: params.id },
      data: { chainHash: stateHash, updatedAt: createdAt },
    });

    return successResponse(entry, 'Chain-of-custody entry added');
  } catch {
    return errorResponse('Failed to add custody entry', 500);
  }
}

/**
 * DELETE /api/admin/evidence-packs/[id]
 * Delete an evidence pack (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const existing = await prisma.evidencePack.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse('Evidence pack not found', 404);
    }

    await prisma.evidencePack.delete({
      where: { id: params.id },
    });

    return successResponse({ id: params.id }, 'Evidence pack deleted');
  } catch {
    return errorResponse('Failed to delete evidence pack', 500);
  }
}

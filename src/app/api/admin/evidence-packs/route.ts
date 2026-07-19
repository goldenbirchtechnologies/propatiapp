import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/evidence-packs
 * List all evidence packs (paginated)
 * Query: ?page=1&limit=20&status=...&disputeId=...
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const disputeId = searchParams.get('disputeId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (disputeId) where.disputeId = disputeId;

    const skip = (page - 1) * limit;

    const [packs, total] = await Promise.all([
      prisma.evidencePack.findMany({
        where,
        include: {
          dispute: {
            select: {
              id: true,
              type: true,
              status: true,
              description: true,
              raisedByUser: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
          lawFirm: {
            select: { id: true, name: true, cacNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.evidencePack.count({ where }),
    ]);

    return paginatedResponse(packs, page, limit, total);
  } catch {
    return errorResponse('Failed to fetch evidence packs', 500);
  }
}

/**
 * POST /api/admin/evidence-packs
 * Create a new evidence pack draft for a dispute
 * Body: { disputeId, firmId?, metadata? }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { disputeId, lawFirmId, metadata } = body;

    if (!disputeId) {
      return errorResponse('disputeId is required', 400);
    }

    // Verify the dispute exists
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      select: { id: true, listingId: true, raisedBy: true },
    });

    if (!dispute) {
      return errorResponse('Dispute not found', 404);
    }

    // Gather contracts from listing agreements
    const agreements = await prisma.agreement.findMany({
      where: { listingId: dispute.listingId ?? undefined },
      select: {
        id: true,
        pdfUrl: true,
        status: true,
        createdAt: true,
        landlord: { select: { fullName: true } },
        tenant: { select: { fullName: true } },
      },
    });

    const fileUrls = agreements.map((a) => ({
      type: 'agreement',
      agreementId: a.id,
      url: a.pdfUrl,
      signedStatus: a.status,
      createdAt: a.createdAt,
      parties: { landlord: a.landlord.fullName, tenant: a.tenant.fullName },
    }));

    // Gather payment records
    const payments = dispute.listingId
      ? await prisma.transaction.findMany({
          where: { listingId: dispute.listingId },
          select: {
            id: true,
            type: true,
            amount: true,
            currency: true,
            status: true,
            paystackRef: true,
            paidAt: true,
            createdAt: true,
            payer: { select: { fullName: true, email: true } },
            payee: { select: { fullName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Gather relevant messages
    const conversations = dispute.listingId
      ? await prisma.conversation.findMany({
          where: { listingId: dispute.listingId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                senderId: true,
                content: true,
                attachmentUrl: true,
                createdAt: true,
                sender: { select: { fullName: true, email: true } },
              },
            },
          },
        })
      : [];

    const messages = (conversations || []).flatMap((c) =>
      c.messages.map((m) => ({
        messageId: m.id,
        conversationId: c.id,
        sender: m.sender,
        body: m.content,
        attachment: m.attachmentUrl,
        timestamp: m.createdAt,
      }))
    );

    // Gather audit logs related to listing / dispute
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: {
        OR: [
          { targetId: dispute.id },
          ...(dispute.listingId ? [{ targetId: dispute.listingId }] : []),
        ],
      },
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        admin: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const pack = await prisma.evidencePack.create({
      data: {
        disputeId,
        lawFirmId: lawFirmId || null,
        status: 'draft',
        fileUrls,
        payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
        messages,
        auditLogs,
        metadata: metadata || null,
      },
      include: {
        dispute: {
          select: {
            id: true,
            type: true,
            status: true,
            description: true,
            listing: { select: { title: true, address: true } },
            raisedByUser: { select: { fullName: true, email: true, phone: true } },
          },
        },
        lawFirm: {
          select: { id: true, name: true, cacNumber: true },
        },
      },
    });

    return successResponse(pack, 'Evidence pack created successfully');
  } catch (error) {
    console.error('Create evidence pack error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Invalid request body', 400);
    }
    return errorResponse('Failed to create evidence pack', 500);
  }
}

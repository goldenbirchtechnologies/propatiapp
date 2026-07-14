import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { verificationQueueFiltersSchema } from '@/lib/validators';

/**
 * GET /api/admin/verification-queue
 * List verifications pending review
 * Query: ?status=...&layer=...&page=...&limit=...
 * Returns verifications at Layer 5 (admin review stage) or filtered by layer
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const validated = verificationQueueFiltersSchema.parse(params);

    const { page, limit, status, layer } = validated;
    const skip = (page - 1) * limit;

    // Build where clause - focus on Layer 5 by default
    const where: Record<string, unknown> = {
      overallStatus: 'in_progress',
    };

    // If layer specified, filter by that layer status
    if (layer) {
      const layerField = `l${layer}Status` as keyof typeof where;
      where[layerField] = status || 'pending';
    } else {
      // Default: show only verifications at Layer 5 (admin review)
      where.currentLayer = 5;
      where.l5Status = status || 'pending';
    }

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              address: true,
              area: true,
              propertyType: true,
              listingType: true,
              status: true,
              verificationTier: true,
              images: {
                where: { isCover: true },
                take: 1,
                select: { url: true },
              },
            },
          },
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              phoneVerified: true,
              idVerified: true,
            },
          },
          documents: {
            select: {
              id: true,
              documentType: true,
              url: true,
              fileName: true,
              uploadedAt: true,
            },
          },
          l4Agent: {
            select: {
              id: true,
              fullName: true,
              agentTier: true,
            },
          },
        },
        orderBy: [
          { l5Status: 'asc' }, // pending first
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.verification.count({ where }),
    ]);

    // Format the response
    const formattedVerifications = verifications.map((v) => ({
      id: v.id,
      listingId: v.listingId,
      listing: {
        ...v.listing,
        coverImage: v.listing.images[0]?.url || null,
      },
      owner: v.owner,
      currentLayer: v.currentLayer,
      overallStatus: v.overallStatus,
      layers: {
        layer1: {
          status: v.l1Status,
          docUrl: v.l1DocUrl,
          submittedAt: v.l1SubmittedAt,
        },
        layer2: {
          status: v.l2Status,
          idType: v.l2IdType,
          verifiedAt: v.l2VerifiedAt,
        },
        layer3: {
          status: v.l3Status,
          videoUrl: v.l3VideoUrl,
        },
        layer4: {
          status: v.l4Status,
          agent: v.l4Agent,
          scheduledAt: v.l4ScheduledAt,
          completedAt: v.l4CompletedAt,
          reportUrl: v.l4ReportUrl,
        },
        layer5: {
          status: v.l5Status,
        },
      },
      documents: v.documents,
      adminNotes: v.adminNotes,
      reviewedBy: v.reviewedBy,
      reviewedAt: v.reviewedAt,
      updatedAt: v.updatedAt,
    }));

    return paginatedResponse(formattedVerifications, page, limit, total);
  } catch (error) {
    console.error('Verification queue error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

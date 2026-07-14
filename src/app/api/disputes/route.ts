import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (user.role !== 'admin') {
      where.raisedBy = user.id;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          raisedByUser: {
            select: { id: true, fullName: true, email: true, role: true },
          },
          listing: {
            select: { id: true, title: true, address: true },
          },
          admin: {
            select: { id: true, fullName: true },
          },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    return paginatedResponse(disputes, page, limit, total);
  } catch (error) {
    console.error('GET /api/disputes error:', error);
    return errorResponse('Failed to fetch disputes', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { listingId, type, description } = body;

    if (!type || !description) {
      return errorResponse('type and description are required', 400);
    }

    const dispute = await prisma.dispute.create({
      data: {
        listingId: listingId || null,
        raisedBy: user.id,
        type,
        description,
      },
      include: {
        raisedByUser: {
          select: { id: true, fullName: true, email: true },
        },
        listing: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: dispute }, { status: 201 });
  } catch (error) {
    console.error('POST /api/disputes error:', error);
    return errorResponse('Failed to create dispute', 500);
  }
}

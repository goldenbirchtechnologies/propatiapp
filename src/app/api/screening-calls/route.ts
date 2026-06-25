import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { scheduleScreeningSchema, updateScreeningSchema } from '@/lib/validators';
import { ScreeningCallStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { user } = authResult;
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      listingId: searchParams.get('listingId') || undefined,
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };

    const skip = (filters.page - 1) * filters.limit;

    const where: any = {};
    if (filters.listingId) where.listingId = filters.listingId;
    if (filters.status) where.status = filters.status as ScreeningCallStatus;

    if (user.role === 'landlord') {
      where.landlordId = user.id;
    } else if (user.role === 'tenant') {
      where.tenantId = user.id;
    }

    const [calls, total] = await Promise.all([
      prisma.screeningCall.findMany({
        where,
        include: {
          listing: { select: { id: true, title: true, address: true, price: true } },
          landlord: { select: { id: true, fullName: true, email: true, phone: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.screeningCall.count({ where }),
    ]);

    return paginatedResponse(calls, filters.page, filters.limit, total);
  } catch (error) {
    console.error('List screening-calls error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validated = scheduleScreeningSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: { id: true, landlordId: true, status: true },
    });

    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing not found or inactive' }, { status: 404 });
    }

    if (listing.landlordId !== authResult.user.id && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scheduledAt = new Date(validated.scheduledAt);
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return NextResponse.json({ error: 'scheduledAt must be a future date' }, { status: 400 });
    }

    const call = await prisma.screeningCall.create({
      data: {
        listingId: validated.listingId,
        landlordId: listing.landlordId,
        tenantId: validated.tenantId,
        scheduledAt,
        status: 'scheduled',
      },
      include: {
        listing: { select: { id: true, title: true } },
        tenant: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    console.error('Create screening-call error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request', details: (error as any).issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

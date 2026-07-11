import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  listingId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const createBody = z.object({
  listingId: z.string(),
  tenantId: z.string(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, status, listingId, from, to } = listQuery.parse(params);

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = {};

    if (user.role === 'landlord') {
      where.landlordId = user.id;
    } else if (user.role === 'tenant') {
      where.tenantId = user.id;
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (status) where.status = status;
    if (listingId) where.listingId = listingId;
    if (from || to) {
      where.scheduledAt = {} as Record<string, string>;
      if (from) (where.scheduledAt as Record<string, string>).gte = from;
      if (to) (where.scheduledAt as Record<string, string>).lte = to;
    }

    const [calls, total] = await Promise.all([
      prisma.screeningCall.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, address: true } },
          landlord: { select: { id: true, fullName: true } },
          tenant: { select: { id: true, fullName: true } },
        },
      }),
      prisma.screeningCall.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: calls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('screening-calls GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant', 'landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { listingId, tenantId, scheduledAt, notes } = createBody.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, ownerId: true, status: true },
    });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const resolvedTenantId = user.role === 'tenant' ? user.id : tenantId;
    const resolvedLandlordId = user.role === 'landlord' ? user.id : listing.ownerId;
    const targetTenant = await prisma.user.findUnique({ where: { id: resolvedTenantId }, select: { id: true, role: true } });
    if (!targetTenant || targetTenant.role !== 'tenant') {
      return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
    }

    const call = await prisma.screeningCall.create({
      data: {
        listingId,
        landlordId: resolvedLandlordId,
        tenantId: resolvedTenantId,
        scheduledAt: new Date(scheduledAt),
        notes,
        status: 'scheduled',
      },
      include: {
        listing: { select: { id: true, title: true } },
        landlord: { select: { id: true, fullName: true } },
        tenant: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ success: true, data: call }, { status: 201 });
  } catch (error) {
    console.error('screening-calls POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

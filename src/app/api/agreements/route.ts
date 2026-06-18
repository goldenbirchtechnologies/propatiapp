import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { paginationSchema, createAgreementSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { AgreementStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, ...filters } = paginationSchema.extend({
      status: z.enum(Object.values(AgreementStatus) as [string, ...string[]]).optional(),
      type: z.enum(['rental', 'sale', 'short_let', 'share']).optional(),
      listingId: z.string().uuid().optional(),
    }).parse(params);

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause based on user role
    const where: Record<string, unknown> = {};

    if (user.role === 'LANDLORD') {
      where.landlordId = user.id;
    } else if (user.role === 'TENANT') {
      where.tenantId = user.id;
    } else if (user.role === 'AGENT') {
      where.agentId = user.id;
    } else if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.listingId) where.listingId = filters.listingId;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [agreements, total] = await Promise.all([
      prisma.agreement.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, area: true, state: true } },
          landlord: { select: { id: true, fullName: true, email: true, phone: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          agent: { select: { id: true, fullName: true, email: true, agentTier: true } },
          signatures: { select: { id: true, role: true, signedAt: true } },
        },
      }),
      prisma.agreement.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: agreements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Agreements GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['LANDLORD', 'AGENT', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createAgreementSchema.parse(body);

    // Verify listing exists and user has permission
    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: { id: true, ownerId: true, agentId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Landlord must own the listing, agent must be assigned, admin can do anything
    if (
      user.role === 'LANDLORD' && listing.ownerId !== user.id
    ) {
      return NextResponse.json({ error: 'FORBIDDEN: Not the listing owner' }, { status: 403 });
    }

    if (
      user.role === 'AGENT' && listing.agentId !== user.id
    ) {
      return NextResponse.json({ error: 'FORBIDDEN: Not the assigned agent' }, { status: 403 });
    }

    // Check tenant exists
    const tenant = await prisma.user.findUnique({
      where: { id: validated.tenantId },
      select: { id: true, role: true },
    });

    if (!tenant || tenant.role !== 'TENANT') {
      return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
    }

    // Validate agent if provided
    if (validated.agentId) {
      const agent = await prisma.user.findUnique({
        where: { id: validated.agentId },
        select: { id: true, role: true, agentApproved: true },
      });
      if (!agent || agent.role !== 'AGENT' || !agent.agentApproved) {
        return NextResponse.json({ error: 'Invalid or unapproved agent' }, { status: 400 });
      }
    }

    const agreement = await prisma.agreement.create({
      data: {
        ...validated,
        landlordId: user.role === 'LANDLORD' ? user.id : listing.ownerId,
        agentId: validated.agentId ?? (user.role === 'AGENT' ? user.id : listing.agentId) ?? null,
        status: 'draft',
      },
      include: {
        listing: { select: { id: true, title: true, area: true, state: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Create notification for tenant
    await prisma.notification.create({
      data: {
        userId: validated.tenantId,
        type: 'agreement',
        title: 'New Agreement Draft',
        body: `A new ${validated.type} agreement for ${agreement.listing.title} has been created and is ready for your review.`,
        data: { agreementId: agreement.id },
      },
    });

    return NextResponse.json({ success: true, data: agreement }, { status: 201 });
  } catch (error) {
    console.error('Agreements POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
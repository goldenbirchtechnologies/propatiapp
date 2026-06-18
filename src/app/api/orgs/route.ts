import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { paginationSchema, createOrganisationSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { OrgPlanTier, OrgMemberRole } from '@prisma/client';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, ...filters } = paginationSchema.extend({
      status: z.enum(['active', 'inactive']).optional(),
    }).parse(params);

    const skip = (page - 1) * limit;
    const take = limit;

    // Get user's organizations via membership
    const memberships = await prisma.orgMember.findMany({
      where: { userId: user.id, status: 'active' },
      select: { orgId: true },
    });

    const orgIds = memberships.map((m) => m.orgId);

    if (orgIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const where: Record<string, unknown> = { id: { in: orgIds } };

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [organisations, total] = await Promise.all([
      prisma.organisation.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          owner: { select: { id: true, fullName: true, email: true } },
          members: {
            where: { status: 'active' },
            include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } },
          },
          _count: { select: { listings: true, maintenanceTickets: true } },
        },
      }),
      prisma.organisation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: organisations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Orgs GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createOrganisationSchema.parse(body);

    const organisation = await prisma.organisation.create({
      data: {
        ...validated,
        ownerId: user.id,
        // Set limits based on plan
        maxUnits: validated.planTier === 'starter' ? 20 : validated.planTier === 'growth' ? 100 : -1,
        maxSeats: validated.planTier === 'starter' ? 1 : validated.planTier === 'growth' ? 5 : -1,
      },
    });

    // Add owner as member
    await prisma.orgMember.create({
      data: {
        orgId: organisation.id,
        userId: user.id,
        role: 'manager',
        status: 'active',
        joinedAt: new Date(),
      },
    });

    // Create Paystack customer for billing
    try {
      await paystack.createCustomer({
        email: user.email,
        first_name: user.fullName.split(' ')[0],
        last_name: user.fullName.split(' ').slice(1).join(' ') || '',
        phone: user.phone ?? undefined,
        metadata: { orgId: organisation.id, userId: user.id },
      });
    } catch (e) {
      console.warn('Failed to create Paystack customer:', e);
    }

    return NextResponse.json({ success: true, data: organisation }, { status: 201 });
  } catch (error) {
    console.error('Orgs POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
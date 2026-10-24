import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBody = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['plumbing', 'electrical', 'structural', 'security', 'cleaning', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  listingId: z.string().optional().nullable(),
  photoUrls: z.array(z.string().url()).max(5).optional().default([]),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const where: Record<string, unknown> = {};
    if (user.role === 'tenant') {
      where.tenantId = user.id;
    } else if (user.role === 'landlord' || user.role === 'estate_manager' || user.role === 'agent') {
      // landlords/agents see tickets for their listings; for now scope to raisedBy
      // fallback to all where they are assigned or org-linked — keep simple: raisedBy or listing owner
      where.OR = [{ raisedBy: user.id }, { tenantId: user.id }, { assignedTo: user.id }];
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        listing: { select: { id: true, title: true, address: true, area: true } },
        assignedToUser: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('[GET /api/maintenance] failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = createBody.parse(body);

    let listingId: string | null = parsed.listingId ?? null;
    let orgId: string | null = null;

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, orgListings: { select: { orgId: true } } },
      });
      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      orgId = listing.orgListings[0]?.orgId ?? null;
    } else {
      // Try to infer listing from tenant's active agreement
      const agreement = await prisma.agreement.findFirst({
        where: { tenantId: user.id, status: 'fully_signed' },
        select: { listingId: true },
        orderBy: { updatedAt: 'desc' },
      });
      if (agreement) {
        listingId = agreement.listingId;
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { orgListings: { select: { orgId: true } } },
        });
        orgId = listing?.orgListings[0]?.orgId ?? null;
      }
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        category: parsed.category as any,
        priority: parsed.priority as any,
        status: 'open',
        raisedBy: user.id,
        tenantId: user.id,
        listingId: listingId ?? undefined,
        orgId: orgId ?? undefined,
        photoUrls: parsed.photoUrls ?? [],
      },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        assignedToUser: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.flatten() }, { status: 400 });
    }
    console.error('[POST /api/maintenance] failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

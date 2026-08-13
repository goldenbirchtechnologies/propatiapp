import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addListingSchema = z.object({
  listingId: z.string().min(1, 'listingId is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true, maxUnits: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;
    const take = limit;

    const [orgListings, total] = await Promise.all([
      prisma.orgListing.findMany({
        where: { orgId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listing: {
            include: {
              images: { where: { isCover: true }, take: 1 },
              verification: { select: { overallStatus: true, currentLayer: true } },
              owner: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
      }),
      prisma.orgListing.count({ where: { orgId: id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: orgListings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      limits: { maxUnits: org.maxUnits, currentUnits: total },
    });
  } catch (error) {
    console.error('Org Listings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true, maxUnits: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['owner', 'manager', 'maintenance'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    // Check unit limit
    const currentUnits = await prisma.orgListing.count({ where: { orgId: id } });
    if (org.maxUnits > 0 && currentUnits >= org.maxUnits) {
      return NextResponse.json({ error: 'Unit limit reached. Upgrade plan to add more listings.' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Org Listings POST body:', JSON.stringify(body));
    const validated = addListingSchema.safeParse(body);
    if (!validated.success) {
      console.error('Org Listings POST validation error:', validated.error);
      return NextResponse.json({ error: 'Invalid request body', details: validated.error }, { status: 400 });
    }

    // Check if listing exists and is not already in this org
    const listing = await prisma.listing.findUnique({
      where: { id: validated.data.listingId },
      select: { id: true, ownerId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if listing is already in this org
    const existing = await prisma.orgListing.findUnique({
      where: { orgId_listingId: { orgId: id, listingId: validated.data.listingId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Listing already added to organization' },
        { status: 409 }
      );
    }

    // Verify user has access to this listing (owner, agent, or org member with rights)
    const hasAccess = listing.ownerId === user.id; // For now, only owner can add

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have permission to add this listing' }, { status: 403 });
    }

    const orgListing = await prisma.orgListing.create({
      data: {
        orgId: id,
        listingId: validated.data.listingId,
      },
      include: {
        listing: {
          include: {
            images: { where: { isCover: true }, take: 1 },
            owner: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: orgListing }, { status: 201 });
  } catch (error) {
    console.error('Org Listings POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can remove listings
    if (org.ownerId !== user.id && membership.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Only owner or manager can remove listings' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId query parameter required' }, { status: 400 });
    }

    const orgListing = await prisma.orgListing.findUnique({
      where: { orgId_listingId: { orgId: id, listingId } },
    });

    if (!orgListing) {
      return NextResponse.json({ error: 'Listing not found in organization' }, { status: 404 });
    }

    await prisma.orgListing.delete({
      where: { id: orgListing.id },
    });

    return NextResponse.json({ success: true, message: 'Listing removed from organization' });
  } catch (error) {
    console.error('Org Listings DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
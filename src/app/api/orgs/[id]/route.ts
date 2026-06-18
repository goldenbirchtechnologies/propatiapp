import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { OrgPlanTier } from '@prisma/client';

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
      select: { id: true, role: true, status: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'FORBIDDEN: Not a member of this organization' }, { status: 403 });
    }

    if (membership.status !== 'active') {
      return NextResponse.json({ error: 'Membership not active' }, { status: 403 });
    }

    const organisation = await prisma.organisation.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        members: {
          where: { status: 'active' },
          include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } },
        },
        listings: {
          include: {
            listing: {
              include: {
                images: { where: { isCover: true }, take: 1 },
                verification: { select: { overallStatus: true, currentLayer: true } },
              },
            },
          },
        },
        subscription: true,
        _count: { select: { listings: true, maintenanceTickets: true, members: true } },
      },
    });

    if (!organisation) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...organisation, userRole: membership.role },
    });
  } catch (error) {
    console.error('Org GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership and role (only managers/owners can update)
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { id: true, role: true, status: true },
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

    // Only owner or manager can update
    if (org.ownerId !== user.id && membership.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const body = await request.json();
    const updateSchema = z.object({
      name: z.string().min(2).max(100).optional(),
      billingEmail: z.string().email().optional(),
      address: z.string().optional(),
      cacNumber: z.string().optional(),
      planTier: z.enum(['starter', 'growth', 'enterprise']).optional(),
    });

    const validated = updateSchema.parse(body);

    // Calculate new limits if plan changed
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.planTier) {
      updateData.maxUnits = validated.planTier === 'starter' ? 20 : validated.planTier === 'growth' ? 100 : -1;
      updateData.maxSeats = validated.planTier === 'starter' ? 1 : validated.planTier === 'growth' ? 5 : -1;
    }

    const updated = await prisma.organisation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Org PATCH error:', error);
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
    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner can delete
    if (org.ownerId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN: Only owner can delete organization' }, { status: 403 });
    }

    await prisma.organisation.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    console.error('Org DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
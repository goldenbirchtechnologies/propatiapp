import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { updateTurnoverTaskSchema } from '@/lib/validators.management';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const task = await prisma.turnoverTask.findUnique({
      where: { id: params.id },
      include: {
        booking: { select: { id: true, checkIn: true, checkOut: true, guestId: true } },
        listing: { select: { id: true, title: true, address: true, ownerId: true } },
        assignedToUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Turnover task not found' }, { status: 404 });
    }

    // Authorization
    if (user.role === 'tenant') {
      if (task.booking?.guestId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    } else if (user.role === 'landlord') {
      if (task.listing?.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    } else if (user.role === 'estate_manager') {
      const listing = await prisma.listing.findUnique({
        where: { id: task.listingId ?? undefined },
        select: { units: { select: { organization: { select: { ownerId: true } } } } },
      });
      const ownsOrg = listing?.units.some((u) => u.organization.ownerId === user.id);
      if (task.listing?.ownerId !== user.id && !ownsOrg) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const existing = await prisma.turnoverTask.findUnique({
      where: { id: params.id },
      select: { id: true, listingId: true, booking: { select: { guestId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Turnover task not found' }, { status: 404 });
    }

    // Authorization
    let isAuthorized = false;
    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (user.role === 'estate_manager') {
      const listing = await prisma.listing.findUnique({
        where: { id: existing.listingId ?? undefined },
        select: { ownerId: true, units: { select: { organization: { select: { ownerId: true } } } } },
      });
      isAuthorized =
        (listing?.ownerId === user.id ||
          listing?.units.some((u) => u.organization.ownerId === user.id)) ??
        false;
    } else if (user.role === 'landlord') {
      const listing = await prisma.listing.findUnique({
        where: { id: existing.listingId ?? undefined },
        select: { ownerId: true },
      });
      isAuthorized = listing?.ownerId === user.id;
    } else if (user.role === 'tenant') {
      isAuthorized = existing.booking?.guestId === user.id;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateTurnoverTaskSchema.parse(body);

    const data: Prisma.TurnoverTaskUpdateInput = {};

    if (validated.status) data.status = validated.status;
    if (validated.priority) data.priority = validated.priority;
    if (validated.assignedToUserId !== undefined) {
      if (validated.assignedToUserId === null) {
        data.assignedToUser = { disconnect: true };
      } else {
        data.assignedToUser = { connect: { id: validated.assignedToUserId } };
      }
    }
    if (validated.scheduledStart) data.scheduledStart = new Date(validated.scheduledStart);
    if (validated.scheduledEnd) data.scheduledEnd = new Date(validated.scheduledEnd);
    if (validated.actualStart) data.actualStart = new Date(validated.actualStart);
    if (validated.actualEnd) data.actualEnd = new Date(validated.actualEnd);
    if (validated.notes !== undefined) data.notes = validated.notes;
    if (validated.checklist !== undefined) data.checklist = validated.checklist;
    if (validated.photos !== undefined) data.photos = validated.photos;
    if (validated.propertyId !== undefined) data.propertyId = validated.propertyId;
    if (validated.listingId !== undefined) {
      data.listing = validated.listingId
        ? { connect: { id: validated.listingId } }
        : { disconnect: true };
    }

    const task = await prisma.turnoverTask.update({
      where: { id: params.id },
      data,
      include: {
        booking: { select: { id: true, checkIn: true, checkOut: true } },
        listing: { select: { id: true, title: true } },
        assignedToUser: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const existing = await prisma.turnoverTask.findUnique({
      where: { id: params.id },
      select: { id: true, listingId: true, booking: { select: { guestId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Turnover task not found' }, { status: 404 });
    }

    let isAuthorized = false;
    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (user.role === 'estate_manager') {
      const listing = await prisma.listing.findUnique({
        where: { id: existing.listingId ?? undefined },
        select: { ownerId: true, units: { select: { organization: { select: { ownerId: true } } } } },
      });
      isAuthorized =
        (listing?.ownerId === user.id ||
          listing?.units.some((u) => u.organization.ownerId === user.id)) ??
        false;
    } else if (user.role === 'landlord') {
      const listing = await prisma.listing.findUnique({
        where: { id: existing.listingId ?? undefined },
        select: { ownerId: true },
      });
      isAuthorized = listing?.ownerId === user.id;
    } else if (user.role === 'tenant') {
      isAuthorized = existing.booking?.guestId === user.id;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.turnoverTask.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

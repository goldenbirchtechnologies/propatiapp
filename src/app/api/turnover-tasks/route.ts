import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { createTurnoverTaskSchema, updateTurnoverTaskSchema } from '@/lib/validators.management';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const searchParams = request.nextUrl.searchParams;
    const where: Prisma.TurnoverTaskWhereInput = {};

    const bookingId = searchParams.get('bookingId');
    const listingId = searchParams.get('listingId');
    const propertyId = searchParams.get('propertyId');
    const assignedToUserId = searchParams.get('assignedToUserId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    if (bookingId) where.bookingId = bookingId;
    if (listingId) where.listingId = listingId;
    if (propertyId) where.propertyId = propertyId;
    if (assignedToUserId) where.assignedToUserId = assignedToUserId;
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;

    if (user.role === 'estate_manager') {
      where.OR = [
        { listing: { units: { some: { organization: { ownerId: user.id } } } } },
        { listing: { ownerId: user.id } },
      ];
    } else if (user.role === 'landlord') {
      where.OR = [
        { listing: { ownerId: user.id } },
      ];
    } else if (user.role === 'tenant') {
      where.booking = { guestId: user.id };
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const tasks = await prisma.turnoverTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: { select: { id: true, guestId: true, checkIn: true, checkOut: true } },
        listing: { select: { id: true, title: true, address: true, propertyType: true } },
        assignedToUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const body = await request.json();
    const validated = createTurnoverTaskSchema.parse(body);

    if (validated.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: validated.bookingId },
        select: { id: true },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
    }

    if (validated.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: validated.listingId },
        select: { id: true },
      });

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
    }

    if (validated.assignedToUserId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validated.assignedToUserId },
        select: { id: true },
      });

      if (!assignee) {
        return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
      }
    }

    if (user.role !== 'admin' && user.role !== 'estate_manager') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const task = await prisma.turnoverTask.create({
      data: {
        bookingId: validated.bookingId,
        propertyId: validated.propertyId,
        listingId: validated.listingId,
        assignedToUserId: validated.assignedToUserId,
        priority: validated.priority,
        scheduledStart: validated.scheduledStart ? new Date(validated.scheduledStart) : undefined,
        scheduledEnd: validated.scheduledEnd ? new Date(validated.scheduledEnd) : undefined,
        notes: validated.notes,
        checklist: validated.checklist,
        photos: validated.photos,
      },
      include: {
        booking: { select: { id: true, checkIn: true, checkOut: true } },
        listing: { select: { id: true, title: true } },
        assignedToUser: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

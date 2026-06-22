import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { createTurnoverTaskSchema, updateTurnoverTaskSchema } from '@/lib/validators.management';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');

    const where: Record<string, unknown> = {};
    if (bookingId) where.bookingId = bookingId;

    if (user.role === 'estate_manager') {
      where.booking = { listing: { units: { some: { organization: { ownerId: user.id } } } } };
    } else if (user.role === 'tenant') {
      where.booking = { guestId: user.id };
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const tasks = await prisma.turnoverTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { booking: { select: { id: true, guestId: true, checkIn: true, checkOut: true } } },
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

    const task = await prisma.turnoverTask.create({
      data: {
        bookingId: validated.bookingId,
        type: validated.type,
        assignedTo: validated.assignedTo,
        notes: validated.notes,
      },
      include: { booking: { select: { id: true, checkIn: true, checkOut: true } } },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { updateBookingSchema } from '@/lib/validators.short-let';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id },
      include: {
        listing: { select: { id: true, title: true, address: true, price: true, ownerId: true, images: { where: { isCover: true }, take: 1, select: { url: true } } } },
        guest: { select: { id: true, fullName: true, email: true, phone: true } },
        transaction: true,
      },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const isOwner = booking.listing.ownerId === user.id;
    const isGuest = booking.guestId === user.id;
    if (!isOwner && !isGuest && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to fetch booking', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = updateBookingSchema.parse(body);

    const existing = await prisma.booking.findUnique({
      where: { id: id },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const isOwner = existing.listing.ownerId === user.id;
    const isGuest = existing.guestId === user.id;
    if (!isOwner && !isGuest && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const booking = await prisma.booking.update({
      where: { id: id },
      data: {
        status: validated.status,
        paymentStatus: validated.paymentStatus,
        specialRequests: validated.specialRequests,
        checkedInAt: validated.checkedInAt ? new Date(validated.checkedInAt) : undefined,
        checkedOutAt: validated.checkedOutAt ? new Date(validated.checkedOutAt) : undefined,
        cancelledAt: validated.status === 'cancelled' ? new Date() : undefined,
      },
      include: {
        listing: { select: { title: true, address: true } },
        guest: { select: { fullName: true, email: true } },
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to update booking', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const isOwner = booking.listing.ownerId === user.id;
    const isGuest = booking.guestId === user.id;
    if (!isOwner && !isGuest && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.booking.update({
      where: { id: id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to cancel booking', 500);
  }
}

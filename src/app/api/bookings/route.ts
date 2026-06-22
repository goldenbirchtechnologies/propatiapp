import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { createBookingSchema, updateBookingSchema } from '@/lib/validators.short-let';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = Object.fromEntries(searchParams.entries());
    const skip = (Number(page) || 1 - 1) * (Number(limit) || 20);
    const take = Number(limit) || 20;

    const where: Record<string, unknown> = {};
    if (user.role === 'tenant') {
      where.guestId = user.id;
    } else if (user.role === 'landlord') {
      where.listing = { ownerId: user.id };
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const status = searchParams.get('status');
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, address: true, price: true, images: { where: { isCover: true }, take: 1, select: { url: true } } } },
          guest: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: { page: Number(page) || 1, limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    if (user.role !== 'tenant' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only tenants can create bookings' }, { status: 403 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: { id: true, ownerId: true, price: true, listingType: true, status: true },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'active') return NextResponse.json({ error: 'Listing is not active' }, { status: 400 });

    const checkIn = new Date(validated.checkIn);
    const checkOut = new Date(validated.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return NextResponse.json({ error: 'Invalid stay duration' }, { status: 400 });

    // Check overlap with existing bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        listingId: validated.listingId,
        status: { not: 'cancelled' },
        OR: [
          { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json({ error: 'Selected dates overlap with an existing booking' }, { status: 409 });
    }

    const basePrice = Number(listing.price);
    const totalPrice = basePrice * nights;

    const booking = await prisma.booking.create({
      data: {
        listingId: validated.listingId,
        guestId: user.id,
        checkIn: validated.checkIn,
        checkOut: validated.checkOut,
        nights,
        basePrice,
        totalPrice,
        guestName: validated.guestName,
        guestPhone: validated.guestPhone,
        guestEmail: validated.guestEmail,
        specialRequests: validated.specialRequests,
      },
      include: {
        listing: { select: { title: true, address: true, images: { where: { isCover: true }, take: 1, select: { url: true } } } },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

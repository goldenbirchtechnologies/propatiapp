import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { createCalendarSlotSchema, bulkCalendarSlotsSchema } from '@/lib/validators.short-let';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, ownerId: true },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const where: Record<string, unknown> = { listingId: params.id };
    if (start && end) {
      where.date = { gte: start, lte: end };
    }

    const slots = await prisma.calendarSlot.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const isBulk = body.startDate && body.endDate;

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, ownerId: true, listingType: true },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (isBulk) {
      const validated = bulkCalendarSlotsSchema.parse(body);
      const start = new Date(validated.startDate);
      const end = new Date(validated.endDate);
      const days: string[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d).toISOString().split('T')[0]);
      }

      const results = await prisma.$transaction(
        days.map((date) =>
          prisma.calendarSlot.upsert({
            where: { listingId_date: { listingId: params.id, date } },
            update: { status: validated.status, price: validated.price ?? undefined, reason: validated.reason },
            create: { listingId: params.id, date, status: validated.status, price: validated.price ?? undefined, reason: validated.reason },
          })
        )
      );

      return NextResponse.json({ slots: results }, { status: 201 });
    }

    const validated = createCalendarSlotSchema.parse(body);
    const slot = await prisma.calendarSlot.create({
      data: {
        listingId: params.id,
        date: validated.date,
        status: validated.status,
        price: validated.price,
        reason: validated.reason,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

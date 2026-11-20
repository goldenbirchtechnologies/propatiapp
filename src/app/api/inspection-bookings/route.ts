import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ listingId: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), timeSlot: z.enum(['morning', 'afternoon', 'evening']), inspectionType: z.enum(['in_person', 'virtual']).default('in_person'), notes: z.string().max(1000).optional() });

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  try {
    const input = schema.parse(await request.json());
    if (input.date < new Date().toISOString().slice(0, 10)) return NextResponse.json({ error: 'Choose a future date' }, { status: 400 });
    const listing = await prisma.listing.findUnique({ where: { id: input.listingId }, select: { id: true, title: true, ownerId: true, agentId: true, listingType: true, status: true } });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'active' || !['rent', 'sale'].includes(listing.listingType)) return NextResponse.json({ error: 'Inspections are not available for this listing' }, { status: 400 });
    const ownerId = listing.agentId || listing.ownerId;
    const booking = await prisma.inspectionBooking.create({ data: { listingId: listing.id, visitorId: user.id, ownerId, date: input.date, timeSlot: input.timeSlot, inspectionType: input.inspectionType, notes: input.notes || null } });
    await prisma.notification.create({ data: { userId: ownerId, type: 'system', title: 'New inspection request', body: `${user.fullName} requested an inspection for ${listing.title}`, data: { listingId: listing.id, inspectionBookingId: booking.id } } });
    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid inspection details' }, { status: 400 });
    if ((error as { code?: string })?.code === 'P2002') return NextResponse.json({ error: 'That inspection slot is no longer available' }, { status: 409 });
    console.error('inspection booking error', error);
    return NextResponse.json({ error: 'Could not schedule inspection' }, { status: 500 });
  }
}

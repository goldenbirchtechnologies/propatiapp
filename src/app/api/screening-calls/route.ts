import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createSchema = z.object({
  listingId: z.string(),
  tenantId: z.string(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { page, limit } = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const skip = (page - 1) * limit;

  const [asTenant, asLandlord] = await Promise.all([
    prisma.screeningCall.findMany({
      where: { tenantId: user.id },
      orderBy: { scheduledAt: 'desc' },
      skip,
      take: limit,
      include: {
        listing: {
          select: { id: true, title: true, area: true, state: true, price: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
        },
      },
    }),
    prisma.screeningCall.findMany({
      where: { landlordId: user.id },
      orderBy: { scheduledAt: 'desc' },
      skip,
      take: limit,
      include: {
        listing: {
          select: { id: true, title: true, area: true, state: true, price: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
        },
      },
    }),
  ]);

  const combined = [...asTenant, ...asLandlord].sort((a, b) => (a.scheduledAt > b.scheduledAt ? -1 : 1));
  return NextResponse.json({ success: true, data: combined });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { listingId, tenantId, scheduledAt, notes } = parsed.data;
  const [listing, tenant] = await Promise.all([
    prisma.listing.findUnique({ where: { id: listingId } }),
    prisma.user.findUnique({ where: { id: tenantId } }),
  ]);

  if (!listing || !tenant) {
    return NextResponse.json({ error: 'Listing or tenant not found' }, { status: 404 });
  }

  const call = await prisma.screeningCall.create({
    data: {
      listingId,
      landlordId: user.id,
      tenantId,
      scheduledAt: new Date(scheduledAt),
      notes: notes || null,
    },
    include: {
      listing: {
        select: { id: true, title: true, area: true, state: true, price: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, data: call }, { status: 201 });
}

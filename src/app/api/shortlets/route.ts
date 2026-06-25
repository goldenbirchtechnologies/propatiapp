import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');

    const where = {
      status: 'active',
      allowShortlet: true,
    } as any;

    const listings = await prisma.listing.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        images: { where: { isCover: true }, take: 1 },
      },
    });

    const hasMore = listings.length > limit;
    const data = hasMore ? listings.slice(0, -1) : listings;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({ listings: data, nextCursor });
  } catch (error) {
    console.error('GET /api/shortlets error', error);
    return NextResponse.json({ listings: [], nextCursor: null }, { status: 500 });
  }
}

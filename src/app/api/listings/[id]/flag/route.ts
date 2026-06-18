import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

const flagSchema = z.object({
  reason: z.string().min(1).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id: listingId } = params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const body = await request.json();
    const { reason } = flagSchema.parse(body);

    const existingFlag = await prisma.listingFlag.findFirst({
      where: { listingId, flaggedBy: user.id },
      select: { id: true },
    });

    if (!existingFlag) {
      await prisma.listingFlag.create({
        data: {
          listingId,
          flaggedBy: user.id,
          type: 'other',
          description: reason,
        },
      });
    }

    const flagCount = await prisma.listingFlag.count({
      where: { listingId },
    });

    if (flagCount >= 10) {
      await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'suspended' },
      });
    }

    return NextResponse.json({ success: true, flagged: true });
  } catch (error: any) {
    console.error('POST /api/listings/[id]/flag error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

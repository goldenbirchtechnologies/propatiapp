import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id: listingId } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { userId_listingId: { userId: user.id, listingId } },
      });
      return NextResponse.json({ success: true, saved: false });
    }

    await prisma.savedListing.create({
      data: { userId: user.id, listingId },
    });

    return NextResponse.json({ success: true, saved: true });
  } catch (error) {
    console.error('POST /api/listings/[id]/save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id: listingId } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
    });

    if (!existing) {
      return NextResponse.json({ success: true, saved: false }, { status: 200 });
    }

    await prisma.savedListing.delete({
      where: { userId_listingId: { userId: user.id, listingId } },
    });

    return NextResponse.json({ success: true, saved: false }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/listings/[id]/save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

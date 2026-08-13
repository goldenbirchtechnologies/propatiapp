import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

/**
 * GET /api/listings/[id]/images
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const listing = await prisma.listing.findFirst({
      where: { id: id, ownerId: user.id },
      select: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const sorted = [...listing.images].sort((a, b) => {
      if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });

    return NextResponse.json({ images: sorted });
  } catch (error) {
    console.error('Get listing images error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

/**
 * POST /api/listings/[id]/images
 * Body: multipart/form-data with 'file' and optional 'setCover'
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const listing = await prisma.listing.findFirst({
      where: { id: id, ownerId: user.id },
      select: { id: true },
    });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const setCover = formData.get('setCover') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const result = await uploadToCloudinary(file, `propati/listings/${listing.id}`, 'image');

    const image = await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: result.url,
        publicId: result.publicId,
        isCover: setCover,
        sortOrder: 0,
      },
      select: { id: true, url: true, isCover: true, sortOrder: true },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('Upload listing image error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/[id]/images
 * Body: JSON { imageId }
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json().catch(() => ({ imageId: undefined }));
    const { imageId } = body as { imageId?: string };

    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }

    const image = await prisma.listingImage.findFirst({
      where: { id: imageId, listing: { ownerId: user.id, id: id } },
      select: { id: true, publicId: true, isCover: true },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    await prisma.listingImage.delete({ where: { id: image.id } });

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete listing image error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

/**
 * PATCH /api/listings/[id]/images
 * Body: JSON { imageId, setCover?: boolean }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json().catch(() => ({}));
    const { imageId, setCover } = body as { imageId?: string; setCover?: boolean };

    if (!imageId || setCover === undefined) {
      return NextResponse.json({ error: 'imageId and setCover are required' }, { status: 400 });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: id, ownerId: user.id },
      select: { id: true },
    });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const target = await prisma.listingImage.findFirst({
      where: { id: imageId, listingId: listing.id },
      select: { id: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction([
      prisma.listingImage.updateMany({ where: { listingId: listing.id }, data: { isCover: false } }),
      prisma.listingImage.update({ where: { id: target.id }, data: { isCover: !!setCover } }),
    ]);

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Update listing image error:', error);
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}

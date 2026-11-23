import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const { id, spaceId } = await params;
  try {
    const space = await prisma.space.findFirst({ where: { id: spaceId, propertyId: id, ...(auth.user.role === 'admin' ? {} : { property: { ownerId: auth.user.id } }) }, select: { id: true } });
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'File is required' }, { status: 400 });
    const setCover = formData.get('setCover') === 'true';
    const result = await uploadToCloudinary(file, `propati/spaces/${spaceId}`, 'image');
    const photo = await prisma.$transaction(async (tx) => {
      if (setCover) await tx.spacePhoto.updateMany({ where: { spaceId }, data: { isCover: false } });
      return tx.spacePhoto.create({ data: { spaceId, url: result.url, publicId: result.publicId, isCover: setCover, sortOrder: 0 } });
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Upload space photo error:', error);
    return NextResponse.json({ error: 'Failed to upload space photo' }, { status: 500 });
  }
}

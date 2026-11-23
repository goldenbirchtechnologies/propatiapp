import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  try {
    const property = await prisma.property.findFirst({ where: { id, ...(auth.user.role === 'admin' ? {} : { ownerId: auth.user.id }) }, select: { id: true } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'File is required' }, { status: 400 });
    const setCover = formData.get('setCover') === 'true';
    const result = await uploadToCloudinary(file, `propati/properties/${id}`, 'image');
    const photo = await prisma.$transaction(async (tx) => {
      if (setCover) await tx.propertyPhoto.updateMany({ where: { propertyId: id }, data: { isCover: false } });
      return tx.propertyPhoto.create({ data: { propertyId: id, url: result.url, publicId: result.publicId, isCover: setCover, sortOrder: 0 } });
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Upload property photo error:', error);
    return NextResponse.json({ error: 'Failed to upload property photo' }, { status: 500 });
  }
}

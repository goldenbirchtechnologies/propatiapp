import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

const photoSchema = z.object({ url: z.string().url(), publicId: z.string().optional(), isCover: z.boolean().default(false), sortOrder: z.number().int().nonnegative().default(0) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  try {
    const property = await prisma.property.findFirst({ where: { id, ...(auth.user.role === 'admin' ? {} : { ownerId: auth.user.id }) }, select: { id: true } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    const input = photoSchema.parse(await request.json());
    const photo = await prisma.$transaction(async (tx) => {
      if (input.isCover) await tx.propertyPhoto.updateMany({ where: { propertyId: id }, data: { isCover: false } });
      return tx.propertyPhoto.create({ data: { propertyId: id, url: input.url, publicId: input.publicId, isCover: input.isCover, sortOrder: input.sortOrder } });
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'Could not save property photo' }, { status: 500 });
  }
}

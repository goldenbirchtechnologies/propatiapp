import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

const photoSchema = z.object({ url: z.string().url(), publicId: z.string().optional(), isCover: z.boolean().default(false), sortOrder: z.number().int().nonnegative().default(0) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const { id, spaceId } = await params;
  try {
    const space = await prisma.space.findFirst({ where: { id: spaceId, propertyId: id, ...(auth.user.role === 'admin' ? {} : { property: { ownerId: auth.user.id } }) }, select: { id: true } });
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    const input = photoSchema.parse(await request.json());
    const photo = await prisma.$transaction(async (tx) => {
      if (input.isCover) await tx.spacePhoto.updateMany({ where: { spaceId }, data: { isCover: false } });
      return tx.spacePhoto.create({ data: { spaceId, url: input.url, publicId: input.publicId, isCover: input.isCover, sortOrder: input.sortOrder } });
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'Could not save space photo' }, { status: 500 });
  }
}

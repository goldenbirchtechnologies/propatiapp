import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

const updateSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  description: z.string().max(10000).optional().nullable(),
  intendedUse: z.string().max(200).optional().nullable(),
  physicalAttributes: z.record(z.string(), z.unknown()).optional().nullable(),
  facilities: z.record(z.string(), z.unknown()).optional().nullable(),
  onboardingStatus: z.enum(['draft', 'submitted']).optional(),
  spaces: z.array(z.object({ categoryName: z.string().min(1), spaceType: z.string().min(1), name: z.string().min(1), identifier: z.string().min(1), attributes: z.record(z.string(), z.unknown()).optional(), amenities: z.array(z.string()).optional(), capacity: z.number().int().nonnegative().optional() })).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const property = await prisma.property.findFirst({ where: { id, ...(auth.user.role === 'admin' ? {} : { ownerId: auth.user.id }) }, include: { spaceCategories: true, spaces: { orderBy: { identifier: 'asc' }, include: { listings: { select: { id: true, status: true, listingType: true } } } } } });
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  return NextResponse.json({ property });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  try {
    const input = updateSchema.parse(await request.json());
    const property = await prisma.property.findFirst({ where: { id, ...(auth.user.role === 'admin' ? {} : { ownerId: auth.user.id }) } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.property.update({ where: { id }, data: { name: input.name, description: input.description, intendedUse: input.intendedUse, physicalAttributes: input.physicalAttributes, facilities: input.facilities, onboardingStatus: input.onboardingStatus } });
      for (const space of input.spaces ?? []) {
        const category = await tx.spaceCategory.upsert({ where: { propertyId_categoryName_spaceType: { propertyId: id, categoryName: space.categoryName, spaceType: space.spaceType } }, create: { propertyId: id, categoryName: space.categoryName, spaceType: space.spaceType }, update: {} });
        await tx.space.upsert({ where: { propertyId_identifier: { propertyId: id, identifier: space.identifier } }, create: { propertyId: id, categoryId: category.id, name: space.name, identifier: space.identifier, attributes: space.attributes, amenities: space.amenities, capacity: space.capacity }, update: { categoryId: category.id, name: space.name, attributes: space.attributes, amenities: space.amenities, capacity: space.capacity } });
      }
      return tx.property.findUnique({ where: { id }, include: { spaceCategories: true, spaces: { include: { listings: true } } } });
    });
    return NextResponse.json({ property: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    console.error('PATCH /api/properties error:', error);
    return NextResponse.json({ error: 'Could not update property' }, { status: 500 });
  }
}

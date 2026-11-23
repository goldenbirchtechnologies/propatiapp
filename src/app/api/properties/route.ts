import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

const spaceSchema = z.object({
  categoryName: z.string().min(1).max(80),
  spaceType: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  identifier: z.string().min(1).max(80),
  attributes: z.record(z.string(), z.unknown()).optional(),
  amenities: z.array(z.string()).optional(),
  capacity: z.number().int().nonnegative().optional(),
});

const propertySchema = z.object({
  category: z.enum(['residential', 'commercial', 'industrial', 'hospitality', 'outdoor_recreation', 'mixed_use']),
  subtype: z.string().min(1).max(80),
  name: z.string().min(2).max(160),
  intendedUse: z.string().max(200).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  country: z.string().min(2).default('Nigeria'),
  state: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  landmarks: z.string().max(500).optional().nullable(),
  coordinates: z.record(z.string(), z.unknown()).optional().nullable(),
  physicalAttributes: z.record(z.string(), z.unknown()).optional().nullable(),
  facilities: z.record(z.string(), z.unknown()).optional().nullable(),
  ownershipRefs: z.record(z.string(), z.unknown()).optional().nullable(),
  onboardingStatus: z.enum(['draft', 'submitted']).default('draft'),
  spaces: z.array(spaceSchema).default([]),
});

function dedupeSpaces(spaces: z.infer<typeof spaceSchema>[]) {
  const seen = new Set<string>();
  return spaces.filter((space) => {
    const key = space.identifier.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const properties = await prisma.property.findMany({
    where: auth.user.role === 'admin' ? undefined : { ownerId: auth.user.id },
    include: { photos: true, spaceCategories: true, spaces: { orderBy: { identifier: 'asc' }, include: { photos: true, currentTenant: { select: { id: true, fullName: true, email: true } }, listings: { select: { id: true, status: true, listingType: true } } } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ properties });
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  try {
    const input = propertySchema.parse(await request.json());
    const spaces = dedupeSpaces(input.spaces);
    const property = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          ownerId: auth.user.id,
          category: input.category,
          subtype: input.subtype,
          name: input.name,
          intendedUse: input.intendedUse ?? null,
          description: input.description ?? null,
          country: input.country,
          state: input.state,
          city: input.city,
          address: input.address,
          landmarks: input.landmarks ?? null,
          coordinates: input.coordinates as any,
          physicalAttributes: input.physicalAttributes as any,
          facilities: input.facilities as any,
          ownershipRefs: input.ownershipRefs as any,
          onboardingStatus: input.onboardingStatus,
        },
      });
      const categories = new Map<string, string>();
      for (const space of spaces) {
        const key = `${space.categoryName.toLowerCase()}::${space.spaceType.toLowerCase()}`;
        let categoryId = categories.get(key);
        if (!categoryId) {
          const category = await tx.spaceCategory.create({ data: { propertyId: created.id, categoryName: space.categoryName, spaceType: space.spaceType } });
          categoryId = category.id;
          categories.set(key, categoryId);
        }
        await tx.space.create({
          data: {
            propertyId: created.id,
            categoryId,
            name: space.name,
            identifier: space.identifier.trim(),
            attributes: space.attributes as any,
            amenities: space.amenities as any,
            capacity: space.capacity,
          },
        });
      }
      return tx.property.findUnique({ where: { id: created.id }, include: { spaceCategories: true, spaces: true } });
    });
    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    console.error('POST /api/properties error:', error);
    return NextResponse.json({ error: 'Could not save property' }, { status: 500 });
  }
}

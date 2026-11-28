import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-auth';

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  identifier: z.string().min(1).max(80).optional(),
  capacity: z.number().int().nonnegative().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  operationalStatus: z.enum(['available', 'occupied', 'reserved', 'unavailable', 'maintenance']).optional(),
  currentTenantId: z.string().cuid().nullable().optional(),
  leaseStartDate: z.string().datetime().nullable().optional(),
  leaseEndDate: z.string().datetime().nullable().optional(),
});

const createSchema = z.object({
  categoryName: z.string().min(1).max(80),
  spaceType: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  identifier: z.string().min(1).max(80),
  attributes: z.record(z.string(), z.unknown()).optional(),
  amenities: z.array(z.string()).optional(),
  capacity: z.number().int().nonnegative().optional(),
});

async function ownedSpace(request: NextRequest, id: string, spaceId: string) {
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return { auth };
  const space = await prisma.space.findFirst({ where: { id: spaceId, propertyId: id, ...(auth.user.role === 'admin' ? {} : { property: { ownerId: auth.user.id } }) }, include: { property: { select: { ownerId: true } } } });
  return { auth, space };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const { id, spaceId } = await params;
  const result = await ownedSpace(request, id, spaceId);
  if (result.auth instanceof NextResponse) return result.auth;
  if (!result.space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  return NextResponse.json({ space: result.space });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const { id } = await params;
  const auth = await withAuth(request, ['landlord', 'estate_manager', 'admin']);
  if (auth instanceof NextResponse) return auth;
  const property = await prisma.property.findFirst({ where: { id, ...(auth.user.role === 'admin' ? {} : { ownerId: auth.user.id }) }, select: { id: true } });
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  try {
    const input = createSchema.parse(await request.json());
    const category = await prisma.spaceCategory.upsert({ where: { propertyId_categoryName_spaceType: { propertyId: id, categoryName: input.categoryName, spaceType: input.spaceType } }, create: { propertyId: id, categoryName: input.categoryName, spaceType: input.spaceType }, update: {} });
    const existing = await prisma.space.findFirst({ where: { propertyId: id, identifier: input.identifier.trim() }, select: { id: true } });
    if (existing) return NextResponse.json({ error: 'A space with this identifier already exists on the property' }, { status: 409 });
    const space = await prisma.space.create({ data: { propertyId: id, categoryId: category.id, name: input.name.trim(), identifier: input.identifier.trim(), attributes: input.attributes as any, amenities: input.amenities, capacity: input.capacity } });
    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    console.error('POST /api/properties/[id]/spaces error:', error);
    return NextResponse.json({ error: 'Could not create space' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const { id, spaceId } = await params;
  const result = await ownedSpace(request, id, spaceId);
  if (result.auth instanceof NextResponse) return result.auth;
  if (!result.space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  try {
    const input = updateSchema.parse(await request.json());
    if (input.currentTenantId) {
      const tenant = await prisma.user.findFirst({ where: { id: input.currentTenantId, role: 'tenant' }, select: { id: true } });
      if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
    }
    const space = await prisma.space.update({ where: { id: spaceId }, data: { name: input.name, identifier: input.identifier, capacity: input.capacity, amenities: input.amenities as any, attributes: input.attributes as any, operationalStatus: input.operationalStatus, currentTenantId: input.currentTenantId, leaseStartDate: input.leaseStartDate === undefined ? undefined : input.leaseStartDate ? new Date(input.leaseStartDate) : null, leaseEndDate: input.leaseEndDate === undefined ? undefined : input.leaseEndDate ? new Date(input.leaseEndDate) : null } });
    return NextResponse.json({ space });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    console.error('PATCH /api/properties/[id]/spaces/[spaceId] error:', error);
    return NextResponse.json({ error: 'Could not update space' }, { status: 500 });
  }
}

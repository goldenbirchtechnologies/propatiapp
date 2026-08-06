import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { UnitStatus, UnitOccupancy, PropertyType } from '@prisma/client';

const createUnitSchema = z.object({
  buildingName: z.string().optional(),
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: z.enum(['apartment', 'house', 'duplex', 'office', 'shop', 'warehouse', 'land']),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  sizeSqm: z.number().positive().optional(),
  rent: z.number().positive(),
  cautionDeposit: z.number().positive().optional(),
  serviceCharge: z.number().positive().optional(),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
  occupancy: z.enum(['VACANT', 'OCCUPIED', 'NOTICE_GIVEN']).optional(),
  listingId: z.string().min(1, 'Parent property is required'),
  listingType: z.enum(['rent', 'sale', 'short_let', 'share', 'commercial']).default('rent'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as UnitStatus | null;
    const occupancy = searchParams.get('occupancy') as UnitOccupancy | null;
    const buildingName = searchParams.get('buildingName');
    const type = searchParams.get('type') as PropertyType | null;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = {
      organizationId: id,
    };

    if (status) where.status = status;
    if (occupancy) where.occupancy = occupancy;
    if (buildingName) where.buildingName = buildingName;
    if (type) where.type = type;

    const [units, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        orderBy: [
          { buildingName: 'asc' },
          { unitNumber: 'asc' },
        ],
        skip,
        take,
        include: {
          currentTenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              address: true,
              area: true,
            },
          },
        },
      }),
      prisma.unit.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: units.map((unit) => ({
        ...unit,
        rent: Number(unit.rent),
        cautionDeposit: unit.cautionDeposit ? Number(unit.cautionDeposit) : null,
        serviceCharge: unit.serviceCharge ? Number(unit.serviceCharge) : null,
        sizeSqm: unit.sizeSqm ? Number(unit.sizeSqm) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Units GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true, maxUnits: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can create units
    const isOwner = org.ownerId === user.id;
    if (!isOwner && membership.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    // Check unit limit
    if (org.maxUnits > 0) {
      const currentUnits = await prisma.unit.count({ where: { organizationId: id } });
      if (currentUnits >= org.maxUnits) {
        return NextResponse.json({
          error: `Unit limit reached. Current: ${currentUnits}, Max: ${org.maxUnits}`,
        }, { status: 400 });
      }
    }

    const body = await request.json();
    console.log('Units POST body:', JSON.stringify(body));
    const validated = createUnitSchema.safeParse(body);
    if (!validated.success) {
      console.error('Units POST validation error:', validated.error);
      return NextResponse.json({ error: 'Invalid request body', details: validated.error }, { status: 400 });
    }

    // Check for duplicate unit number within building
    const existingUnit = await prisma.unit.findFirst({
      where: {
        organizationId: id,
        buildingName: validated.data.buildingName || null,
        unitNumber: validated.data.unitNumber,
      },
    });

    if (existingUnit) {
      return NextResponse.json({
        error: `Unit ${validated.data.unitNumber} already exists in ${validated.data.buildingName || 'this building'}`,
      }, { status: 400 });
    }

    // Validate listing belongs to org if provided
    if (validated.data.listingId) {
      const orgListing = await prisma.orgListing.findFirst({
        where: {
          orgId: id,
          listingId: validated.data.listingId,
        },
      });

      if (!orgListing) {
        return NextResponse.json({
          error: 'Listing does not belong to this organization',
        }, { status: 400 });
      }
    }

    const unit = await prisma.unit.create({
      data: {
        organizationId: id,
        unitNumber: validated.data.unitNumber,
        buildingName: validated.data.buildingName,
        type: validated.data.type as PropertyType,
        bedrooms: validated.data.bedrooms,
        bathrooms: validated.data.bathrooms,
        sizeSqm: validated.data.sizeSqm,
        rent: validated.data.rent,
        cautionDeposit: validated.data.cautionDeposit,
        serviceCharge: validated.data.serviceCharge,
        status: (validated.data.status as UnitStatus) || 'AVAILABLE',
        occupancy: (validated.data.occupancy as UnitOccupancy) || 'VACANT',
        listingId: validated.data.listingId,
        listingType: validated.data.listingType,
      },
      include: {
        currentTenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: unit,
    }, { status: 201 });
  } catch (error) {
    console.error('Units POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error, step: 'units_body_parse' }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = /listing does not belong|already exists|limit reached/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message, step: 'units_create' }, { status });
  }
}

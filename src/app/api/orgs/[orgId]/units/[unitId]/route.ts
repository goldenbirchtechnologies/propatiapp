import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { UnitStatus, UnitOccupancy, PropertyType } from '@prisma/client';

const updateUnitSchema = z.object({
  buildingName: z.string().optional(),
  unitNumber: z.string().min(1).optional(),
  type: z.enum(['apartment', 'house', 'duplex', 'office', 'shop', 'warehouse', 'land']).optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  sizeSqm: z.number().positive().optional(),
  rent: z.number().positive().optional(),
  cautionDeposit: z.number().positive().optional(),
  serviceCharge: z.number().positive().optional(),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
  occupancy: z.enum(['VACANT', 'OCCUPIED', 'NOTICE_GIVEN']).optional(),
  currentTenantId: z.string().nullable().optional(),
  leaseStartDate: z.string().datetime().nullable().optional(),
  leaseEndDate: z.string().datetime().nullable().optional(),
  lastMaintenanceDate: z.string().datetime().nullable().optional(),
  nextMaintenanceDate: z.string().datetime().nullable().optional(),
  listingId: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; unitId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { orgId, unitId } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        organizationId: orgId,
      },
      include: {
        currentTenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            employmentStatus: true,
            employerName: true,
            jobTitle: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            images: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error('Unit GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; unitId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { orgId, unitId } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can update units
    const isOwner = org.ownerId === user.id;
    if (!isOwner && membership.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        organizationId: orgId,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateUnitSchema.parse(body);

    // Check for duplicate unit number if changing
    if (validated.unitNumber && validated.unitNumber !== unit.unitNumber) {
      const existingUnit = await prisma.unit.findFirst({
        where: {
          organizationId: orgId,
          buildingName: validated.buildingName || unit.buildingName,
          unitNumber: validated.unitNumber,
          id: { not: unitId },
        },
      });

      if (existingUnit) {
        return NextResponse.json({
          error: `Unit ${validated.unitNumber} already exists in ${validated.buildingName || unit.buildingName}`,
        }, { status: 400 });
      }
    }

    // Validate tenant exists if setting one
    if (validated.currentTenantId) {
      const tenant = await prisma.user.findUnique({
        where: { id: validated.currentTenantId },
      });

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
    }

    // Validate listing belongs to org if provided
    if (validated.listingId) {
      const orgListing = await prisma.orgListing.findFirst({
        where: {
          orgId,
          listingId: validated.listingId,
        },
      });

      if (!orgListing) {
        return NextResponse.json({
          error: 'Listing does not belong to this organization',
        }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};

    if (validated.buildingName !== undefined) updateData.buildingName = validated.buildingName;
    if (validated.unitNumber) updateData.unitNumber = validated.unitNumber;
    if (validated.type) updateData.type = validated.type as PropertyType;
    if (validated.bedrooms !== undefined) updateData.bedrooms = validated.bedrooms;
    if (validated.bathrooms !== undefined) updateData.bathrooms = validated.bathrooms;
    if (validated.sizeSqm !== undefined) updateData.sizeSqm = validated.sizeSqm;
    if (validated.rent !== undefined) updateData.rent = validated.rent;
    if (validated.cautionDeposit !== undefined) updateData.cautionDeposit = validated.cautionDeposit;
    if (validated.serviceCharge !== undefined) updateData.serviceCharge = validated.serviceCharge;
    if (validated.status) updateData.status = validated.status as UnitStatus;
    if (validated.occupancy) updateData.occupancy = validated.occupancy as UnitOccupancy;
    if (validated.currentTenantId !== undefined) updateData.currentTenantId = validated.currentTenantId;
    if (validated.leaseStartDate !== undefined) updateData.leaseStartDate = validated.leaseStartDate ? new Date(validated.leaseStartDate) : null;
    if (validated.leaseEndDate !== undefined) updateData.leaseEndDate = validated.leaseEndDate ? new Date(validated.leaseEndDate) : null;
    if (validated.lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = validated.lastMaintenanceDate ? new Date(validated.lastMaintenanceDate) : null;
    if (validated.nextMaintenanceDate !== undefined) updateData.nextMaintenanceDate = validated.nextMaintenanceDate ? new Date(validated.nextMaintenanceDate) : null;
    if (validated.listingId !== undefined) updateData.listingId = validated.listingId;

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: updateData,
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
      data: updatedUnit,
    });
  } catch (error) {
    console.error('Unit PATCH error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; unitId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { orgId, unitId } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can delete units
    const isOwner = org.ownerId === user.id;
    if (!isOwner && membership.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        organizationId: orgId,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Check if unit is currently occupied
    if (unit.occupancy === 'OCCUPIED') {
      return NextResponse.json({
        error: 'Cannot delete occupied unit. Please remove tenant first.',
      }, { status: 400 });
    }

    await prisma.unit.delete({ where: { id: unitId } });

    return NextResponse.json({
      success: true,
      message: 'Unit deleted successfully',
    });
  } catch (error) {
    console.error('Unit DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

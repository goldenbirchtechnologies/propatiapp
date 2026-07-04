import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    // Ensure the estate manager owns/or has access to this org
    if (user.role === 'estate_manager') {
      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
        select: { id: true, ownerId: true },
      });
      if (!org || org.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const units = await prisma.unit.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        organizationId: true,
        listingId: true,
        buildingName: true,
        unitNumber: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        sizeSqm: true,
        rent: true,
        cautionDeposit: true,
        serviceCharge: true,
        status: true,
        occupancy: true,
        currentTenantId: true,
        currentTenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        leaseStartDate: true,
        leaseEndDate: true,
        lastMaintenanceDate: true,
        nextMaintenanceDate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ buildingName: 'asc' }, { unitNumber: 'asc' }],
    });

    return NextResponse.json({ success: true, data: units });
  } catch (error) {
    console.error('Estate manager units GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    if (user.role === 'estate_manager') {
      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
        select: { ownerId: true },
      });
      if (!org || org.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const tenants = await prisma.user.findMany({
      where: {
        role: 'tenant',
        currentlyRentingUnits: {
          some: {
            organizationId: orgId,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        currentlyRentingUnits: {
          select: {
            id: true,
            buildingName: true,
            unitNumber: true,
            status: true,
            occupancy: true,
            organizationId: true,
            leaseStartDate: true,
            leaseEndDate: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const mappedTenants = tenants.map((tenant) => {
      const unit = tenant.currentlyRentingUnits[0];
      const leaseEnd = unit?.leaseEndDate ? new Date(unit.leaseEndDate).toISOString().split('T')[0] : '-';
      const occupancy = unit?.occupancy;
      const status =
        occupancy === 'NOTICE_GIVEN'
          ? 'notice_period'
          : occupancy === 'OCCUPIED'
            ? 'active'
            : 'pending';
      const noticePeriod = occupancy === 'NOTICE_GIVEN';

      return {
        id: tenant.id,
        name: tenant.fullName,
        email: tenant.email,
        unit: unit ? `${unit.buildingName ? `${unit.buildingName} ` : ''}${unit.unitNumber}` : '-',
        status,
        leaseEnd,
        noticePeriod,
      };
    });

    return NextResponse.json({ success: true, data: mappedTenants });
  } catch (error) {
    console.error('Tenants GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

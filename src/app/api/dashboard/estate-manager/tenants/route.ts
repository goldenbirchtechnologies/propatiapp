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
        clerkId: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        ninVerified: true,
        idVerified: true,
        phoneVerified: true,
        employmentStatus: true,
        employmentType: true,
        employerName: true,
        jobTitle: true,
        yearlyIncome: true,
        incomeVerified: true,
        profileBio: true,
        profileCompleted: true,
        guarantorName: true,
        guarantorPhone: true,
        guarantorRelationship: true,
        isActive: true,
        isBanned: true,
        banReason: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        currentlyRentingUnits: {
          select: {
            id: true,
            buildingName: true,
            unitNumber: true,
            status: true,
            occupancy: true,
            organizationId: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ success: true, data: tenants });
  } catch (error) {
    console.error('Tenants GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

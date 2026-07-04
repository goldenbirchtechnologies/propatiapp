import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        ownerId: true,
        agentId: true,
        title: true,
        description: true,
        listingType: true,
        propertyType: true,
        address: true,
        area: true,
        state: true,
        price: true,
        pricePeriod: true,
        cautionDeposit: true,
        serviceCharge: true,
        bedrooms: true,
        bathrooms: true,
        toilets: true,
        sizeSqm: true,
        floorLevel: true,
        furnished: true,
        parkingSpaces: true,
        amenities: true,
        availableFrom: true,
        minimumStay: true,
        status: true,
        verificationTier: true,
        isFeatured: true,
        allowShortlet: true,
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('Landlord vacancies GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bulkUploadSchema = z.object({
  listings: z.array(z.object({
    title: z.string().min(5).max(100),
    description: z.string().max(5000).optional(),
    listingType: z.enum(['rent', 'sale', 'short_let', 'share', 'commercial']),
    propertyType: z.enum(['apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse']).optional(),
    address: z.string().min(5),
    area: z.string().min(2),
    state: z.string().min(2).default('Lagos'),
    price: z.number().positive(),
    pricePeriod: z.enum(['night', 'month', 'year', 'total']).optional(),
    cautionDeposit: z.number().nonnegative().optional(),
    serviceCharge: z.number().nonnegative().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    toilets: z.number().int().nonnegative().optional(),
    sizeSqm: z.number().positive().optional(),
    floorLevel: z.number().int().nonnegative().optional(),
    furnished: z.boolean().default(false),
    parkingSpaces: z.number().int().nonnegative().default(0),
    amenities: z.array(z.string()).optional(),
    availableFrom: z.string().datetime().optional(),
    minimumStay: z.number().int().positive().optional(),
    images: z.array(z.string().url()).optional(),
  })).min(1).max(50),
});

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

    // Only owner, manager, or maintenance can bulk upload
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'maintenance'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    // Check unit limit
    const currentUnits = await prisma.orgListing.count({ where: { orgId: id } });
    const body = await request.json();
    const validated = bulkUploadSchema.parse(body);
    const newListingsCount = validated.listings.length;

    if (org.maxUnits > 0 && currentUnits + newListingsCount > org.maxUnits) {
      return NextResponse.json({ 
        error: `Unit limit would be exceeded. Current: ${currentUnits}, Adding: ${newListingsCount}, Max: ${org.maxUnits}` 
      }, { status: 400 });
    }

    const results = {
      created: [] as Array<{ id: string; title: string }>,
      failed: [] as Array<{ index: number; title: string; error: string }>,
      orgListings: [] as Array<{ id: string; listingId: string }>,
    };

    // Process each listing in a transaction
    for (let i = 0; i < validated.listings.length; i++) {
      const listingData = validated.listings[i];
      const { images, ...listingFields } = listingData;

      try {
        // Create listing
        const listing = await prisma.listing.create({
          data: {
            ...listingFields,
            ownerId: user.id,
            status: 'draft',
          },
        });

        // Create images if provided
        if (images && images.length > 0) {
          await prisma.listingImage.createMany({
            data: images.map((url, idx) => ({
              listingId: listing.id,
              url,
              isCover: idx === 0,
              sortOrder: idx,
            })),
          });
        }

        // Link to organization
        const orgListing = await prisma.orgListing.create({
          data: {
            orgId: id,
            listingId: listing.id,
          },
        });

        results.created.push({ id: listing.id, title: listing.title });
        results.orgListings.push({ id: orgListing.id, listingId: listing.id });
      } catch (error) {
        console.error(`Failed to create listing ${i}:`, error);
        results.failed.push({ index: i, title: listingData.title, error: 'Creation failed' });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      summary: { total: validated.listings.length, created: results.created.length, failed: results.failed.length },
    }, { status: results.created.length > 0 ? 201 : 400 });
  } catch (error) {
    console.error('Org Bulk Upload POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
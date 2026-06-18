import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseUnitsCSV } from '@/lib/csv-parser';
import { PropertyType, UnitStatus, UnitOccupancy } from '@prisma/client';

const bulkUploadSchema = z.object({
  csvData: z.string().min(1, 'CSV data is required'),
});

const bulkUploadListingsSchema = z.object({
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

    // Only owner or manager can bulk upload
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const body = await request.json();

    // Check if this is CSV data (units) or JSON array (legacy listings)
    if (body.csvData) {
      // New CSV-based unit upload
      const validated = bulkUploadSchema.parse(body);

      // Parse CSV
      const parseResult = parseUnitsCSV(validated.csvData);

      if (parseResult.success.length === 0 && parseResult.failed.length > 0) {
        return NextResponse.json({
          error: 'All units failed validation',
          details: parseResult.failed,
        }, { status: 400 });
      }

      // Check unit limit
      const currentUnits = await prisma.unit.count({ where: { organizationId: id } });
      const newUnitsCount = parseResult.success.length;

      if (org.maxUnits > 0 && currentUnits + newUnitsCount > org.maxUnits) {
        return NextResponse.json({
          error: `Unit limit would be exceeded. Current: ${currentUnits}, Adding: ${newUnitsCount}, Max: ${org.maxUnits}`,
        }, { status: 400 });
      }

      const results = {
        created: [] as Array<{ id: string; unitNumber: string; buildingName?: string }>,
        failed: parseResult.failed,
      };

      // Process each unit in batches of 50
      const batchSize = 50;
      for (let i = 0; i < parseResult.success.length; i += batchSize) {
        const batch = parseResult.success.slice(i, i + batchSize);

        for (const unitData of batch) {
          try {
            // Check for duplicate
            const existingUnit = await prisma.unit.findFirst({
              where: {
                organizationId: id,
                buildingName: unitData.buildingName || null,
                unitNumber: unitData.unitNumber,
              },
            });

            if (existingUnit) {
              results.failed.push({
                row: i + results.created.length + 1,
                errors: [`Unit ${unitData.unitNumber} already exists in ${unitData.buildingName || 'building'}`],
                data: unitData as Record<string, unknown>,
              });
              continue;
            }

            // Validate listing if provided
            if (unitData.listingId) {
              const orgListing = await prisma.orgListing.findFirst({
                where: {
                  orgId: id,
                  listingId: unitData.listingId,
                },
              });

              if (!orgListing) {
                results.failed.push({
                  row: i + results.created.length + 1,
                  errors: ['Listing does not belong to this organization'],
                  data: unitData as Record<string, unknown>,
                });
                continue;
              }
            }

            const unit = await prisma.unit.create({
              data: {
                organizationId: id,
                unitNumber: unitData.unitNumber,
                buildingName: unitData.buildingName,
                type: unitData.type as PropertyType,
                bedrooms: unitData.bedrooms,
                bathrooms: unitData.bathrooms,
                sizeSqm: unitData.sizeSqm,
                rent: unitData.rent,
                cautionDeposit: unitData.cautionDeposit,
                serviceCharge: unitData.serviceCharge,
                status: (unitData.status as UnitStatus) || 'AVAILABLE',
                occupancy: (unitData.occupancy as UnitOccupancy) || 'VACANT',
                listingId: unitData.listingId,
              },
            });

            results.created.push({
              id: unit.id,
              unitNumber: unit.unitNumber,
              buildingName: unit.buildingName || undefined,
            });
          } catch (error) {
            console.error(`Failed to create unit:`, error);
            results.failed.push({
              row: i + results.created.length + 1,
              errors: ['Creation failed'],
              data: unitData as Record<string, unknown>,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: results,
        summary: {
          total: parseResult.success.length,
          created: results.created.length,
          failed: results.failed.length,
        },
      }, { status: results.created.length > 0 ? 201 : 400 });
    } else {
      // Legacy listings upload (keep for backward compatibility)
      const validated = bulkUploadListingsSchema.parse(body);
      const currentUnits = await prisma.orgListing.count({ where: { orgId: id } });
      const newListingsCount = validated.listings.length;

      if (org.maxUnits > 0 && currentUnits + newListingsCount > org.maxUnits) {
        return NextResponse.json({
          error: `Unit limit would be exceeded. Current: ${currentUnits}, Adding: ${newListingsCount}, Max: ${org.maxUnits}`,
        }, { status: 400 });
      }

      const results = {
        created: [] as Array<{ id: string; title: string }>,
        failed: [] as Array<{ index: number; title: string; error: string }>,
        orgListings: [] as Array<{ id: string; listingId: string }>,
      };

      for (let i = 0; i < validated.listings.length; i++) {
        const listingData = validated.listings[i];
        const { images, ...listingFields } = listingData;

        try {
          const listing = await prisma.listing.create({
            data: {
              ...listingFields,
              ownerId: user.id,
              status: 'draft',
            },
          });

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
    }
  } catch (error) {
    console.error('Org Bulk Upload POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
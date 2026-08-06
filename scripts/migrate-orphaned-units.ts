import { prisma } from '../src/lib/prisma';

type OrphanCandidate = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  listingType: string;
  propertyType: string | null;
  price: number;
  pricePeriod: string | null;
  allowShortlet: boolean;
  ownerId: string;
  organizationId: string | null;
};

const UNIT_PATTERN = /^(.*?)\s*-\s*Unit\s*(\d+[A-Za-z]*|\w+)\s*$/i;

async function migrate() {
  console.log('Scanning for orphaned unit-like listings...');

  const candidates = await prisma.listing.findMany({
    where: {
      OR: [
        { units: { none: {} } },
        { units: { some: { listingId: { equals: '' } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      address: true,
      area: true,
      state: true,
      listingType: true,
      propertyType: true,
      price: true,
      pricePeriod: true,
      allowShortlet: true,
      ownerId: true,
      organizationId: true,
    },
  });

  const orphanCandidates = candidates.filter((c) => {
    const match = c.title.match(UNIT_PATTERN);
    return !!match;
  }) as OrphanCandidate[];

  console.log(`Found ${orphanCandidates.length} candidate orphaned entries.`);

  for (const candidate of orphanCandidates) {
    const match = candidate.title.match(UNIT_PATTERN);
    if (!match) continue;

    const parentName = match[1].trim();
    const unitNumber = match[2].trim();

    console.log(`\nProcessing: "${candidate.title}" => parent="${parentName}", unit="${unitNumber}"`);

    let parentListing = await prisma.listing.findFirst({
      where: {
        title: parentName,
        ownerId: candidate.ownerId,
      },
      select: { id: true, organizationId: true },
    });

    if (!parentListing) {
      console.log(`  Creating parent listing: "${parentName}"`);
      parentListing = await prisma.listing.create({
        data: {
          title: parentName,
          address: candidate.address,
          area: candidate.area,
          state: candidate.state,
          listingType: candidate.listingType,
          propertyType: candidate.propertyType,
          price: candidate.price,
          pricePeriod: candidate.pricePeriod,
          allowShortlet: candidate.allowShortlet,
          status: 'draft',
          ownerId: candidate.ownerId,
          organizationId: candidate.organizationId,
        },
        select: { id: true, organizationId: true },
      });
    }

    const orgId = parentListing.organizationId || candidate.organizationId;

    if (!orgId) {
      console.log(`  Skipping: no organization for parent listing ${parentListing.id}`);
      continue;
    }

    const existingUnit = await prisma.unit.findFirst({
      where: {
        organizationId: orgId,
        buildingName: parentName,
        unitNumber,
      },
    });

    if (existingUnit) {
      console.log(`  Unit already exists: ${existingUnit.id}`);
    } else {
      await prisma.unit.create({
        data: {
          organizationId: orgId,
          listingId: parentListing.id,
          buildingName: parentName,
          unitNumber,
          type: candidate.propertyType || 'apartment',
          listingType: candidate.listingType,
          pricePeriod: candidate.pricePeriod,
          rent: candidate.price,
          status: 'AVAILABLE',
          occupancy: 'VACANT',
          isListed: false,
        },
      });
      console.log(`  Created unit: ${unitNumber} under ${parentListing.id}`);
    }

    await prisma.listing.delete({
      where: { id: candidate.id },
    });
    console.log(`  Deleted orphaned listing: ${candidate.id}`);
  }

  console.log('\nMigration complete.');
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

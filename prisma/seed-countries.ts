import { PrismaClient } from '@prisma/client';
import { NIGERIAN_STATES } from '../src/lib/locations/nigeria-states';
import { PLATFORM_COUNTRIES } from '../src/lib/locations/platform-countries';

const prisma = new PrismaClient();

// Shared with the onboarding options route and location validation so the seed
// and the runtime fallback can never drift apart.
const COUNTRIES = PLATFORM_COUNTRIES;

export async function seedCountriesAndJurisdictions(client: PrismaClient = prisma) {
  for (const country of COUNTRIES) {
    await client.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log(`Seeded ${COUNTRIES.length} countries`);

  for (const state of NIGERIAN_STATES) {
    await client.jurisdiction.upsert({
      where: { id: `jur_${state.code.toLowerCase()}` },
      update: {},
      create: {
        id: `jur_${state.code.toLowerCase()}`,
        countryId: 'NG',
        name: state.name,
        level: 'state',
        code: state.code,
        active: true,
      },
    });
  }
  console.log(`Seeded ${NIGERIAN_STATES.length} Nigerian jurisdictions`);
}

async function main() {
  await seedCountriesAndJurisdictions(prisma);
}

// Only run standalone when invoked directly — importing this module (e.g. from
// prisma/seed.ts) must not trigger a second seed pass.
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Error seeding countries:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

import { PrismaClient } from '@prisma/client';
import { NIGERIAN_STATES } from '../src/lib/locations/nigeria-states';

const prisma = new PrismaClient();

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', locale: 'en-NG', timezone: 'Africa/Lagos', active: true },
  { code: 'GH', name: 'Ghana', currency: 'GHS', locale: 'en-GH', timezone: 'Africa/Accra', active: false },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', locale: 'en-GB', timezone: 'Europe/London', active: false },
  { code: 'BJ', name: 'Benin', currency: 'XOF', locale: 'fr-BJ', timezone: 'Africa/Porto-Novo', active: false },
  { code: 'IT', name: 'Italy', currency: 'EUR', locale: 'it-IT', timezone: 'Europe/Rome', active: false },
];

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

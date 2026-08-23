import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed countries
  const countries = [
    { code: 'NG', name: 'Nigeria', currency: 'NGN', locale: 'en-NG', timezone: 'Africa/Lagos', active: true },
    { code: 'GH', name: 'Ghana', currency: 'GHS', locale: 'en-GH', timezone: 'Africa/Accra', active: false },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', locale: 'en-GB', timezone: 'Europe/London', active: false },
    { code: 'BJ', name: 'Benin', currency: 'XOF', locale: 'fr-BJ', timezone: 'Africa/Porto-Novo', active: false },
    { code: 'IT', name: 'Italy', currency: 'EUR', locale: 'it-IT', timezone: 'Europe/Rome', active: false },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log(`Seeded ${countries.length} countries`);

  // Seed Nigerian jurisdictions (36 states + FCT)
  const states = [
    { code: 'AB', name: 'Abia', level: 'state' },
    { code: 'AD', name: 'Adamawa', level: 'state' },
    { code: 'AK', name: 'Akwa Ibom', level: 'state' },
    { code: 'AN', name: 'Anambra', level: 'state' },
    { code: 'BA', name: 'Bauchi', level: 'state' },
    { code: 'BY', name: 'Bayelsa', level: 'state' },
    { code: 'BE', name: 'Benue', level: 'state' },
    { code: 'BO', name: 'Borno', level: 'state' },
    { code: 'CR', name: 'Cross River', level: 'state' },
    { code: 'DE', name: 'Delta', level: 'state' },
    { code: 'EB', name: 'Ebonyi', level: 'state' },
    { code: 'ED', name: 'Edo', level: 'state' },
    { code: 'EK', name: 'Ekiti', level: 'state' },
    { code: 'EN', name: 'Enugu', level: 'state' },
    { code: 'FC', name: 'FCT', level: 'state' },
    { code: 'GO', name: 'Gombe', level: 'state' },
    { code: 'IM', name: 'Imo', level: 'state' },
    { code: 'JI', name: 'Jigawa', level: 'state' },
    { code: 'KD', name: 'Kaduna', level: 'state' },
    { code: 'KN', name: 'Kano', level: 'state' },
    { code: 'KT', name: 'Katsina', level: 'state' },
    { code: 'KE', name: 'Kebbi', level: 'state' },
    { code: 'KO', name: 'Kogi', level: 'state' },
    { code: 'KW', name: 'Kwara', level: 'state' },
    { code: 'LA', name: 'Lagos', level: 'state' },
    { code: 'NA', name: 'Nasarawa', level: 'state' },
    { code: 'NI', name: 'Niger', level: 'state' },
    { code: 'OG', name: 'Ogun', level: 'state' },
    { code: 'ON', name: 'Ondo', level: 'state' },
    { code: 'OS', name: 'Osun', level: 'state' },
    { code: 'OY', name: 'Oyo', level: 'state' },
    { code: 'PL', name: 'Plateau', level: 'state' },
    { code: 'RI', name: 'Rivers', level: 'state' },
    { code: 'SO', name: 'Sokoto', level: 'state' },
    { code: 'TA', name: 'Taraba', level: 'state' },
    { code: 'YO', name: 'Yobe', level: 'state' },
    { code: 'ZA', name: 'Zamfara', level: 'state' },
  ];

  for (const s of states) {
    await prisma.jurisdiction.upsert({
      where: { id: `jur_${s.code.toLowerCase()}` },
      update: {},
      create: {
        id: `jur_${s.code.toLowerCase()}`,
        countryId: 'NG',
        name: s.name,
        level: s.level,
        code: s.code,
        active: true,
      },
    });
  }
  console.log(`Seeded ${states.length} Nigerian jurisdictions`);

  // Seed Nigeria feature capabilities
  const features = [
    { feature: 'payments', enabled: true, available: true, note: 'Paystack NGN' },
    { feature: 'verification', enabled: true, available: true, note: 'Prembly NIN/BVN' },
    { feature: 'agreements', enabled: true, available: true, note: 'Tenancy agreements with e-sign' },
    { feature: 'documents', enabled: true, available: true, note: 'PDF generation' },
    { feature: 'notifications', enabled: true, available: true, note: 'Email, SMS, WhatsApp' },
  ];

  for (const feat of features) {
    await prisma.countryCapability.upsert({
      where: { countryId_feature: { countryId: 'NG', feature: feat.feature } },
      update: {},
      create: { countryId: 'NG', ...feat },
    });
  }
  console.log(`Seeded ${features.length} Nigeria capabilities`);

  // Seed Ghana capabilities (coming soon)
  const ghFeatures = [
    { feature: 'payments', enabled: false, available: true, note: 'Paystack GHS coming soon' },
    { feature: 'verification', enabled: false, available: true, note: 'Ghana Card API pending' },
    { feature: 'agreements', enabled: false, available: true, note: 'Templates in progress' },
    { feature: 'documents', enabled: false, available: false, note: 'Not yet available' },
    { feature: 'notifications', enabled: false, available: true, note: 'Email only initially' },
  ];

  for (const feat of ghFeatures) {
    await prisma.countryCapability.upsert({
      where: { countryId_feature: { countryId: 'GH', feature: feat.feature } },
      update: {},
      create: { countryId: 'GH', ...feat },
    });
  }
  console.log(`Seeded ${ghFeatures.length} Ghana capabilities`);
}

main()
  .catch(console.error)
  .finally(() => prisma.());

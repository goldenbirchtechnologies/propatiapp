import { prisma } from './prisma';

export async function isFeatureEnabled(countryCode: string, feature: string): Promise<boolean> {
  const cap = await prisma.countryCapability.findUnique({
    where: {
      countryId_feature: {
        countryId: countryCode.toUpperCase(),
        feature,
      },
    },
  });
  return cap?.enabled ?? false;
}

export async function getCountryFeatures(countryCode: string) {
  const caps = await prisma.countryCapability.findMany({
    where: { countryId: countryCode.toUpperCase() },
  });
  return caps.reduce((acc, cap) => {
    acc[cap.feature] = { enabled: cap.enabled, available: cap.available, note: cap.note };
    return acc;
  }, {} as Record<string, { enabled: boolean; available: boolean; note?: string | null }>);
}

export async function getAllCountryCapabilities() {
  return prisma.countryCapability.findMany({
    include: { country: true },
    orderBy: [{ countryId: 'asc' }, { feature: 'asc' }],
  });
}

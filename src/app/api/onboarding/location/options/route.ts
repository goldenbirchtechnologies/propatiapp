import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NIGERIAN_STATES } from '@/lib/locations/nigeria-states';
import { PLATFORM_COUNTRIES } from '@/lib/locations/platform-countries';

interface CountryOption {
  code: string;
  name: string;
  currency?: string;
  locale?: string;
  timezone?: string;
}

/**
 * GET /api/onboarding/location/options
 * Returns the countries a user can select, and the jurisdictions for a given
 * country. Both levels fall back to static lists when the countries or
 * jurisdictions tables have not been seeded — an unseeded database must never
 * leave the picker blank.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('countryCode')?.toUpperCase() ?? null;

  const staticCountries: CountryOption[] = PLATFORM_COUNTRIES.filter((c) => c.active)
    .map(({ code, name, currency, locale, timezone }) => ({ code, name, currency, locale, timezone }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const staticComingSoon: Array<{ code: string; name: string }> = PLATFORM_COUNTRIES.filter(
    (c) => !c.active
  )
    .map(({ code, name }) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  let countries: CountryOption[] = [];
  let comingSoon: Array<{ code: string; name: string }> = [];

  try {
    countries = await prisma.country.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { code: true, name: true, currency: true, locale: true, timezone: true },
    });

    comingSoon = await prisma.country.findMany({
      where: { active: false },
      orderBy: { name: 'asc' },
      select: { code: true, name: true },
    });
  } catch (error) {
    // Table missing or unreachable: the static list below keeps onboarding usable.
    console.error('Onboarding location options: country lookup failed', error);
  }

  if (countries.length === 0) countries = staticCountries;
  if (comingSoon.length === 0) comingSoon = staticComingSoon;

  if (!countryCode) {
    return NextResponse.json({
      success: true,
      data: {
        countries,
        comingSoon,
        jurisdictions: [],
      },
    });
  }

  let resolved: Array<{ id: string; name: string; code: string | null; level: string }> = [];

  try {
    const jurisdictions = await prisma.jurisdiction.findMany({
      where: { countryId: countryCode, active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, level: true },
    });
    resolved = jurisdictions;
  } catch (error) {
    console.error('Onboarding location options: jurisdiction lookup failed', error);
  }

  // Fall back to the static list when the table is empty for this country.
  if (resolved.length === 0 && countryCode === 'NG') {
    resolved = NIGERIAN_STATES.map((s) => ({
      id: `jur_${s.code.toLowerCase()}`,
      name: s.name,
      code: s.code,
      level: 'state',
    }));
  }

  return NextResponse.json({
    success: true,
    data: { countries, comingSoon, jurisdictions: resolved },
  });
}

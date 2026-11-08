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

  // Nigeria's jurisdictions are a fixed list of 36 states plus the FCT, so the
  // static table is the source of truth and the database only supplies ids.
  // A partially seeded table (a single state row) used to satisfy the old
  // "only fall back when empty" check and leave the picker with just that
  // state, so the two lists are unioned instead of chosen between.
  if (countryCode === 'NG') {
    const byState = new Map<string, (typeof resolved)[number]>();

    for (const state of NIGERIAN_STATES) {
      byState.set(state.code.toUpperCase(), {
        id: `jur_${state.code.toLowerCase()}`,
        name: state.name,
        code: state.code,
        level: 'state',
      });
    }

    // Database rows overwrite their static counterparts: they carry the ids the
    // foreign key expects, and renames made through the admin UI win.
    for (const row of resolved) {
      byState.set((row.code ?? row.id).toUpperCase(), row);
    }

    resolved = [...byState.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  return NextResponse.json({
    success: true,
    data: { countries, comingSoon, jurisdictions: resolved },
  });
}

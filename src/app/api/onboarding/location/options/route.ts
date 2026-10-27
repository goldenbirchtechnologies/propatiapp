import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NIGERIAN_STATES } from '@/lib/locations/nigeria-states';

/**
 * GET /api/onboarding/location/options
 * Returns the countries a user can select, and the jurisdictions for a given
 * country. Falls back to the static Nigerian state list when the
 * jurisdictions table has not been seeded.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('countryCode')?.toUpperCase() ?? null;

    const countries = await prisma.country.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { code: true, name: true, currency: true, locale: true, timezone: true },
    });

    const comingSoon = await prisma.country.findMany({
      where: { active: false },
      orderBy: { name: 'asc' },
      select: { code: true, name: true },
    });

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

    const jurisdictions = await prisma.jurisdiction.findMany({
      where: { countryId: countryCode, active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, level: true },
    });

    // Fall back to the static list when the table is empty for this country.
    const resolved =
      jurisdictions.length > 0
        ? jurisdictions
        : countryCode === 'NG'
          ? NIGERIAN_STATES.map((s) => ({
              id: `jur_${s.code.toLowerCase()}`,
              name: s.name,
              code: s.code,
              level: 'state',
            }))
          : [];

    return NextResponse.json({
      success: true,
      data: { countries, comingSoon, jurisdictions: resolved },
    });
  } catch (error) {
    console.error('Onboarding location options error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

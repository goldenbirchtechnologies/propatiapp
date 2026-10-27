import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingLocationSchema } from '@/lib/validators';
import { validateLocation } from '@/lib/locations/validate';
import { ensureOnboardingRow, markStepDone } from '@/lib/onboarding/dossier';

/**
 * POST /api/onboarding/location
 * Captures the user's country, state jurisdiction and city.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingLocationSchema.parse(body);

    const validation = await validateLocation(parsed);
    if (!validation.ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid location', details: validation.errors },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        countryId: validation.countryCode,
        jurisdictionId: validation.jurisdictionId,
        city: parsed.city.trim(),
        addressLine1: parsed.addressLine1?.trim() || null,
        addressLine2: parsed.addressLine2?.trim() || null,
        onboardingStatus: 'in_progress',
      },
      select: {
        id: true,
        countryId: true,
        jurisdictionId: true,
        city: true,
        addressLine1: true,
        addressLine2: true,
      },
    });

    await ensureOnboardingRow(user.id, user.role, 'contact');
    await markStepDone(user.id, user.role, 'location', 'contact');

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        jurisdictionName: validation.jurisdictionName,
        jurisdictionCode: validation.jurisdictionCode,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding location error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

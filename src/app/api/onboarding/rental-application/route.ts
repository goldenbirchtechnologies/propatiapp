import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingRentalApplicationSchema } from '@/lib/validators';
import { upsertDossier } from '@/lib/onboarding/dossier';
import { serializeBigInt } from '@/lib/serializers';

/**
 * GET /api/onboarding/rental-application
 * Returns the tenant's rental application dossier.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const dossier = await prisma.rentalApplicationDossier.findUnique({
      where: { userId: user.id },
    });

    if (!dossier) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt(dossier),
    });
  } catch (error) {
    console.error('Onboarding rental application GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/onboarding/rental-application
 * Updates the address and preferences section of the dossier.
 */
export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingRentalApplicationSchema.parse(body);

    const dossier = await upsertDossier(user.id, {
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2 ?? null,
      city: parsed.city,
      preferredListingType: parsed.preferredListingType ?? undefined,
      monthlyBudget:
        parsed.monthlyBudget != null ? BigInt(Math.round(parsed.monthlyBudget)) : null,
    });

    return NextResponse.json({ success: true, data: serializeBigInt(dossier) });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding rental application PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

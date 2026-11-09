import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { onboardingIdentitySchema } from '@/lib/validators';
import { verifyIdentityWithDojah } from '@/lib/identity-verification';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

export const runtime = 'nodejs';

/**
 * POST /api/onboarding/identity
 *
 * Verifies the user's NIN or BVN through Dojah, records it as the verified
 * identity the money rails read from, and marks the onboarding step complete.
 *
 * The lookup, name match and Paystack sync live in `verifyIdentityWithDojah`,
 * which the standalone verification route calls too — this route only adds the
 * onboarding step transition and maps failures onto onboarding vocabulary.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingIdentitySchema.parse(body);

    const result = await verifyIdentityWithDojah(
      { id: user.id, role: user.role, fullName: user.fullName },
      { idType: parsed.idType, idNumber: parsed.number }
    );

    if (!result.ok) {
      if (result.error === 'NOT_FOUND' || result.error === 'NAME_MISMATCH') {
        return NextResponse.json(
          { success: false, error: 'NOT_VERIFIED', message: result.message },
          { status: 400 }
        );
      }
      if (result.error === 'DOJAH_ERROR') {
        return NextResponse.json(
          {
            success: false,
            error: 'PROVIDER_REJECTED',
            message: result.message,
            providerStatus: result.providerStatus ?? null,
          },
          { status: 422 }
        );
      }
      if (result.error === 'IDENTITY_ALREADY_LINKED') {
        return NextResponse.json(
          { success: false, error: 'ID_IN_USE', message: result.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: 'VERIFICATION_UNAVAILABLE',
          message: result.message,
        },
        { status: 503 }
      );
    }

    const nextStep = await advanceOnboarding(user.id, user.role, 'identity');

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        idType: result.identity.type,
        idNumberMasked: result.idNumberMasked,
        fullName:
          [result.identity.firstName, result.identity.lastName].filter(Boolean).join(' ') ||
          user.fullName,
        nextStep,
        // Surfaced so the step can tell the user their payout readiness follows
        // from the identity that was just proven.
        paystack: result.paystack,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding identity error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

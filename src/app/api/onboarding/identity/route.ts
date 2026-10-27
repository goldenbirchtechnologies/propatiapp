import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingIdentitySchema } from '@/lib/validators';
import { encryptSensitiveValue, hashSensitiveValue } from '@/lib/encryption';
import { resolveCountryModule } from '@/lib/countries/resolver';
import { markStepDone } from '@/lib/onboarding/dossier';

/**
 * POST /api/onboarding/identity
 * Verifies a user-level identity document (NIN, BVN, ...).
 *
 * This writes the user's own identity fields rather than creating a
 * Verification record: that model is scoped to properties and its identity
 * route is tied to listing verification tiers.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingIdentitySchema.parse(body);

    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { countryId: true, fullName: true },
    });
    if (!account) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const countryModule = resolveCountryModule(account.countryId);
    if (!countryModule) {
      return NextResponse.json(
        {
          success: false,
          error: 'COUNTRY_NOT_CONFIGURED',
          message: 'Complete your location before verifying your identity.',
        },
        { status: 400 }
      );
    }

    const supportedTypes = countryModule.verification.getSupportedIdTypes();
    if (!supportedTypes.includes(parsed.idType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNSUPPORTED_ID_TYPE',
          message: `We cannot verify a ${parsed.idType.replace('_', ' ')} for your country.`,
        },
        { status: 400 }
      );
    }

    const [firstName, ...lastNameParts] = account.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    let result: Awaited<ReturnType<typeof countryModule.verification.verifyIdentity>>;
    try {
      result = await countryModule.verification.verifyIdentity(
        parsed.idType as 'nin' | 'bvn' | 'passport' | 'drivers_licence' | 'voters_card',
        parsed.number,
        firstName,
        lastName
      );
    } catch (verifyError) {
      console.error('Onboarding identity provider error:', verifyError);
      await prisma.userKyc.upsert({
        where: { userId: user.id },
        create: { userId: user.id, role: user.role, status: 'requires_review' },
        update: { status: 'requires_review', rejectionReason: 'Verification provider unavailable' },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'VERIFICATION_UNAVAILABLE',
          message: 'Identity verification is temporarily unavailable. Please try again shortly.',
        },
        { status: 503 }
      );
    }

    if (!result.verified) {
      await prisma.userKyc.upsert({
        where: { userId: user.id },
        create: { userId: user.id, role: user.role, status: 'rejected' },
        update: { status: 'rejected', rejectionReason: 'Provider returned unverified' },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_VERIFIED',
          message: 'We could not verify those details. Check the number and try again.',
        },
        { status: 400 }
      );
    }

    const encrypted = encryptSensitiveValue(parsed.number);
    const hashed = hashSensitiveValue(parsed.number);

    // A NIN reuses the existing unique ninHash constraint so one NIN cannot
    // be registered to multiple accounts.
    const conflict = await prisma.user.findFirst({
      where: {
        id: { not: user.id },
        OR: [{ idNumberHash: hashed }, ...(parsed.idType === 'nin' ? [{ ninHash: hashed }] : [])],
      },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID_IN_USE',
          message: 'That ID number is already registered to another account.',
        },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          idType: parsed.idType,
          idNumberEnc: encrypted,
          idNumberHash: hashed,
          idVerified: true,
          ...(parsed.idType === 'nin' ? { ninEncrypted: encrypted, ninHash: hashed, ninVerified: true } : {}),
          ...(parsed.idType === 'bvn' ? { bvnEncrypted: encrypted } : {}),
          onboardingStatus: 'in_progress',
        },
      }),
      prisma.userKyc.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          role: user.role,
          status: 'approved',
          verifiedAt: new Date(),
          level: 2,
        },
        update: {
          status: 'approved',
          verifiedAt: new Date(),
          rejectionReason: null,
          level: 2,
        },
      }),
    ]);

    await markStepDone(user.id, user.role, 'identity', 'employment');

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        idType: parsed.idType,
        fullName: result.fullName ?? account.fullName,
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

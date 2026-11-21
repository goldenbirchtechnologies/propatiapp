import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingLandlordProfileSchema } from '@/lib/validators';
import { advanceOnboarding } from '@/lib/onboarding/profiles';
import { syncLegalSubject } from '@/lib/legal-subject';

/**
 * POST /api/onboarding/landlord/profile
 * Captures the landlord's legal ownership entity and contact credentials.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingLandlordProfileSchema.parse(body);

    const data = {
      legalEntityType: parsed.legalEntityType,
      legalName: parsed.legalName,
      jointOwnerNames: parsed.jointOwnerNames ?? null,
      jointOwnerEmails: parsed.jointOwnerEmails ?? null,
      companyName: parsed.companyName ?? null,
      companyRegistrationNumber: parsed.companyRegistrationNumber ?? null,
      primaryPhone: parsed.primaryPhone,
      contactEmail: parsed.contactEmail,
      mailingAddress: parsed.mailingAddress,
      taxIdType: parsed.taxIdType,
      taxNumber: parsed.taxNumber,
    };

    const profile = await prisma.landlordProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const jointOwners = (parsed.jointOwnerNames || '')
      .split(';')
      .map((name) => name.trim())
      .filter(Boolean);
    const jointOwnerEmails = (parsed.jointOwnerEmails || '').split(';').map((email) => email.trim()).filter(Boolean);
    await syncLegalSubject({
      primaryUserId: user.id,
      type: parsed.legalEntityType,
      name: parsed.companyName || parsed.legalName,
      registrationNumber: parsed.legalEntityType === 'company' ? parsed.companyRegistrationNumber : null,
      members: [
        { fullName: parsed.legalName, userId: user.id, role: parsed.legalEntityType === 'company' ? 'representative' : 'owner' },
        ...jointOwners.map((fullName, index) => ({ fullName, email: jointOwnerEmails[index] || null, role: 'owner' })),
      ],
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'landlordProfile');

    return NextResponse.json({
      success: true,
      data: { id: profile.id, nextStep },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding landlord profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

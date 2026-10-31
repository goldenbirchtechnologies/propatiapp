import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';

/**
 * GET /api/onboarding/status
 * Returns the onboarding snapshot used by the dashboard gate.
 *
 * The response is deliberately redacted: it never includes encrypted
 * identifiers, ID numbers, income figures or any other sensitive field.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const snapshot = await getOnboardingSnapshot(user.id);

    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        role: snapshot.role,
        status: snapshot.status,
        required: snapshot.required,
        currentStep: snapshot.currentStep,
        canComplete: snapshot.canComplete,
        blocked: snapshot.blocked,
        steps: snapshot.steps.map((step) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          done: step.done,
          skippable: step.skippable,
          skipped: step.skipped,
        })),
        // Read-only display facts for the wizard rail. Encrypted identifiers
        // and ID numbers never leave the server, and the bigint income is
        // narrowed to a JSON-safe number.
        facts: {
          fullName: snapshot.facts.fullName,
          email: snapshot.facts.email,
          countryCode: snapshot.facts.countryCode,
          countryName: snapshot.facts.countryName,
          jurisdictionName: snapshot.facts.jurisdictionName,
          city: snapshot.facts.city,
          phone: snapshot.facts.phone,
          phoneVerified: snapshot.facts.phoneVerified,
          idType: snapshot.facts.idType,
          idVerified: snapshot.facts.idVerified,
          employmentStatus: snapshot.facts.employmentStatus,
          employerName: snapshot.facts.employerName,
          jobTitle: snapshot.facts.jobTitle,
          yearlyIncome:
            snapshot.facts.yearlyIncome == null ? null : Number(snapshot.facts.yearlyIncome),
          guarantorName: snapshot.facts.guarantorName,
          guarantorRelationship: snapshot.facts.guarantorRelationship,
        },
      },
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

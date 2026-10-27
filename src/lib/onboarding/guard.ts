import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getOnboardingSnapshot } from './status';

export interface OnboardingGuardUser {
  id: string;
  role: UserRole;
}

/**
 * Server-side gate for write endpoints. The onboarding overlay is a client
 * experience; this is the enforcement behind it, so an incomplete account
 * cannot create listings or applications by calling the API directly.
 */
export async function assertOnboarded(
  user: OnboardingGuardUser
): Promise<NextResponse | null> {
  if (user.role === 'admin') return null;

  const snapshot = await getOnboardingSnapshot(user.id);
  if (!snapshot) return null;
  if (!snapshot.required || snapshot.status === 'completed') return null;

  return NextResponse.json(
    {
      error: 'ONBOARDING_REQUIRED',
      message: 'Complete your profile before continuing.',
      redirect: '/onboarding',
    },
    { status: 403 }
  );
}

/**
 * Marks an account as needing onboarding. Called when a user signs up.
 */
export async function markOnboardingRequired(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { onboardingRequired: true, onboardingStatus: 'not_started' },
  });
}

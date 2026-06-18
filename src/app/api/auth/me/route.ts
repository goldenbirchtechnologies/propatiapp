import { auth } from '@clerk/nextjs/server';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getCurrentUserWithProfile();

  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      ninVerified: user.ninVerified,
      phoneVerified: user.phoneVerified,
      idVerified: user.idVerified,
      profileCompleted: user.profileCompleted,
      agentTier: user.agentTier,
      agentApproved: user.agentApproved,
      agentBio: user.agentBio,
      agentAreas: user.agentAreas,
      isActive: user.isActive,
      isBanned: user.isBanned,
      organizations: user.orgMemberships.map((om) => ({
        id: om.organization.id,
        name: om.organization.name,
        role: om.role,
        status: om.status,
        planTier: om.organization.planTier,
      })),
    },
  });
}
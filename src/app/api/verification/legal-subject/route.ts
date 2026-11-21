import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/verification/legal-subject
 * Returns the signed-in user's legal ownership/operator subject and member
 * verification status. Invitation tokens and provider payloads never leave
 * the server.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'agent', 'estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;

  const subject = await prisma.legalSubject.findFirst({
    where: {
      OR: [
        { primaryUserId: authResult.user.id },
        { members: { some: { userId: authResult.user.id } } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      type: true,
      name: true,
      registrationNumber: true,
      status: true,
      members: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          ownershipPercent: true,
          status: true,
          verifiedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: subject });
}

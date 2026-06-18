import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        listing: true,
        landlord: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        agent: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, agentTier: true } },
        signatures: { select: { id: true, role: true, ipAddress: true, signedAt: true, consentText: true } },
        transactions: { select: { id: true, type: true, amount: true, status: true, createdAt: true } },
        rentSchedule: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check permissions
    const isParticipant =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      agreement.agentId === user.id ||
      user.role === 'ADMIN';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: agreement });
  } catch (error) {
    console.error('Agreement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
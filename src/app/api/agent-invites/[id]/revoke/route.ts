import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const invite = await prisma.agentInvite.findUnique({
      where: { id },
      include: { recipient: true },
    });

    if (!invite || invite.landlordId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN: Not the inviting landlord' }, { status: 403 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is not pending' }, { status: 400 });
    }

    const updated = await prisma.agentInvite.update({
      where: { id },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        recipient: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Agent invite revoke error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

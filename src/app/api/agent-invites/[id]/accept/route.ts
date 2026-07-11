import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['agent']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const invite = await prisma.agentInvite.findUnique({
      where: { id },
      include: { sender: true },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite not found or already processed' }, { status: 404 });
    }

    if (!invite.email || invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'FORBIDDEN: Invite email does not match your account' }, { status: 403 });
    }

    const updated = await prisma.agentInvite.update({
      where: { id },
      data: {
        status: 'accepted',
        agentId: user.id,
        acceptedAt: new Date(),
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        recipient: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Agent invite accept error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

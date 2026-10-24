import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, address: true, area: true, state: true } },
        tenant: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        raisedByUser: { select: { id: true, fullName: true } },
        assignedToUser: { select: { id: true, fullName: true, avatarUrl: true } },
        org: { select: { id: true, name: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isParticipant =
      ticket.tenantId === user.id ||
      ticket.raisedBy === user.id ||
      ticket.assignedTo === user.id ||
      user.role === 'admin' ||
      user.role === 'estate_manager' ||
      user.role === 'landlord';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('[GET /api/maintenance/[id]] failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

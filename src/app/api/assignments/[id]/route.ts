import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;
    const body = await request.json();

    const assignment = await prisma.agentAssignment.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true } },
        listing: { select: { id: true, agentId: true, ownerId: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';
    const isAssignedAgent = user.role === 'agent' && assignment.agent.id === user.id;
    const isListingAgent = user.role === 'agent' && assignment.listing.agentId === user.id;

    if (!isAdmin && !isAssignedAgent && !isListingAgent) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof body.permissions === 'string' || Array.isArray(body.permissions)) {
      updateData.permissions = Array.isArray(body.permissions) ? body.permissions : JSON.parse(body.permissions as string);
    }
    if (typeof body.scope === 'string') {
      updateData.scope = body.scope;
    }
    if (typeof body.status === 'string') {
      updateData.status = body.status;
    }

    const updated = await prisma.agentAssignment.update({
      where: { id },
      data: updateData,
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true } },
        invite: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/assignments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const assignment = await prisma.agentAssignment.findUnique({
      where: { id },
      include: {
        invite: { select: { landlordId: true } },
        listing: { select: { ownerId: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';
    const isLandlord = user.role === 'landlord' && assignment.invite.landlordId === user.id;
    const isOwner = user.role === 'landlord' && assignment.listing.ownerId === user.id;

    if (!isAdmin && !isLandlord && !isOwner) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    await prisma.agentAssignment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    console.error('DELETE /api/assignments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

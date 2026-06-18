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
      user.role === 'admin';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: agreement });
  } catch (error) {
    console.error('Agreement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['landlord', 'agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const body = await request.json();

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      select: {
        id: true,
        landlordId: true,
        agentId: true,
        status: true,
        listing: { select: { ownerId: true } },
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check permissions
    const canUpdate =
      user.role === 'admin' ||
      (user.role === 'landlord' && agreement.landlordId === user.id) ||
      (user.role === 'agent' && agreement.agentId === user.id);

    if (!canUpdate) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Only allow updates in draft status
    if (agreement.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only update agreements in draft status' },
        { status: 400 }
      );
    }

    // Update agreement
    const updatedAgreement = await prisma.agreement.update({
      where: { id },
      data: {
        ...body,
        // Prevent status changes through this endpoint
        status: undefined,
      },
      include: {
        listing: { select: { id: true, title: true, area: true, state: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updatedAgreement });
  } catch (error) {
    console.error('Agreement PATCH error:', error);
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

  const { id } = await params;

  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      select: {
        id: true,
        landlordId: true,
        status: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check permissions
    const canDelete = user.role === 'admin' || agreement.landlordId === user.id;

    if (!canDelete) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Only allow deletion before fully signed
    if (agreement.status === 'fully_signed' || agreement.status === 'active') {
      return NextResponse.json(
        { error: 'Cannot delete fully signed or active agreements' },
        { status: 400 }
      );
    }

    // Delete agreement (cascades to signatures and rent schedule)
    await prisma.agreement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Agreement deleted successfully' });
  } catch (error) {
    console.error('Agreement DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
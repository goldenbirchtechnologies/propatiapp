import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['manager', 'accountant', 'maintenance', 'owner_view']).optional(),
  status: z.enum(['active', 'removed']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id, memberId } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can update members
    const isOwner = org.ownerId === user.id;
    const isManager = membership.role === 'manager';

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const targetMember = await prisma.orgMember.findUnique({
      where: { id: memberId },
      select: { id: true, orgId: true, userId: true, role: true, status: true, joinedAt: true },
    });

    if (!targetMember || targetMember.orgId !== id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot modify owner's membership
    if (targetMember.userId === org.ownerId) {
      return NextResponse.json({ error: 'Cannot modify owner membership' }, { status: 400 });
    }

    // Managers cannot modify other managers (only owner can)
    if (!isOwner && targetMember.role === 'manager') {
      return NextResponse.json({ error: 'Only owner can modify manager roles' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateMemberSchema.parse(body);

    // Managers cannot promote to manager (only owner can)
    if (!isOwner && validated.role === 'manager') {
      return NextResponse.json({ error: 'Only owner can assign manager role' }, { status: 403 });
    }

    const updated = await prisma.orgMember.update({
      where: { id: memberId },
      data: {
        ...(validated.role && { role: validated.role }),
        ...(validated.status && { status: validated.status }),
        ...(validated.status === 'active' && !targetMember.joinedAt && { joinedAt: new Date() }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Org Member PATCH error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id, memberId } = await params;

  try {
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can remove members
    const isOwner = org.ownerId === user.id;
    const isManager = membership.role === 'manager';

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    const targetMember = await prisma.orgMember.findUnique({
      where: { id: memberId },
      select: { id: true, orgId: true, userId: true, role: true, status: true },
    });

    if (!targetMember || targetMember.orgId !== id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove owner
    if (targetMember.userId === org.ownerId) {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 });
    }

    // Managers cannot remove other managers (only owner can)
    if (!isOwner && targetMember.role === 'manager') {
      return NextResponse.json({ error: 'Only owner can remove managers' }, { status: 403 });
    }

    // Soft delete - set status to removed
    await prisma.orgMember.update({
      where: { id: memberId },
      data: { status: 'removed' },
    });

    return NextResponse.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Org Member DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
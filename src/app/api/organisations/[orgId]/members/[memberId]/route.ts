import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';

export async function GET(_request: NextRequest, { params }: { params: { orgId: string; memberId: string } }) {
  const authResult = await withAuth(_request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const member = await prisma.orgMember.findUnique({
      where: { id: params.memberId },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true, avatarUrl: true } },
        org: { select: { id: true, name: true } },
      },
    });

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    if (member.orgId !== params.orgId) {
      return NextResponse.json({ error: 'Member does not belong to this organisation' }, { status: 400 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { orgId: string; memberId: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const member = await prisma.orgMember.findUnique({
      where: { id: params.memberId },
      select: { id: true, orgId: true },
    });

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    if (member.orgId !== params.orgId) {
      return NextResponse.json({ error: 'Member does not belong to this organisation' }, { status: 400 });
    }

    const body = await request.json();
    const role = typeof body.role === 'string' ? body.role : undefined;

    const updated = await prisma.orgMember.update({
      where: { id: params.memberId },
      data: { role: role || undefined },
      include: { user: { select: { id: true, fullName: true, email: true, role: true, avatarUrl: true } } },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { orgId: string; memberId: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const member = await prisma.orgMember.findUnique({
      where: { id: params.memberId },
      select: { id: true, orgId: true },
    });

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    if (member.orgId !== params.orgId) {
      return NextResponse.json({ error: 'Member does not belong to this organisation' }, { status: 400 });
    }

    await prisma.orgMember.delete({ where: { id: params.memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

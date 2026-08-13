import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const call = await prisma.screeningCall.findUnique({
      where: { id: id },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    if (!call) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.role !== 'admin' && call.landlordId !== user.id && call.tenantId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: call });
  } catch (error) {
    console.error('screening-calls/[id] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.screeningCall.findUnique({
      where: { id: id },
      select: { id: true, landlordId: true, tenantId: true, status: true },
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.role !== 'admin' && existing.landlordId !== user.id && existing.tenantId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['status', 'notes', 'scheduledAt'] as const;
    const patch: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === 'scheduledAt') {
          patch[key] = new Date(body[key]);
        } else {
          patch[key] = body[key];
        }
      }
    }

    if (patch.status) {
      const valid = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;
      if (!valid.includes(patch.status as (typeof valid)[number])) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
    }

    const updated = await prisma.screeningCall.update({
      where: { id: id },
      data: patch,
      include: {
        listing: { select: { id: true, title: true, address: true } },
        landlord: { select: { id: true, fullName: true } },
        tenant: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('screening-calls/[id] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.screeningCall.findUnique({ where: { id: id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.screeningCall.delete({ where: { id: id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error('screening-calls/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

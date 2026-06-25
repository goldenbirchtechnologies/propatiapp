import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { updateScreeningSchema } from '@/lib/validators';
import { ScreeningCallStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { user } = authResult;
    const where: any = { id: params.id };

    if (user.role === 'landlord') {
      where.landlordId = user.id;
    } else if (user.role === 'tenant') {
      where.tenantId = user.id;
    }

    const call = await prisma.screeningCall.findFirst({
      where,
      include: {
        listing: { select: { id: true, title: true, address: true, price: true } },
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    if (!call) {
      return NextResponse.json({ error: 'Screening call not found' }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error) {
    console.error('Get screening-call error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['tenant', 'landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validated = updateScreeningSchema.parse(body);

    const existing = await prisma.screeningCall.findUnique({
      where: { id: params.id },
      select: { id: true, landlordId: true, tenantId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Screening call not found' }, { status: 404 });
    }

    const isOwner =
      existing.landlordId === authResult.user.id || existing.tenantId === authResult.user.id;
    if (!isOwner && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};
    if (validated.status) updateData.status = validated.status as ScreeningCallStatus;
    if (validated.notes !== undefined) updateData.notes = validated.notes;

    const call = await prisma.screeningCall.update({
      where: { id: params.id },
      data: updateData,
      include: {
        listing: { select: { id: true, title: true } },
        tenant: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json(call);
  } catch (error) {
    console.error('Patch screening-call error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request', details: (error as any).issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const existing = await prisma.screeningCall.findUnique({
      where: { id: params.id },
      select: { id: true, landlordId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Screening call not found' }, { status: 404 });
    }

    if (existing.landlordId !== authResult.user.id && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.screeningCall.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete screening-call error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        listing: { select: { id: true, title: true, address: true, area: true, state: true } },
        agreement: { select: { id: true, type: true, status: true, startDate: true, endDate: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.landlordId !== user.id && invoice.tenantId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;
    const body = await request.json();

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.landlordId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...body,
        status: body.status as string,
        type: body.type as string,
        paidAt: body.status === 'paid' ? new Date() : invoice.paidAt,
      },
      include: {
        tenant: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true, address: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Invoice PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { tenantShortletStatusSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = z.object({ status: tenantShortletStatusSchema, notes: z.string().max(500).optional() }).parse(body);

    const existing = await prisma.tenantShortlet.findUnique({
      where: { id: id },
      select: { id: true, landlordId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Shortlet request not found' }, { status: 404 });
    }
    if (existing.landlordId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: Record<string, unknown> = { status: validated.status, notes: validated.notes || null };

    if (validated.status === 'approved') data.approvedAt = new Date();
    if (validated.status === 'rejected') data.rejectedAt = new Date();
    if (validated.status === 'revoked') data.revokedAt = new Date();

    const updated = await prisma.tenantShortlet.update({
      where: { id: id },
      data,
      include: { listing: { select: { title: true, address: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        listingId: updated.listingId,
        listingTitle: updated.listing?.title || 'Property',
        tenantName: '',
        status: updated.status,
        notes: updated.notes || '',
      },
    });
  } catch (error) {
    console.error('PATCH /api/tenant-shortlets/[id] error', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.tenantShortlet.findUnique({
      where: { id: id },
      select: { id: true, landlordId: true },
    });

    if (!existing) return NextResponse.json({ error: 'Shortlet request not found' }, { status: 404 });
    if (existing.landlordId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.tenantShortlet.delete({ where: { id: id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tenant-shortlets/[id] error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

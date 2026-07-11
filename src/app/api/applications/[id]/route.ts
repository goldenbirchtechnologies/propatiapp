import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            address: true,
            area: true,
            state: true,
            price: true,
            pricePeriod: true,
            listingType: true,
            status: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            employmentStatus: true,
            employerName: true,
            jobTitle: true,
            yearlyIncome: true,
            profileBio: true,
            idVerified: true,
            ninVerified: true,
          },
        },
        landlord: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.role !== 'admin' && application.landlordId !== user.id && application.tenantId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const serialized = {
      ...application,
      listing: {
        ...application.listing,
        price: application.listing.price.toString(),
      },
      tenant: {
        ...application.tenant,
        yearlyIncome: application.tenant.yearlyIncome ? application.tenant.yearlyIncome.toString() : null,
      },
    };

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('applications/[id] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.application.findUnique({
      where: { id: params.id },
      select: { id: true, landlordId: true, tenantId: true, status: true },
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.role !== 'admin' && existing.landlordId !== user.id && existing.tenantId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['status', 'landlordNotes', 'message'];
    const patch: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) patch[key] = body[key];
    }

    if (patch.status && !['pending', 'under_review', 'accepted', 'rejected', 'withdrawn'].includes(patch.status as string)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...patch,
        reviewedAt: patch.status && ['accepted', 'rejected'].includes(patch.status as string) ? new Date() : undefined,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            pricePeriod: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            employmentStatus: true,
            employerName: true,
            jobTitle: true,
            yearlyIncome: true,
            profileBio: true,
          },
        },
        landlord: { select: { id: true, fullName: true, email: true } },
      },
    });

    const serialized = {
      ...updated,
      listing: { ...updated.listing, price: updated.listing.price.toString() },
      tenant: {
        ...updated.tenant,
        yearlyIncome: updated.tenant.yearlyIncome ? updated.tenant.yearlyIncome.toString() : null,
      },
    };

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('applications/[id] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

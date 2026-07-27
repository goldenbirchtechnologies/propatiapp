import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

function serialize(application: any) {
  return {
    ...application,
    listing: { ...application.listing, price: application.listing.price.toString() },
    tenant: {
      ...application.tenant,
      yearlyIncome: application.tenant.yearlyIncome ? application.tenant.yearlyIncome.toString() : null,
      createdAt: application.tenant.createdAt ? new Date(application.tenant.createdAt).toISOString() : null,
    },
    screeningStatus: application.screeningStatus || {},
    guarantorData: application.guarantorData || {},
    applicantDocuments: application.applicantDocuments || [],
    createdAt: application.createdAt ? new Date(application.createdAt).toISOString() : null,
    reviewedAt: application.reviewedAt ? new Date(application.reviewedAt).toISOString() : null,
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        listing: { select: { id: true, title: true, description: true, address: true, area: true, state: true, price: true, pricePeriod: true, listingType: true, status: true, amenities: true, propertyType: true, images: { where: { isCover: true }, take: 5, select: { url: true } } } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, employmentStatus: true, employerName: true, jobTitle: true, yearlyIncome: true, profileBio: true, idVerified: true, ninVerified: true, createdAt: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if ((application as any).landlordId !== user.id && (application as any).tenantId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: serialize(application) });
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
    const existing: any = await prisma.application.findUnique({
      where: { id: params.id },
      select: { id: true, landlordId: true, tenantId: true, status: true, listingId: true },
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.role !== 'admin' && existing.landlordId !== user.id && existing.tenantId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body: Record<string, unknown> = await request.json();

    const allowedFields = ['status', 'landlordNotes', 'message', 'rejectionReason', 'requestedInfoAt'];
    const patch: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (body.stage) patch.stage = body.stage;
    if (body.screeningStatus) patch.screeningStatus = body.screeningStatus;
    if (body.guarantorData) patch.guarantorData = JSON.stringify(body.guarantorData);

    if (patch.status && !['pending', 'under_review', 'accepted', 'rejected', 'withdrawn'].includes(patch.status as string)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (body.action === 'approve' && existing.landlordId === user.id) {
      const listing = await prisma.listing.findUnique({ where: { id: existing.listingId } });
      if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

      const start = new Date();
      start.setMonth(start.getMonth() + 1);

      const agreement = await prisma.agreement.create({
        data: {
          listingId: existing.listingId,
          landlordId: existing.landlordId,
          tenantId: existing.tenantId,
          type: (listing as any).listingType === 'sale' ? 'sale' : 'rental',
          status: 'draft',
          startDate: start,
          endDate: new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000),
          rentAmount: (listing as any).price.toString(),
          rentPeriod: 'monthly',
          cautionDeposit: (listing as any).cautionDeposit?.toString(),
          serviceCharge: (listing as any).serviceCharge?.toString(),
        },
      });

      const updateOptions: any = {};
      updateOptions.where = { id: params.id };
      updateOptions.data = {
        ...patch,
        status: 'accepted',
        stage: 'approved',
        reviewedAt: new Date(),
      };
      updateOptions.include = {
        listing: { select: { id: true, title: true, address: true, area: true, state: true, price: true, pricePeriod: true, images: { where: { isCover: true }, take: 1, select: { url: true } } } },
        tenant: { select: { id: true, fullName: true, email: true, avatarUrl: true, employmentStatus: true, employerName: true, jobTitle: true, yearlyIncome: true, profileBio: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
      };
      const updated = await prisma.application.update(updateOptions);
      return NextResponse.json({ success: true, data: { ...serialize(updated as any), agreement } });
    }

    const updateOptions: any = {};
    updateOptions.where = { id: params.id };
    updateOptions.data = {
      ...patch,
      reviewedAt: patch.status && ['accepted', 'rejected'].includes(patch.status as string) ? new Date() : undefined,
    };
    updateOptions.include = {
      listing: { select: { id: true, title: true, address: true, area: true, state: true, price: true, pricePeriod: true, images: { where: { isCover: true }, take: 1, select: { url: true } } } },
      tenant: { select: { id: true, fullName: true, email: true, avatarUrl: true, employmentStatus: true, employerName: true, jobTitle: true, yearlyIncome: true, profileBio: true, idVerified: true, ninVerified: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
    };

    const updated = await prisma.application.update(updateOptions);
    return NextResponse.json({ success: true, data: serialize(updated as any) });
  } catch (error) {
    console.error('applications/[id] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

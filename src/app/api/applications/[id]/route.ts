import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { updateApplicationSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            price: true,
            pricePeriod: true,
            listingType: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
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
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const canAccess =
      user.role === 'admin' ||
      application.tenantId === user.id ||
      application.landlordId === user.id;

    if (!canAccess) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Application GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, landlordNotes } = updateApplicationSchema.parse(body);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true } },
        tenant: { select: { id: true, fullName: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const isTenantWithdrawing = user.id === application.tenantId && status === 'withdrawn';
    const isLandlordReviewing = user.id === application.landlordId || user.role === 'admin';

    if (!isTenantWithdrawing && !isLandlordReviewing) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (isTenantWithdrawing && !isLandlordReviewing) {
      if (!['pending', 'under_review'].includes(application.status)) {
        return NextResponse.json({ error: 'Cannot withdraw application in current status' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = { status };

    if (isLandlordReviewing && status !== 'withdrawn') {
      updateData.reviewedAt = new Date();
      if (landlordNotes !== undefined) updateData.landlordNotes = landlordNotes;
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        listing: { select: { id: true, title: true, area: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        landlord: { select: { id: true, fullName: true } },
      },
    });

    if (status === 'accepted' && application.listing && application.tenant) {
      const existingConversation = await prisma.conversation.findUnique({
        where: {
          landlordId_tenantId_listingId: {
            landlordId: application.landlordId,
            tenantId: application.tenantId,
            listingId: application.listingId,
          },
        },
      });

      if (!existingConversation) {
        await prisma.conversation.create({
          data: {
            listingId: application.listingId,
            landlordId: application.landlordId,
            tenantId: application.tenantId,
            subject: `Application accepted: ${application.listing.title}`,
            lastMessageAt: new Date(),
            status: 'active',
          },
        });
      } else if (existingConversation.status !== 'active') {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { status: 'active' },
        });
      }

      await prisma.notification.create({
        data: {
          userId: application.tenantId,
          type: 'screening',
          title: 'Application Accepted',
          body: `Your application for ${application.listing.title} has been accepted. A conversation has been created.`,
          data: { applicationId: id, listingId: application.listingId },
        },
      });
    } else if (status === 'rejected') {
      await prisma.notification.create({
        data: {
          userId: application.tenantId,
          type: 'screening',
          title: 'Application Update',
          body: `Your application for ${application.listing?.title} was not successful.`,
          data: { applicationId: id, listingId: application.listingId },
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Application PATCH error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

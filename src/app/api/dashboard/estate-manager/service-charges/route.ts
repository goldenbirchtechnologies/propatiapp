import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    if (user.role === 'estate_manager') {
      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
        select: { ownerId: true },
      });
      if (!org || org.ownerId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const where: Record<string, unknown> = { organizationId: orgId };
    if (status) where.status = status;

    const serviceCharges = await prisma.serviceCharge.findMany({
      where,
      select: {
        id: true,
        listingId: true,
        organizationId: true,
        estateManagerId: true,
        period: true,
        amount: true,
        currency: true,
        dueDate: true,
        status: true,
        description: true,
        paidAt: true,
        transactionId: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            status: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            owner: { select: { id: true, fullName: true } },
          },
        },
        estateManager: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        transaction: {
          select: {
            id: true,
            reference: true,
            type: true,
            status: true,
            amount: true,
            currency: true,
            paidAt: true,
          },
        },
      },
      orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: serviceCharges });
  } catch (error) {
    console.error('Service charges GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

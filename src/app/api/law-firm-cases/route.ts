import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { createLawFirmCaseSchema, updateLawFirmCaseSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const where: Record<string, unknown> = {};
    if (user.role === 'admin') {
      // admin sees all
    } else if (user.role === 'landlord') {
      where.dispute = { listing: { ownerId: user.id } };
    } else {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const cases = await prisma.lawFirmCase.findMany({
      where,
      orderBy: { assignedAt: 'desc' },
      include: {
        firm: true,
        dispute: { select: { id: true, type: true, status: true, listingId: true } },
      },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can assign law firm cases' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createLawFirmCaseSchema.parse(body);

    const dispute = await prisma.dispute.findUnique({
      where: { id: validated.disputeId },
      select: { id: true, listingId: true },
    });

    if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });

    const existing = await prisma.lawFirmCase.findUnique({
      where: { disputeId: validated.disputeId },
    });

    if (existing) {
      return NextResponse.json({ error: 'Dispute already has an assigned law firm case' }, { status: 409 });
    }

    const case_ = await prisma.lawFirmCase.create({
      data: {
        disputeId: validated.disputeId,
        firmId: validated.firmId,
        fee: validated.fee,
        feeCurrency: validated.feeCurrency,
      },
      include: {
        firm: true,
        dispute: true,
      },
    });

    return NextResponse.json({ case: case_ }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { updateLawFirmCaseSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const case_ = await prisma.lawFirmCase.findUnique({
      where: { id: params.id },
      include: {
        firm: true,
        dispute: { select: { id: true, type: true, status: true, listingId: true } },
      },
    });

    if (!case_) return NextResponse.json({ error: 'Law firm case not found' }, { status: 404 });

    return NextResponse.json({ case: case_ });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update law firm cases' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateLawFirmCaseSchema.parse(body);

    const case_ = await prisma.lawFirmCase.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        fee: validated.fee,
        feeCurrency: validated.feeCurrency,
        resolvedAt: validated.resolvedAt ? new Date(validated.resolvedAt) : undefined,
      },
      include: {
        firm: true,
        dispute: true,
      },
    });

    return NextResponse.json({ case: case_ });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete law firm cases' }, { status: 403 });
    }

    await prisma.lawFirmCase.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { updateLawFirmSchema } from '@/lib/validators.commercial';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const firm = await prisma.lawFirm.findUnique({
      where: { id: params.id },
    });

    if (!firm) return NextResponse.json({ error: 'Law firm not found' }, { status: 404 });

    return NextResponse.json({ firm });
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
      return NextResponse.json({ error: 'Only admins can update law firms' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateLawFirmSchema.parse(body);

    const firm = await prisma.lawFirm.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        address: validated.address,
        jurisdiction: validated.jurisdiction,
        verified: validated.verified,
        rating: validated.rating,
        reviewCount: validated.reviewCount,
      },
    });

    return NextResponse.json({ firm });
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
      return NextResponse.json({ error: 'Only admins can delete law firms' }, { status: 403 });
    }

    await prisma.lawFirm.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

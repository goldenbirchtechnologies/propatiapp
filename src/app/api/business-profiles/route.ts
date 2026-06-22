import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    if (user.role !== 'landlord' && user.role !== 'estate_manager') {
      return NextResponse.json({ error: 'Only landlords and estate managers can view business profiles' }, { status: 403 });
    }

    const profiles = await prisma.businessProfile.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const body = await request.json();

    const cacNumber = typeof body.cacNumber === 'string' ? body.cacNumber.trim() : '';
    const rcNumber = typeof body.rcNumber === 'string' ? body.rcNumber.trim() : undefined;
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : undefined;

    if (!cacNumber) return NextResponse.json({ error: 'CAC number is required' }, { status: 400 });
    if (!rcNumber) return NextResponse.json({ error: 'RC number is required' }, { status: 400 });
    if (!companyName) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });

    const profile = await prisma.businessProfile.create({
      data: {
        userId: user.id,
        cacNumber,
        rcNumber,
        companyName,
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

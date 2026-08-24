import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/api-auth';

async function getHandler(request: NextRequest) {
  const cases = await prisma.lawFirmCase.findMany({
    include: { firm: true, dispute: { select: { id: true, type: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ cases });
}

async function postHandler(request: NextRequest) {
  const body = await request.json();
  const { disputeId, firmId, status } = body;

  const case_ = await prisma.lawFirmCase.create({
    data: {
      dispute: { connect: { id: disputeId } },
      firm: { connect: { id: firmId } },
      status: status || 'assigned',
      feeModel: { type: 'fixed', amount: 0 },
    },
    include: { firm: true, dispute: { select: { id: true, type: true, status: true } } },
  });
  return NextResponse.json({ case: case_ }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  return getHandler(request);
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  return postHandler(request);
}

export const dynamic = 'force-dynamic';

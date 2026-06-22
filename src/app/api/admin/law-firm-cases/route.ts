import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/api-auth';

export default async function handler(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();

  if (request.method === 'GET') {
    const cases = await prisma.lawFirmCase.findMany({
      include: { firm: true, dispute: { select: { id: true, type: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ cases });
  }

  if (request.method === 'POST') {
    const { disputeId, firmId, status } = body;
    const case_ = await prisma.lawFirmCase.create({
      data: { disputeId, firmId, status: status || 'assigned' },
      include: { firm: true, dispute: { select: { id: true, type: true, status: true } } },
    });
    return NextResponse.json({ case: case_ }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

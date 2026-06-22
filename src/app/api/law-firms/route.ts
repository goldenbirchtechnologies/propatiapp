import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/api-auth';

export async function GET(_request: NextRequest) {
  const authResult = await withAuth(_request);
  if (authResult instanceof NextResponse) return authResult;

  const firms = await prisma.lawFirm.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, verified: true },
  });

  return NextResponse.json({ firms });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const firm = await prisma.lawFirm.create({
    data: {
      name: body.name,
      cacNumber: body.cacNumber,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      jurisdiction: Array.isArray(body.jurisdiction) ? body.jurisdiction : [],
    },
  });

  return NextResponse.json({ firm }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/api-auth';

export default async function handler(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (request.method === 'GET') {
    const firms = await prisma.lawFirm.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, verified: true, cacNumber: true },
    });
    return NextResponse.json({ firms });
  }

  if (request.method === 'POST') {
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

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

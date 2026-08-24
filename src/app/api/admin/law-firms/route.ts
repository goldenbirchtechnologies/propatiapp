import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/api-auth';

async function getHandler() {
  const firms = await prisma.lawFirm.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, verified: true, cacNumber: true },
  });
  return NextResponse.json({ firms });
}

async function postHandler(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  return getHandler();
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  return postHandler(request);
}

export const dynamic = 'force-dynamic';

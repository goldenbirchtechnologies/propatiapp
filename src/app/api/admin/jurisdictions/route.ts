import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('countryId');

  const jurisdictions = await prisma.jurisdiction.findMany({
    where: countryId ? { countryId } : {},
    include: { country: true },
    orderBy: [{ countryId: 'asc' }, { name: 'asc' }]
  });

  return NextResponse.json({ jurisdictions });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { countryId, name, level, code, active } = body;

  const jurisdiction = await prisma.jurisdiction.create({
    data: { countryId, name, level: level || 'state', code, active: active ?? true }
  });

  return NextResponse.json({ jurisdiction }, { status: 201 });
}

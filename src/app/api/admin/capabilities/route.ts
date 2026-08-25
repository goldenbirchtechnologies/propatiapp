import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('countryId');

  const capabilities = await prisma.countryCapability.findMany({
    where: countryId ? { countryId } : {},
    include: { country: true },
    orderBy: [{ countryId: 'asc' }, { feature: 'asc' }]
  });

  return NextResponse.json({ capabilities });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { countryId, feature, enabled, available, note } = body;

  const capability = await prisma.countryCapability.create({
    data: { countryId, feature, enabled: enabled ?? false, available: available ?? false, note }
  });

  return NextResponse.json({ capability }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { id, enabled, available, note } = body;

  const capability = await prisma.countryCapability.update({
    where: { id },
    data: { enabled, available, note }
  });

  return NextResponse.json({ capability });
}

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const countries = await prisma.country.findMany({
    include: {
      jurisdictions: true,
      capabilities: true,
      _count: { select: { users: true, listings: true } }
    },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ countries });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { code, name, currency, locale, timezone, active } = body;

  const country = await prisma.country.create({
    data: { code, name, currency, locale, timezone, active }
  });

  return NextResponse.json({ country }, { status: 201 });
}

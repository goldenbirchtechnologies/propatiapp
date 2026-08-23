import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('countryId');
  const ruleType = searchParams.get('ruleType');

  const rules = await prisma.jurisdictionRule.findMany({
    where: {
      ...(countryId ? { countryId } : {}),
      ...(ruleType ? { ruleType } : {}),
    },
    orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    include: { country: true, jurisdiction: true },
  });

  return NextResponse.json({ rules });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { jurisdictionId, countryId, ruleType, name, description, conditions, actions, priority, effectiveDate, expiryDate } = body;

  const rule = await prisma.jurisdictionRule.create({
    data: {
      jurisdictionId,
      countryId,
      ruleType,
      name,
      description,
      conditions: conditions || {},
      actions: actions || {},
      priority: priority || 0,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/** Approved, active templates visible to agreement creators. */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;

  const templates = await prisma.documentTemplate.findMany({
    where: { active: true },
    orderBy: [{ name: 'asc' }, { version: 'desc' }],
    select: {
      id: true,
      name: true,
      version: true,
      propertyType: true,
      tenancyType: true,
      language: true,
      effectiveDate: true,
      jurisdiction: { select: { name: true } },
    },
  });

  return NextResponse.json({ templates });
}

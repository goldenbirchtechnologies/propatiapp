import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('countryId');
  const propertyType = searchParams.get('propertyType');

  const templates = await prisma.documentTemplate.findMany({
    where: {
      ...(countryId ? { countryId } : {}),
      ...(propertyType ? { propertyType } : {}),
    },
    orderBy: [{ countryId: 'asc' }, { name: 'asc' }],
    include: { country: true, jurisdiction: true },
  });

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { countryId, jurisdictionId, propertyType, tenancyType, name, templateSchema, mandatoryClauses, content, language } = body;

  const template = await prisma.documentTemplate.create({
    data: {
      countryId,
      jurisdictionId,
      propertyType,
      tenancyType,
      name,
      templateSchema: templateSchema || {},
      mandatoryClauses: mandatoryClauses || [],
      content,
      language: language || 'en',
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}

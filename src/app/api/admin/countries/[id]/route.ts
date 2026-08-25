import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const country = await prisma.country.findUnique({
    where: { code: id },
    include: { jurisdictions: true, capabilities: true }
  });

  if (!country) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ country });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const body = await request.json();

  const country = await prisma.country.update({
    where: { code: id },
    data: body
  });

  return NextResponse.json({ country });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  await prisma.country.delete({ where: { code: id } });

  return NextResponse.json({ success: true });
}

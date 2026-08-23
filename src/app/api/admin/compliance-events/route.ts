import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const legalMatterId = searchParams.get('legalMatterId');
  const status = searchParams.get('status');

  const events = await prisma.complianceEvent.findMany({
    where: {
      ...(legalMatterId ? { legalMatterId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { deadline: 'asc' },
    include: { legalMatter: true },
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { legalMatterId, eventType, title, description, deadline, assignedTo, metadata } = body;

  const event = await prisma.complianceEvent.create({
    data: {
      legalMatterId,
      eventType,
      title,
      description,
      deadline: new Date(deadline),
      assignedTo,
      metadata: metadata || {},
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}

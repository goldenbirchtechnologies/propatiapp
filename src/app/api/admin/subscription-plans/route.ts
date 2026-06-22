import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/api-auth';

export default async function handler(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (request.method === 'GET') {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
    return NextResponse.json({ plans });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name,
        price: body.price,
        currency: body.currency || 'NGN',
        interval: body.interval || 'month',
        features: body.features || {},
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ plan }, { status: 201 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

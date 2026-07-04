import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  type: z.enum(['Buyer', 'Renter']).optional(),
  minBudget: z.number().nonnegative().optional(),
  maxBudget: z.number().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const agreements = await prisma.agreement.findMany({
      where: { agentId: { not: null }, status: { not: 'draft' }, ...(user.role === 'agent' ? { agentId: user.id } : {}) },
      include: {
        tenant: { select: { id: true, fullName: true, phone: true } },
        listing: { select: { id: true, listingType: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const clients = agreements
      .filter((a) => a.tenant)
      .map((a) => ({
        id: a.tenant.id,
        name: a.tenant.fullName,
        phone: a.tenant.phone || '—',
        type: a.listing?.listingType === 'sale' ? 'Buyer' : 'Renter',
        minBudget: Number(a.rentAmount || 0),
        maxBudget: Number(a.rentAmount || 0) * 1.5,
        lastContact: a.updatedAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
      }));

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error('Agent clients GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = clientSchema.parse(await request.json());

    const email = `${body.name.toLowerCase().replace(/\s+/g, '.')}@client.local`;
    const created = await prisma.user.create({
      data: {
        clerkId: `usr_${Buffer.from(email).toString('base64').slice(0, 16)}`,
        email,
        fullName: body.name,
        phone: body.phone,
        role: 'tenant',
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const clientResponse = {
      id: created.id,
      name: created.fullName,
      phone: created.phone || '—',
      type: body.type || 'Renter',
      minBudget: body.minBudget || 0,
      maxBudget: body.maxBudget || 0,
      lastContact: created.updatedAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: clientResponse }, { status: 201 });
  } catch (error) {
    console.error('Agent clients POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

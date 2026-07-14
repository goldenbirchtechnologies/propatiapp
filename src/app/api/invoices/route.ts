import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { InvoiceType, InvoiceStatus } from '@prisma/client';

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  quantity: z.number().positive().optional(),
});

const createInvoiceSchema = z.object({
  tenantId: z.string().uuid().optional(),
  listingId: z.string().uuid().optional(),
  agreementId: z.string().uuid().optional(),
  type: z.enum(['rent', 'service', 'utility', 'agreement', 'other']).default('rent'),
  amount: z.number().positive(),
  currency: z.string().default('NGN'),
  dueDate: z.coerce.date(),
  items: z.array(invoiceItemSchema).min(1),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { page = '1', limit = '20' } = Object.fromEntries(request.nextUrl.searchParams);
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (user.role === 'landlord') {
      where.landlordId = user.id;
    } else if (user.role === 'tenant') {
      where.tenantId = user.id;
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          tenant: { select: { id: true, fullName: true, email: true } },
          listing: { select: { id: true, title: true, address: true } },
          agreement: { select: { id: true, type: true, status: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)), hasNext: Number(page) * Number(limit) < total, hasPrev: Number(page) > 1 },
    });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createInvoiceSchema.parse(body);

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        landlordId: user.id,
        tenantId: validated.tenantId,
        listingId: validated.listingId,
        agreementId: validated.agreementId,
        type: validated.type as InvoiceType,
        amount: validated.amount,
        currency: validated.currency,
        dueDate: validated.dueDate,
        items: validated.items,
        notes: validated.notes,
        invoiceNumber,
        status: 'draft' as InvoiceStatus,
      },
      include: {
        tenant: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true, address: true } },
        agreement: { select: { id: true, type: true, status: true } },
      },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('Invoices POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

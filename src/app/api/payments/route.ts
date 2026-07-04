import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { initiatePaymentSchema, paginationSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { computeFees } from '@/lib/fees';
import { TransactionStatus, TransactionType, UserRole } from '@prisma/client';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, ...filters } = paginationSchema.extend({
      status: z.enum(Object.values(TransactionStatus) as [string, ...string[]]).optional(),
      type: z.enum(Object.values(TransactionType) as [string, ...string[]]).optional(),
      listingId: z.string().uuid().optional(),
      agreementId: z.string().uuid().optional(),
    }).parse(params);

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause based on user role
    const where: Record<string, unknown> = {};

    if (user.role === 'admin') {
      // Admin can see all
    } else if (user.role === 'agent') {
      where.OR = [{ payerId: user.id }, { payeeId: user.id }, { agentId: user.id }];
    } else {
      where.OR = [{ payerId: user.id }, { payeeId: user.id }];
    }

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.listingId) where.listingId = filters.listingId;
    if (filters.agreementId) where.agreementId = filters.agreementId;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, area: true } },
          payer: { select: { id: true, fullName: true, email: true } },
          payee: { select: { id: true, fullName: true, email: true } },
          agent: { select: { id: true, fullName: true, email: true, agentTier: true } },
          agreements: { select: { id: true, type: true, status: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Format amounts for display
    const formatted = transactions.map((txn) => ({
      ...txn,
      amountFormatted: (Number(txn.amount) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      platformFeeFormatted: (Number(txn.platformFee) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      agentCommissionFormatted: (Number(txn.agentCommission) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      payeeAmountFormatted: txn.payeeAmount
        ? (Number(txn.payeeAmount) / 100).toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
          })
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Payments GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = initiatePaymentSchema.parse(body);

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: { id: true, ownerId: true, agentId: true, title: true, price: true, listingType: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify agreement if provided
    let agreement: {
      id: string;
      status: string;
      tenantId: string;
      landlordId: string;
      agentId: string | null;
    } | null = null;
    if (validated.agreementId) {
      agreement = await prisma.agreement.findUnique({
        where: { id: validated.agreementId },
        select: { id: true, status: true, tenantId: true, landlordId: true, agentId: true },
      });

      if (!agreement) {
        return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
      }

      if (agreement.tenantId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN: Not the tenant on this agreement' }, { status: 403 });
      }

      if (!['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed', 'fully_signed'].includes(agreement.status)) {
        return NextResponse.json({ error: 'Agreement not ready for payment' }, { status: 400 });
      }
    }

    // Compute fees
    const amountKobo = Math.round(validated.amount * 100); // Convert to kobo
    const hasAgent = !!listing.agentId;
    const fees = computeFees(validated.type, amountKobo, hasAgent);

    // Determine payee (landlord) and agent
    const payeeId = listing.ownerId;
    const agentId = listing.agentId;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        listingId: listing.id,
        payerId: user.id,
        payeeId,
        agentId: hasAgent ? agentId : null,
        type: validated.type,
        status: 'pending',
        amount: amountKobo,
        platformFee: fees.platformFee,
        agentCommission: fees.agentCommission,
        payeeAmount: fees.payeeAmount,
        description: validated.metadata?.description || `Payment for ${listing.title}`,
        paystackData: validated.metadata,
      },
    });

    // Initialize Paystack transaction
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/${transaction.id}/callback`;
    const paystackResponse = await paystack.initializeTransaction({
      email: validated.email,
      amount: amountKobo,
      reference: `txn_${transaction.id}_${Date.now()}`,
      callback_url: callbackUrl,
      metadata: {
        transactionId: transaction.id,
        listingId: listing.id,
        userId: user.id,
        type: validated.type,
        ...validated.metadata,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    });

    // Update transaction with Paystack reference
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { reference: paystackResponse.data.reference },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          transaction: {
            id: transaction.id,
            reference: paystackResponse.data.reference,
            amount: amountKobo,
            amountFormatted: (amountKobo / 100).toLocaleString('en-NG', {
              style: 'currency',
              currency: 'NGN',
              minimumFractionDigits: 0,
            }),
            fees: {
              platformFee: fees.platformFee,
              agentCommission: fees.agentCommission,
              payeeAmount: fees.payeeAmount,
            },
          },
          authorizationUrl: paystackResponse.data.authorization_url,
          accessCode: paystackResponse.data.access_code,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payments POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('FORBIDDEN')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
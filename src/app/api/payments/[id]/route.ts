import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { TransactionStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, area: true, price: true, listingType: true } },
        payer: { select: { id: true, fullName: true, email: true, phone: true } },
        payee: { select: { id: true, fullName: true, email: true, phone: true } },
        agent: { select: { id: true, fullName: true, email: true, phone: true, agentTier: true } },
        agreements: { select: { id: true, type: true, status: true, startDate: true, endDate: true } },
        rentSchedule: { select: { id: true, dueDate: true, amount: true, status: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check permissions
    const isParticipant =
      transaction.payerId === user.id ||
      transaction.payeeId === user.id ||
      transaction.agentId === user.id ||
      user.role === 'ADMIN';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Format amounts
    const formatted = {
      ...transaction,
      amountFormatted: (Number(transaction.amount) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      platformFeeFormatted: (Number(transaction.platformFee) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      agentCommissionFormatted: (Number(transaction.agentCommission) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      payeeAmountFormatted: transaction.payeeAmount
        ? (Number(transaction.payeeAmount) / 100).toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
          })
        : null,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Payment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
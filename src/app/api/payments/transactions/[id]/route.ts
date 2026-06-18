import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments/transactions/[id]
 * Returns full transaction details
 *
 * Authorization: Transaction owner (payer/payee) or admin
 */
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
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            price: true,
            listingType: true,
            propertyType: true,
            images: {
              select: { url: true, isCover: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
        payer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        payee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            agentTier: true,
          },
        },
        agreements: {
          select: {
            id: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        rentSchedule: {
          select: {
            id: true,
            dueDate: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Authorization check
    const canView =
      transaction.payerId === user.id ||
      transaction.payeeId === user.id ||
      transaction.agentId === user.id ||
      user.role === 'admin';

    if (!canView) {
      return NextResponse.json({ error: 'FORBIDDEN: Not authorized to view this transaction' }, { status: 403 });
    }

    // Format amounts for display
    const formatted = {
      ...transaction,
      amount: Number(transaction.amount),
      amountFormatted: (Number(transaction.amount) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      platformFee: Number(transaction.platformFee),
      platformFeeFormatted: (Number(transaction.platformFee) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      agentCommission: Number(transaction.agentCommission),
      agentCommissionFormatted: (Number(transaction.agentCommission) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      payeeAmount: transaction.payeeAmount ? Number(transaction.payeeAmount) : null,
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
    console.error('Transaction detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

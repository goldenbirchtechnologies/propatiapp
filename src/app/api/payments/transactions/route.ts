import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { transactionFiltersSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { TransactionStatus, TransactionType, UserRole } from '@prisma/client';
import { z } from 'zod';

/**
 * GET /api/payments/transactions
 * Returns paginated transaction list with filters
 *
 * Query params: ?userId=...&status=...&type=...&page=...&limit=...
 * Authorization: User sees own transactions, admin sees all
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validated = transactionFiltersSchema.parse(params);

    const { page, limit, sort, order, ...filters } = validated;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause based on user role
    const where: any = {};

    if (user.role === 'admin') {
      // Admin can see all, apply filters
      if (filters.userId) {
        where.OR = [
          { payerId: filters.userId },
          { payeeId: filters.userId },
          { agentId: filters.userId },
        ];
      }
    } else if (user.role === 'agent') {
      // Agent sees transactions they're involved in
      where.OR = [
        { payerId: user.id },
        { payeeId: user.id },
        { agentId: user.id },
      ];
    } else {
      // Regular users see only their transactions
      where.OR = [
        { payerId: user.id },
        { payeeId: user.id },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.listingId) where.listingId = filters.listingId;
    if (filters.agreementId) {
      where.agreements = {
        some: { id: filters.agreementId },
      };
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
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
          listing: {
            select: {
              id: true,
              title: true,
              area: true,
              address: true,
              listingType: true,
              images: {
                select: { url: true, isCover: true },
                where: { isCover: true },
                take: 1,
              },
            },
          },
          payer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          payee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          agent: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              agentTier: true,
            },
          },
          agreements: {
            select: {
              id: true,
              type: true,
              status: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Format amounts for display
    const formatted = transactions.map((txn) => ({
      ...txn,
      amount: Number(txn.amount),
      amountFormatted: (Number(txn.amount) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      platformFee: Number(txn.platformFee),
      platformFeeFormatted: (Number(txn.platformFee) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      agentCommission: Number(txn.agentCommission),
      agentCommissionFormatted: (Number(txn.agentCommission) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
      payeeAmount: txn.payeeAmount ? Number(txn.payeeAmount) : null,
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Transactions list error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

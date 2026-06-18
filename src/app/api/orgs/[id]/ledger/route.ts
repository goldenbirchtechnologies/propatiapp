import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner, manager, or accountant can view ledger
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'accountant'];
    if (!isOwner && !allowedRoles.includes(membership.role)) {
      return NextResponse.json({ error: 'FORBIDDEN: Only owner, manager, or accountant can view ledger' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const listingId = searchParams.get('listingId');

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = {};

    // Filter by org's listings through agreements/listings
    const orgListingIds = await prisma.orgListing.findMany({
      where: { orgId: id },
      select: { listingId: true },
    });
    const listingIds = orgListingIds.map(l => l.listingId);

    if (listingIds.length > 0) {
      where.listingId = { in: listingIds };
    } else {
      // No listings in org, return empty
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: { totalIncome: 0, totalExpenses: 0, netAmount: 0, byType: {}, byStatus: {} },
      });
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total, summaries] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, address: true, listingType: true } },
          payer: { select: { id: true, fullName: true, email: true } },
          payee: { select: { id: true, fullName: true, email: true } },
          agent: { select: { id: true, fullName: true, email: true } },
          agreement: { select: { id: true, type: true, status: true } },
        },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ['type', 'status'],
        where,
        _count: true,
        _sum: { amount: true, platformFee: true, agentCommission: true, payeeAmount: true },
      }),
    ]);

    // Calculate summary stats
    const totalIncome = summaries
      .filter(s => ['rent', 'sale', 'short_let'].includes(s.type))
      .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

    const totalExpenses = summaries
      .filter(s => s.type === 'subscription')
      .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

    const netAmount = totalIncome - totalExpenses;

    const byType = summaries.reduce((acc, s) => {
      acc[s.type] = {
        count: s._count,
        totalAmount: Number(s._sum.amount || 0),
        totalPlatformFee: Number(s._sum.platformFee || 0),
        totalAgentCommission: Number(s._sum.agentCommission || 0),
        totalPayeeAmount: Number(s._sum.payeeAmount || 0),
      };
      return acc;
    }, {} as Record<string, unknown>);

    const byStatus = summaries.reduce((acc, s) => {
      const key = `${s.type}_${s.status}`;
      acc[key] = {
        count: s._count,
        totalAmount: Number(s._sum.amount || 0),
      };
      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { totalIncome, totalExpenses, netAmount, byType, byStatus },
    });
  } catch (error) {
    console.error('Org Ledger GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
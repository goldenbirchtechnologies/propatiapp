import { NextRequest, NextResponse } from 'next/server';
import { withAuth, paginatedResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { adminUserFiltersSchema } from '@/lib/validators';

/**
 * GET /api/admin/users
 * List all users with filters and stats
 * Query: ?role=...&status=...&search=...&page=...&limit=...
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const validated = adminUserFiltersSchema.parse(params);

    const { page, limit, role, status, search } = validated;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      if (status === 'active') {
        where.isActive = true;
        where.isBanned = false;
      } else if (status === 'suspended') {
        where.isActive = false;
        where.isBanned = false;
      } else if (status === 'banned') {
        where.isBanned = true;
      }
    }

    // Search across name, email, phone
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          clerkId: true,
          email: true,
          phone: true,
          role: true,
          fullName: true,
          avatarUrl: true,
          phoneVerified: true,
          idVerified: true,
          isActive: true,
          isBanned: true,
          banReason: true,
          agentTier: true,
          agentApproved: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              ownedListings: true,
              sentTransactions: true,
              receivedTransactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Format response with stats
    const formattedUsers = users.map((user) => ({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phoneVerified: user.phoneVerified,
      idVerified: user.idVerified,
      isActive: user.isActive,
      isBanned: user.isBanned,
      banReason: user.banReason,
      agentTier: user.agentTier,
      agentApproved: user.agentApproved,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      stats: {
        listingsCount: user._count.ownedListings,
        transactionsSent: user._count.sentTransactions,
        transactionsReceived: user._count.receivedTransactions,
      },
    }));

    return paginatedResponse(formattedUsers, page, limit, total);
  } catch (error) {
    console.error('Admin users list error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

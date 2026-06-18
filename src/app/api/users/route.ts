import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { paginationSchema, updateUserSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, ...filters } = paginationSchema.extend({
      role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
      isActive: z.coerce.boolean().optional(),
      search: z.string().optional(),
    }).parse(params);

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          clerkId: true,
          email: true,
          phone: true,
          role: true,
          fullName: true,
          avatarUrl: true,
          ninVerified: true,
          phoneVerified: true,
          idVerified: true,
          profileCompleted: true,
          agentTier: true,
          agentApproved: true,
          isActive: true,
          isBanned: true,
          banReason: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              ownedListings: true,
              tenantAgreements: true,
              sentTransactions: true,
              orgMemberships: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Users GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
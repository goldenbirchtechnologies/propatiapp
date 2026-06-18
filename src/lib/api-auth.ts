import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    clerkId: string;
    email: string;
    role: Role;
    fullName: string;
  };
}

export async function withAuth(
  request: NextRequest,
  allowedRoles?: Role[]
): Promise<{ user: AuthenticatedRequest['user'] } | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      role: true,
      fullName: true,
      isActive: true,
      isBanned: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
  }

  if (!user.isActive || user.isBanned) {
    return NextResponse.json({ error: 'ACCOUNT_DISABLED' }, { status: 403 });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  return {
    user: {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  };
}

export function requireRole(allowedRoles: Role[]) {
  return async (request: NextRequest) => {
    return withAuth(request, allowedRoles);
  };
}

export const requireAdmin = requireRole(['ADMIN']);
export const requireAgent = requireRole(['AGENT', 'ADMIN']);
export const requireEstateManager = requireRole(['ESTATE_MANAGER', 'ADMIN']);
export const requireLandlord = requireRole(['LANDLORD', 'ADMIN']);
export const requireTenant = requireRole(['TENANT', 'ADMIN']);

// Helper to create standardized API responses
export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
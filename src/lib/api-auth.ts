import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole as Role } from '@prisma/client';

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

export const requireAdmin = requireRole(['admin']);
export const requireAgent = requireRole(['agent', 'admin']);
export const requireEstateManager = requireRole(['estate_manager', 'admin']);
export const requireLandlord = requireRole(['landlord', 'admin']);
export const requireTenant = requireRole(['tenant', 'admin']);

/**
 * Blocks admin-only fields from self-update routes. Intended for use in
 * PATCH routes where the caller authenticates as the resource owner but must
 * not be able to promote themselves or mutate privileged columns.
 */
export function isAdminWriteGate(request: NextRequest): NextResponse | null {
  throw new Error(
    'Admin-only mutation blocked: caller authenticated as owner, not admin. '
    + 'Use a route guarded by requireAdmin for privileged field writes.'
  );
}

// Helper to create standardized API responses
export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message });
}

export function errorResponse(message: string | unknown, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details, statusCode: status }, { status });
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
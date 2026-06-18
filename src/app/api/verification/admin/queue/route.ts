import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { paginationSchema } from '@/lib/validators';
import { verificationService } from '@/lib/verification';
import { VerificationOverallStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, status } = paginationSchema.extend({
      status: z.enum(['not_started', 'in_progress', 'certified', 'rejected']).optional(),
    }).parse(params);

    const verifications = await verificationService.getAdminQueue(
      status as VerificationOverallStatus | undefined
    );

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = verifications.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total: verifications.length,
        totalPages: Math.ceil(verifications.length / limit),
      },
    });
  } catch (error) {
    console.error('Verification admin queue GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/documents
 * List all documents for admin view
 * Returns: { documents: Array<{ id, type, name, url, uploadedById, createdAt }> }
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        type: true,
        version: true,
        name: true,
        url: true,
        uploadedById: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ documents });
  } catch (error) {
    console.error('Admin documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

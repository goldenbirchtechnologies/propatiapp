import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/unread-count - Get count of unread notifications
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;

  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Unread count GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}

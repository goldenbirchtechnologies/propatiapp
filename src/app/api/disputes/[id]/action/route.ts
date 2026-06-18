import { NextRequest, NextResponse } from 'next/server';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { action, resolution } = body;

    const statusMap: Record<string, string> = {
      investigate: 'investigating',
      mediate: 'mediated',
      resolve: 'resolved',
      close: 'closed',
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return errorResponse('Invalid action. Must be one of: investigate, mediate, resolve, close', 400);
    }

    const { user } = authResult;

    const dispute = await prisma.dispute.update({
      where: { id: params.id },
      data: {
        status: newStatus as any,
        adminId: user.id,
        resolution: resolution || undefined,
        resolvedAt: newStatus === 'resolved' || newStatus === 'closed' ? new Date() : undefined,
      },
      include: {
        raisedByUser: {
          select: { id: true, fullName: true, email: true },
        },
        listing: {
          select: { id: true, title: true },
        },
        admin: {
          select: { id: true, fullName: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: dispute });
  } catch (error) {
    console.error('POST /api/disputes/[id]/action error:', error);
    return errorResponse('Failed to update dispute', 500);
  }
}

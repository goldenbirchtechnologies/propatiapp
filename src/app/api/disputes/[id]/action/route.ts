import { NextRequest, NextResponse } from 'next/server';
import { withAuth, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { action, resolution } = body;

    const { user } = authResult;

    switch (action) {
      case 'investigate':
      case 'mediate':
      case 'resolve':
      case 'close': {
        const statusMap: Record<string, string> = {
          investigate: 'investigating',
          mediate: 'mediated',
          resolve: 'resolved',
          close: 'closed',
        };

        const newStatus = statusMap[action];
        if (!newStatus) {
          return errorResponse('Invalid action', 400);
        }

        const dispute = await prisma.dispute.update({
          where: { id: id },
          data: {
            status: newStatus as string,
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
      }

      case 'assign': {
        const dispute = await prisma.dispute.update({
          where: { id: id },
          data: { adminId: user.id },
          include: {
            raisedByUser: {
              select: { id: true, fullName: true, email: true },
            },
            admin: {
              select: { id: true, fullName: true },
            },
          },
        });

        return NextResponse.json({ success: true, data: dispute });
      }

      case 'escalate': {
        const dispute = await prisma.dispute.update({
          where: { id: id },
          data: {
            status: 'routed',
            adminId: user.id,
          },
          include: {
            raisedByUser: {
              select: { id: true, fullName: true, email: true },
            },
            admin: {
              select: { id: true, fullName: true },
            },
          },
        });

        return NextResponse.json({ success: true, data: dispute });
      }

      case 'consent_required': {
        const dispute = await prisma.dispute.update({
          where: { id: id },
          data: {
            status: 'consent_required',
            adminId: user.id,
          },
          include: {
            raisedByUser: {
              select: { id: true, fullName: true, email: true },
            },
            admin: {
              select: { id: true, fullName: true },
            },
          },
        });

        return NextResponse.json({ success: true, data: dispute });
      }

      case 'consent_granted': {
        const dispute = await prisma.dispute.update({
          where: { id: id },
          data: {
            status: 'consent_granted',
            adminId: user.id,
          },
          include: {
            raisedByUser: {
              select: { id: true, fullName: true, email: true },
            },
            admin: {
              select: { id: true, fullName: true },
            },
          },
        });

        return NextResponse.json({ success: true, data: dispute });
      }

      case 'engagemediation': {
        const dispute = await prisma.dispute.update({
          where: { id: id },
          data: {
            status: 'engaged',
            adminId: user.id,
            resolvedAt: new Date(),
          },
          include: {
            raisedByUser: {
              select: { id: true, fullName: true, email: true },
            },
            admin: {
              select: { id: true, fullName: true },
            },
          },
        });

        return NextResponse.json({ success: true, data: dispute });
      }

      default:
        return errorResponse('Invalid action. Must be one of: investigate, mediate, resolve, close, assign, escalate, consent_required, consent_granted, engagemediation', 400);
    }
  } catch (error) {
    console.error('POST /api/disputes/[id]/action error:', error);
    return errorResponse('Failed to update dispute', 500);
  }
}

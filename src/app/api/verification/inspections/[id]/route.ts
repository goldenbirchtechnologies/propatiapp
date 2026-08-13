import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET inspection details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = id;

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            ownerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        l4Agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            agentTier: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Check authorization - owner, assigned agent, or admin
    const isAuthorized =
      verification.listing.ownerId === user.id ||
      verification.l4AgentId === user.id ||
      user.role === 'admin';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      inspection: {
        id: verification.id,
        listingId: verification.listingId,
        listing: verification.listing,
        owner: verification.owner,
        agent: verification.l4Agent,
        scheduledDate: verification.l4ScheduledAt,
        completedDate: verification.l4CompletedAt,
        reportUrl: verification.l4ReportUrl,
        status: verification.l4Status,
        notes: verification.adminNotes,
        currentLayer: verification.currentLayer,
        overallStatus: verification.overallStatus,
      },
    });
  } catch (error) {
    console.error('Get inspection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update inspection (reschedule, assign agent)
const updateInspectionSchema = z.object({
  scheduledDate: z.string().datetime().optional(),
  agentId: z.string().cuid().optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = id;
    const body = await request.json();
    const validated = updateInspectionSchema.parse(body);

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        listing: {
          select: { id: true, ownerId: true, title: true },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Check authorization - only admin, assigned agent, or owner can update
    const isAuthorized =
      user.role === 'admin' ||
      verification.l4AgentId === user.id ||
      verification.listing.ownerId === user.id;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: { updatedAt: Date; l4ScheduledAt?: Date; l4AgentId?: string; l4Status?: string; adminNotes?: string } = {
      updatedAt: new Date(),
    };

    if (validated.scheduledDate) {
      updateData.l4ScheduledAt = new Date(validated.scheduledDate);
    }

    if (validated.agentId) {
      // Verify agent exists and is approved
      const agent = await prisma.user.findFirst({
        where: {
          id: validated.agentId,
          role: 'agent',
          agentApproved: true,
          isActive: true,
        },
      });

      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found or not approved' },
          { status: 400 }
        );
      }

      updateData.l4AgentId = validated.agentId;

      // Notify newly assigned agent
      await prisma.notification.create({
        data: {
          userId: validated.agentId,
          type: 'verification',
          title: 'Inspection Assignment',
          body: `You have been assigned to inspect ${verification.listing.title}`,
          data: {
            verificationId,
            listingId: verification.listingId,
            layer: 4,
          },
        },
      });
    }

    if (validated.status) {
      // Map status to l4Status
      const statusMap: Record<string, string> = {
        pending: 'pending',
        scheduled: 'pending',
        in_progress: 'pending',
        completed: 'approved',
        cancelled: 'rejected',
      };
      updateData.l4Status = statusMap[validated.status] || 'pending';
    }

    if (validated.notes) {
      updateData.adminNotes = validated.notes;
    }

    const updatedVerification = await prisma.verification.update({
      where: { id: verificationId },
      data: updateData,
      include: {
        listing: {
          select: { id: true, title: true },
        },
        l4Agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      inspection: {
        id: updatedVerification.id,
        scheduledDate: updatedVerification.l4ScheduledAt,
        agent: updatedVerification.l4Agent,
        status: updatedVerification.l4Status,
        notes: updatedVerification.adminNotes,
      },
    });
  } catch (error) {
    console.error('Update inspection error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

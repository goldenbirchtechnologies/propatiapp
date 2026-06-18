import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const requestInspectionSchema = z.object({
  verificationId: z.string().cuid(),
  listingId: z.string().cuid(),
  preferredDate: z.string().datetime(),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  notes: z.string().max(1000).optional(),
});

export type RequestInspectionInput = z.infer<typeof requestInspectionSchema>;

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = requestInspectionSchema.parse(body);

    // Find verification
    const verification = await prisma.verification.findUnique({
      where: { id: validated.verificationId },
      include: {
        listing: {
          select: {
            id: true,
            ownerId: true,
            title: true,
            address: true,
            area: true,
            state: true,
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
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    if (verification.listingId !== validated.listingId) {
      return NextResponse.json(
        { error: 'Listing ID does not match verification' },
        { status: 400 }
      );
    }

    // Check authorization
    if (verification.listing.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not the property owner' },
        { status: 403 }
      );
    }

    // Check if at Layer 4
    if (verification.currentLayer !== 4) {
      return NextResponse.json(
        {
          error: 'Must complete Layer 3 first',
          currentLayer: verification.currentLayer,
        },
        { status: 400 }
      );
    }

    // Check if Layer 3 is approved
    if (verification.l3Status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Layer 3 must be approved before requesting inspection',
          l3Status: verification.l3Status,
        },
        { status: 400 }
      );
    }

    // Find available agents in the area
    const availableAgents = await prisma.user.findMany({
      where: {
        role: 'agent',
        agentApproved: true,
        isActive: true,
        agentAreas: {
          path: '$[*]',
          array_contains: verification.listing.area,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        agentTier: true,
      },
      orderBy: {
        agentTier: 'desc', // Prefer senior agents
      },
      take: 1,
    });

    const assignedAgent = availableAgents[0];

    // Update verification with inspection details
    const updatedVerification = await prisma.verification.update({
      where: { id: validated.verificationId },
      data: {
        l4Status: 'pending',
        l4ScheduledAt: new Date(validated.preferredDate),
        l4AgentId: assignedAgent?.id || null,
        adminNotes: validated.notes
          ? `Inspection Notes: ${validated.notes}`
          : null,
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: { id: true, title: true, address: true, area: true },
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

    // Create notification for owner
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'verification',
        title: 'Inspection Requested',
        body: assignedAgent
          ? `Inspection scheduled for ${verification.listing.title}. Agent ${assignedAgent.fullName} will contact you.`
          : `Inspection requested for ${verification.listing.title}. An agent will be assigned soon.`,
        data: {
          verificationId: validated.verificationId,
          listingId: validated.listingId,
          layer: 4,
          scheduledAt: validated.preferredDate,
          agentId: assignedAgent?.id,
        },
      },
    });

    // Create notification for assigned agent
    if (assignedAgent) {
      await prisma.notification.create({
        data: {
          userId: assignedAgent.id,
          type: 'verification',
          title: 'New Inspection Assignment',
          body: `Inspection requested for ${verification.listing.title} at ${verification.listing.address}`,
          data: {
            verificationId: validated.verificationId,
            listingId: validated.listingId,
            layer: 4,
            scheduledAt: validated.preferredDate,
            preferredTime: validated.preferredTime,
            ownerName: verification.owner.fullName,
            ownerPhone: verification.owner.phone,
            notes: validated.notes,
          },
        },
      });
    }

    // Notify admins if no agent available
    if (!assignedAgent) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin', isActive: true },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'verification',
            title: 'Inspection Needs Agent Assignment',
            body: `${verification.listing.title} in ${verification.listing.area} - no available agents`,
            data: {
              verificationId: validated.verificationId,
              listingId: validated.listingId,
              layer: 4,
              area: verification.listing.area,
            },
          })),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        inspection: {
          id: updatedVerification.id,
          scheduledDate: updatedVerification.l4ScheduledAt,
          preferredTime: validated.preferredTime,
          agent: updatedVerification.l4Agent
            ? {
                id: updatedVerification.l4Agent.id,
                fullName: updatedVerification.l4Agent.fullName,
                phone: updatedVerification.l4Agent.phone,
                tier: updatedVerification.l4Agent.agentTier,
              }
            : null,
          listing: {
            id: updatedVerification.listing.id,
            title: updatedVerification.listing.title,
            address: updatedVerification.listing.address,
          },
          status: updatedVerification.l4Status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inspection request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('complete Layer')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

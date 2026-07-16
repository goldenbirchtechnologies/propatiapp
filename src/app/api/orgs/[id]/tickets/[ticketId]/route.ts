import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { updateMaintenanceTicketSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notificationService } from '@/lib/notification-service';

const ticketUpdateSchema = updateMaintenanceTicketSchema.extend({
  ticketId: z.string().uuid(),
}).omit({ ticketId: true });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id, ticketId } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'maintenance'];
    const canViewAll = isOwner || allowedRoles.includes(membership.role);

    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        listing: { select: { id: true, title: true, address: true, images: { where: { isCover: true }, take: 1 } } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        raisedByUser: { select: { id: true, fullName: true, email: true } },
        assignedToUser: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    if (!ticket || ticket.orgId !== id) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check access
    if (!canViewAll && ticket.raisedBy !== user.id && ticket.assignedTo !== user.id && ticket.tenantId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Org Ticket GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id, ticketId } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const isOwner = org.ownerId === user.id;
    const isManager = membership.role === 'manager';
    const isMaintenance = membership.role === 'maintenance';

    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, orgId: true, status: true, assignedTo: true, raisedBy: true },
    });

    if (!ticket || ticket.orgId !== id) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = ticketUpdateSchema.parse(body);

    // Permission checks
    const isAssignee = ticket.assignedTo === user.id;
    const isRaiser = ticket.raisedBy === user.id;

    // Only owner, manager, assignee can update status
    const canUpdateStatus = isOwner || isManager || isAssignee;
    if (validated.status && !canUpdateStatus) {
      return NextResponse.json({ error: 'FORBIDDEN: Cannot update status' }, { status: 403 });
    }

    // Only owner, manager can assign
    if (validated.assignedTo && !isOwner && !isManager) {
      return NextResponse.json({ error: 'FORBIDDEN: Only managers can assign tickets' }, { status: 403 });
    }

    // Verify assignedTo is an org member with maintenance role if provided
    if (validated.assignedTo) {
      const assignee = await prisma.orgMember.findFirst({
        where: { orgId: id, userId: validated.assignedTo, status: 'active', role: 'maintenance' },
      });
      if (!assignee && !isOwner) {
        return NextResponse.json({ error: 'Assigned user must be an active maintenance member' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...validated };

    // Handle status transitions
    if (validated.status) {
      if (validated.status === 'resolved' && ticket.status !== 'resolved') {
        updateData.resolvedAt = new Date();
      }
      if (validated.status === 'closed' && ticket.status !== 'closed') {
        updateData.closedAt = new Date();
        if (!updateData.resolvedAt) updateData.resolvedAt = new Date();
      }
      if (validated.status === 'in_progress' && ticket.status === 'assigned') {
        // Valid transition
      }
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        listing: { select: { id: true, title: true, address: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        raisedByUser: { select: { id: true, fullName: true, email: true } },
        assignedToUser: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    const statusChanged = validated.status && ticket.status !== updated.status;
    const assignmentChanged = validated.assignedTo && ticket.assignedTo !== updated.assignedTo;

    if (statusChanged || assignmentChanged) {
      const managerIds = await prisma.orgMember.findMany({
        where: { orgId: id, role: { in: ['manager', 'maintenance'] } },
        select: { userId: true },
      });

      const participantIds = [ticket.raisedBy, updated.assignedTo || null];
      const previousAssigneeChanged = assignmentChanged ? ticket.assignedTo : null;
      const notifyUserIds = [
        ...participantIds,
        previousAssigneeChanged,
        ...(managerIds || []).map((m) => m.userId),
      ].filter(Boolean) as string[];

      if (notifyUserIds.length > 0) {
        let notificationTitle = 'Maintenance Ticket Updated';
        let notificationMessage = `Ticket for ${(updated.listing as { title?: string } | null)?.title || 'a property'} was updated.`;

        if (statusChanged) {
          if (updated.status === 'resolved') {
            notificationTitle = 'Maintenance Ticket Resolved';
            notificationMessage = `Your maintenance ticket for ${(updated.listing as { title?: string } | null)?.title || 'a property'} has been resolved.`;
          } else if (updated.status === 'closed') {
            notificationTitle = 'Maintenance Ticket Closed';
            notificationMessage = `Your maintenance ticket for ${(updated.listing as { title?: string } | null)?.title || 'a property'} has been closed.`;
          } else if (updated.status === 'in_progress') {
            notificationTitle = 'Maintenance Ticket In Progress';
            notificationMessage = `Your maintenance ticket for ${(updated.listing as { title?: string } | null)?.title || 'a property'} is now in progress.`;
          } else if (updated.status === 'assigned') {
            notificationTitle = 'Maintenance Ticket Assigned';
            notificationMessage = `A maintenance ticket for ${(updated.listing as { title?: string } | null)?.title || 'a property'} has been assigned.`;
          }
        }

        if (assignmentChanged && !statusChanged) {
          notificationTitle = 'Maintenance Ticket Assigned';
          notificationMessage = `A maintenance ticket for ${(updated.listing as { title?: string } | null)?.title || 'a property'} has been assigned.`;
        }

        notificationService.notifyUsersForEvent({
          userIds: notifyUserIds,
          type: 'maintenance',
          title: notificationTitle,
          message: notificationMessage,
          actionUrl: `/dashboard/orgs/${id}/tickets/${ticketId}`,
          metadata: { ticketId: updated.id, listingId: updated.listingId, oldStatus: ticket.status, newStatus: updated.status },
          channels: ['inapp'],
        }).catch(() => undefined);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Org Ticket PATCH error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id, ticketId } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const isOwner = org.ownerId === user.id;
    const isManager = membership.role === 'manager';

    // Only owner or manager can delete tickets
    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'FORBIDDEN: Only owner or manager can delete tickets' }, { status: 403 });
    }

    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, orgId: true, status: true },
    });

    if (!ticket || ticket.orgId !== id) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await prisma.maintenanceTicket.delete({ where: { id: ticketId } });

    return NextResponse.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    console.error('Org Ticket DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { updateMaintenanceTicketSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

    // TODO: Send notifications on status change/assignment

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
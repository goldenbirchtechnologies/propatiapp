import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { createMaintenanceTicketSchema, updateMaintenanceTicketSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notificationService } from '@/lib/notification-service';

const ticketFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  category: z.enum(['plumbing', 'electrical', 'structural', 'security', 'cleaning', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  listingId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Check membership
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true, id: true },
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

    const searchParams = request.nextUrl.searchParams;
    const paramsObj = Object.fromEntries(searchParams.entries());
    const validated = ticketFilterSchema.parse(paramsObj);

    const { page, limit, sort, order, ...filters } = validated;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = { orgId: id };

    // If not owner/manager/maintenance, only show tickets they raised or are assigned to
    if (!canViewAll) {
      where.OR = [
        { raisedBy: user.id },
        { assignedTo: user.id },
        { tenantId: user.id },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;
    if (filters.listingId) where.listingId = filters.listingId;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [tickets, total] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          listing: { select: { id: true, title: true, address: true } },
          tenant: { select: { id: true, fullName: true, email: true, phone: true } },
          raisedByUser: { select: { id: true, fullName: true, email: true } },
          assignedToUser: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        },
      }),
      prisma.maintenanceTicket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Org Tickets GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

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

    // Tenants can raise tickets, org members (manager/maintenance) can create on behalf
    const isOwner = org.ownerId === user.id;
    const allowedRoles = ['manager', 'maintenance'];
    const canCreate = isOwner || allowedRoles.includes(membership.role);

    const body = await request.json();
    const validated = createMaintenanceTicketSchema.parse({ ...body, orgId: id, raisedBy: user.id });

    // Verify listing belongs to org if provided
    if (validated.listingId) {
      const orgListing = await prisma.orgListing.findUnique({
        where: { orgId_listingId: { orgId: id, listingId: validated.listingId } },
      });
      if (!orgListing) {
        return NextResponse.json({ error: 'Listing not found in organization' }, { status: 404 });
      }
    }

    // Verify tenant belongs to org's listings if provided (check agreements)
    if (validated.tenantId) {
      const agreement = await prisma.agreement.findFirst({
        where: {
          tenantId: validated.tenantId,
          listing: { orgListings: { some: { orgId: id } } },
          status: { in: ['fully_signed', 'tenant_signed', 'landlord_signed'] },
        },
      });
      if (!agreement) {
        return NextResponse.json({ error: 'Tenant not found in organization listings' }, { status: 404 });
      }
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

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ...validated,
        raisedBy: user.id,
      },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        raisedByUser: { select: { id: true, fullName: true, email: true } },
        assignedToUser: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    // TODO: Send notification to assigned user and org managers
    const managerIds = await prisma.orgMember.findMany({
      where: { orgId, role: { in: ['manager', 'maintenance'] } },
      select: { userId: true },
    });

    const notifyUserIds = [validated.assignedTo, ...(managerIds || []).map((m) => m.userId)].filter(Boolean) as string[];

    if (notifyUserIds.length > 0) {
      notificationService.notifyUsersForEvent({
        userIds: notifyUserIds,
        type: 'maintenance',
        title: 'Maintenance Ticket Created',
        message: `A maintenance ticket has been raised for ${ticket.listing.title || 'a property'}. Priority: ${validated.priority}.`,
        actionUrl: `/dashboard/orgs/${orgId}/tickets/${ticket.id}`,
        metadata: { ticketId: ticket.id, listingId: ticket.listingId },
        channels: ['inapp'],
      }).catch(() => undefined);
    }

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error('Org Tickets POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
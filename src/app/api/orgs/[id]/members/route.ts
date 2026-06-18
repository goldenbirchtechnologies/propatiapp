import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { paginationSchema, inviteOrgMemberSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { OrgMemberRole, OrgMemberStatus } from '@prisma/client';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['manager', 'accountant', 'maintenance', 'owner_view']).optional(),
  status: z.enum(['active', 'removed']).optional(),
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
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Only manager/owner can list members
    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const isManager = membership.role === 'manager';
    const isOwner = org.ownerId === user.id;

    if (!isManager && !isOwner) {
      return NextResponse.json({ error: 'FORBIDDEN: Only managers and owners can view members' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const paramsObj = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, ...filters } = paginationSchema.extend({
      status: z.enum(['pending', 'active', 'removed']).optional(),
      role: z.enum(['manager', 'accountant', 'maintenance', 'owner_view']).optional(),
    }).parse(paramsObj);

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = { orgId: id };
    if (filters.status) where.status = filters.status;
    if (filters.role) where.role = filters.role;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [members, total] = await Promise.all([
      prisma.orgMember.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
          },
        },
      }),
      prisma.orgMember.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: members,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Org Members GET error:', error);
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
    // Check membership and role
    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: user.id } },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id },
      select: { ownerId: true, maxSeats: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Only owner or manager can invite
    if (org.ownerId !== user.id && membership.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    // Check seat limit
    const activeMembersCount = await prisma.orgMember.count({
      where: { orgId: id, status: 'active' },
    });

    if (org.maxSeats > 0 && activeMembersCount >= org.maxSeats) {
      return NextResponse.json({ error: 'Seat limit reached. Upgrade plan to add more members.' }, { status: 400 });
    }

    const body = await request.json();
    const validated = inviteOrgMemberSchema.parse({ ...body, orgId: id });

    // Check if user already exists and is a member
    const existingUser = await prisma.user.findUnique({ where: { email: validated.email } });

    if (existingUser) {
      const existingMember = await prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId: id, userId: existingUser.id } },
      });

      if (existingMember) {
        if (existingMember.status === 'active') {
          return NextResponse.json({ error: 'User is already an active member' }, { status: 400 });
        }
        if (existingMember.status === 'pending') {
          return NextResponse.json({ error: 'Invite already pending for this user' }, { status: 400 });
        }
        // Reactivate removed member
        const updated = await prisma.orgMember.update({
          where: { id: existingMember.id },
          data: {
            role: validated.role,
            status: 'pending',
            invitedBy: user.id,
            inviteToken: crypto.randomUUID(),
            joinedAt: null,
          },
          include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } },
        });
        return NextResponse.json({ success: true, data: updated }, { status: 201 });
      }
    }

    // Create invite
    const member = await prisma.orgMember.create({
      data: {
        orgId: id,
        userId: existingUser?.id,
        email: validated.email,
        role: validated.role,
        status: 'pending',
        invitedBy: user.id,
        inviteToken: crypto.randomUUID(),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    // TODO: Send invitation email with inviteToken

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error('Org Members POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
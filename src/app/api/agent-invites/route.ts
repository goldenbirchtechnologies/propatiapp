import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendAgentInviteEmail } from '@/lib/email';
import { notifyAgentInviteSent } from '@/lib/notifications';

const createAgentInviteSchema = z.object({
  email: z.string().email(),
  permissions: z.array(z.string()).optional(),
  scope: z.enum(['all', 'specific']).optional(),
  listingIds: z.array(z.string()).optional(),
  message: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    if (user.role === 'landlord' || user.role === 'admin') {
      const [invites, total] = await Promise.all([
        prisma.agentInvite.findMany({
          where: { landlordId: user.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            recipient: { select: { id: true, fullName: true, email: true, role: true } },
          },
        }),
        prisma.agentInvite.count({ where: { landlordId: user.id } }),
      ]);

      return NextResponse.json({
        success: true,
        data: invites,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
      });
    }

    if (user.role === 'agent') {
      const [invites, total] = await Promise.all([
        prisma.agentInvite.findMany({
          where: { email: user.email, status: 'pending' },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            sender: { select: { id: true, fullName: true, email: true } },
          },
        }),
        prisma.agentInvite.count({ where: { email: user.email, status: 'pending' } }),
      ]);

      return NextResponse.json({
        success: true,
        data: invites,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
      });
    }

    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  } catch (error) {
    console.error('Agent invites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createAgentInviteSchema.parse(body);

    const token = randomBytes(16).toString('hex');

    const invite = await prisma.agentInvite.create({
      data: {
        landlordId: user.id,
        email: validated.email.toLowerCase(),
        token,
        status: 'pending',
        permissions: validated.permissions || [],
        scope: validated.scope || 'specific',
        listingIds: validated.listingIds || [],
        message: validated.message || null,
      },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
      },
    });

    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/agent/invites/accept?token=${token}`;
    await sendAgentInviteEmail({
      to: validated.email,
      landlordName: user.fullName,
      acceptUrl,
      message: validated.message,
    });

    await notifyAgentInviteSent({
      landlordId: user.id,
      agentEmail: validated.email,
      inviteId: invite.id,
    });

    return NextResponse.json({ success: true, data: invite }, { status: 201 });
  } catch (error) {
    console.error('Agent invites POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

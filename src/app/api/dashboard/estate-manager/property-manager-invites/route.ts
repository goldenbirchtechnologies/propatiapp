import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { getAppUrl } from '@/lib/urls';

const propertyManagerInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  permissions: z.array(z.string()).min(1).optional(),
  scope: z.array(z.string().cuid()).optional(),
});

async function getActiveOrgForUser(userId: string, userFullName: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { ownedOrganisations: true, orgMemberships: { include: { org: true } } },
  });

  const activeOrg =
    dbUser?.ownedOrganisations?.[0] ||
    dbUser?.orgMemberships?.[0]?.org ||
    (await prisma.organisation.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
                status: 'active',
              },
            },
          },
        ],
      },
      select: { id: true, name: true, maxSeats: true },
    }));

  return activeOrg;
}

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const activeOrg = await getActiveOrgForUser(user.id, user.fullName);

    if (!activeOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgId = activeOrg.id;

    const invitees = await prisma.orgMember.findMany({
      where: {
        orgId,
        role: 'manager',
        status: 'pending',
      },
      select: {
        id: true,
        email: true,
        status: true,
        invitedBy: true,
        createdAt: true,
        inviteToken: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: invitees, orgName: activeOrg.name, orgId });
  } catch (error) {
    console.error('Property manager invites GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = propertyManagerInviteSchema.parse(body);

    const activeOrg = await getActiveOrgForUser(user.id, user.fullName);

    if (!activeOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgId = activeOrg.id;

    const activeMembersCount = await prisma.orgMember.count({
      where: { orgId, status: 'active' },
    });

    if (activeOrg.maxSeats > 0 && activeMembersCount >= activeOrg.maxSeats) {
      return NextResponse.json({ error: 'Seat limit reached. Upgrade plan to add more members.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: validated.email } });

    if (existingUser) {
      const existingMember = await prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId, userId: existingUser.id } },
      });

      if (existingMember) {
        if (existingMember.status === 'active') {
          return NextResponse.json({ error: 'User is already an active member' }, { status: 400 });
        }
        if (existingMember.status === 'pending') {
          return NextResponse.json({ error: 'Invite already pending for this user' }, { status: 400 });
        }

        const updated = await prisma.orgMember.update({
          where: { id: existingMember.id },
          data: {
            role: 'manager',
            status: 'pending',
            invitedBy: user.id,
            inviteToken: crypto.randomUUID(),
          },
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        });

        const acceptUrl = `${getAppUrl()}/orgs/${orgId}/invite/accept?token=${updated.inviteToken}`;
        try {
          await sendEmail({
            to: validated.email,
            subject: `You've been invited back to ${activeOrg.name} on PROPATI`,
            html: `<div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e3a5f;">You're Invited Back!</h1>
              <p>${user.fullName} has invited you to rejoin <strong>${activeOrg.name}</strong> on PROPATI.</p>
              <a href="${acceptUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Accept Invitation</a>
            </div>`,
          });
        } catch (error) {
          console.error('Failed to send reactivation email:', error);
        }

        return NextResponse.json(
          { success: true, data: updated, permissions: validated.permissions, scope: validated.scope },
          { status: 201 }
        );
      }
    }

    const member = await prisma.orgMember.create({
      data: {
        orgId,
        userId: existingUser?.id,
        email: validated.email,
        role: 'manager',
        status: 'pending',
        invitedBy: user.id,
        inviteToken: crypto.randomUUID(),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    const acceptUrl = `${getAppUrl()}/orgs/${orgId}/invite/accept?token=${member.inviteToken}`;
    const inviteHtml = `<div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e3a5f;">You're Invited!</h1>
      <p>${user.fullName} has invited you to join <strong>${activeOrg.name}</strong> on PROPATI.</p>
      <p>Click the button below to accept the invitation:</p>
      <a href="${acceptUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Accept Invitation</a>
      <p style="margin-top: 16px; color: #666;">If the button doesn't work, copy and paste this URL into your browser:<br/>${acceptUrl}</p>
    </div>`;
    const inviteText = `You're invited!\n\n${user.fullName} has invited you to join ${activeOrg.name} on PROPATI.\n\nAccept your invitation by visiting:\n${acceptUrl}\n\nIf you did not expect this invitation, you can ignore this email.`;

    try {
      await sendEmail({
        to: validated.email,
        subject: `Invitation to join ${activeOrg.name} on PROPATI`,
        html: inviteHtml,
        text: inviteText,
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }

    return NextResponse.json(
      { success: true, data: member, permissions: validated.permissions, scope: validated.scope },
      { status: 201 }
    );
  } catch (error) {
    console.error('Property manager invite POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

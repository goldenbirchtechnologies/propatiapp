import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';
import { getAppUrl } from '@/lib/urls';

const createOwnerInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  listingId: z.string().cuid('Invalid listing ID'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id: orgId } = await params;

    // Verify the estate manager owns this org or is a member
    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { ownerId: true, name: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
      select: { role: true, status: true },
    });

    const isOwner = org.ownerId === user.id;
    if (!isOwner && (!membership || membership.status !== 'active')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: { orgId: string; status?: 'pending' | 'accepted' | 'revoked' } = { orgId };
    if (status) where.status = status as 'pending' | 'accepted' | 'revoked';

    const invites = await prisma.ownerInvite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        listingId: true,
        email: true,
        status: true,
        estateManager: { select: { id: true, fullName: true, email: true } },
        owner: { select: { id: true, fullName: true, email: true } },
        createdAt: true,
        acceptedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: invites, orgName: org.name });
  } catch (error) {
    console.error('Owner invites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id: orgId } = await params;
    const body = await request.json();
    const validated = createOwnerInviteSchema.parse(body);

    // Verify the estate manager owns this org or is a manager member
    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { ownerId: true, name: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const membership = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
      select: { role: true, status: true },
    });

    const isOwner = org.ownerId === user.id;
    if (!isOwner && (!membership || membership.status !== 'active' || membership.role !== 'manager')) {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient role' }, { status: 403 });
    }

    // Verify the listing belongs to the org
    const orgListing = await prisma.orgListing.findUnique({
      where: { orgId_listingId: { orgId, listingId: validated.listingId } },
      select: { listing: { select: { title: true, ownerId: true } } },
    });

    if (!orgListing) {
      return NextResponse.json({ error: 'Listing does not belong to this organization' }, { status: 400 });
    }

    // Check if invite already exists (pending or accepted)
    const existingInvite = await prisma.ownerInvite.findFirst({
      where: {
        orgId,
        listingId: validated.listingId,
        email: validated.email.toLowerCase(),
      },
      select: { status: true },
    });

    if (existingInvite && existingInvite.status === 'accepted') {
      return NextResponse.json({ error: 'This property has already been claimed by an owner' }, { status: 409 });
    }

    // If there's a pending invite, revoke it and create a new one
    if (existingInvite && existingInvite.status === 'pending') {
      await prisma.ownerInvite.updateMany({
        where: { orgId, listingId: validated.listingId, email: validated.email.toLowerCase(), status: 'pending' },
        data: { status: 'revoked', revokedAt: new Date() },
      });
    }

    const token = randomBytes(32).toString('hex');

    const invite = await prisma.ownerInvite.create({
      data: {
        orgId,
        listingId: validated.listingId,
        estateManagerId: user.id,
        email: validated.email.toLowerCase(),
        token,
      },
      select: {
        id: true,
        token: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    const acceptUrl = `${getAppUrl()}/orgs/${orgId}/owner-invite/accept?token=${token}`;

    try {
      await sendEmail({
        to: validated.email,
        subject: `Property ownership invitation from ${user.fullName} on PropatiBox`,
        html: `<div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a5f;">Property Ownership Invitation</h1>
          <p>${user.fullName} has invited you to claim ownership of property "${orgListing.listing.title}" on PropatiBox.</p>
          <p>Click the button below to accept the invitation and be linked as the property owner:</p>
          <a href="${acceptUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Accept Ownership</a>
          <p style="margin-top: 16px; color: #666;">If the button doesn't work, copy and paste this URL into your browser:<br/>${acceptUrl}</p>
        </div>`,
        text: `Property Ownership Invitation\n\n${user.fullName} has invited you to claim ownership of property "${orgListing.listing.title}" on PropatiBox.\n\nAccept your invitation by visiting:\n${acceptUrl}\n\nIf you did not expect this invitation, you can ignore this email.`,
      });
    } catch (emailError) {
      console.error('Failed to send owner invite email:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: { id: invite.id, email: invite.email, status: invite.status, createdAt: invite.createdAt },
    }, { status: 201 });
  } catch (error) {
    console.error('Owner invite POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

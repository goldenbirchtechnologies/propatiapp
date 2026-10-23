import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// Accept via token: GET /orgs/{orgId}/owner-invites/accept?token=...
// POST requires authentication: the landlord accepts their own invite
export async function GET(
  request: NextRequest,
) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    const invite = await prisma.ownerInvite.findUnique({
      where: { token },
      include: {
        listing: { select: { id: true, title: true, ownerId: true } },
        estateManager: { select: { id: true, fullName: true, email: true } },
        org: { select: { id: true, name: true } },
      },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite not found or already processed' }, { status: 404 });
    }

    // Return the invite details so the frontend can show an accept button
    // (which then requires authentication as the right user to POST)
    return NextResponse.json({
      success: true,
      data: {
        id: invite.id,
        email: invite.email,
        listingTitle: invite.listing.title,
        propertyName: invite.org?.name || null,
        estateManagerName: invite.estateManager.fullName,
      },
    });
  } catch (error) {
    console.error('Owner invite GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const invite = await prisma.ownerInvite.findUnique({
      where: { token },
      include: { listing: true, estateManager: true, org: true },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite not found or already processed' }, { status: 404 });
    }

    // Verify the authenticated user matches the invite email
    if (!invite.email || invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'FORBIDDEN: Invite email does not match your account' }, { status: 403 });
    }

    // Verify the user is a landlord (or admin)
    if (user.role !== 'landlord' && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Only property owners can accept this invitation' }, { status: 403 });
    }

    // Verify the org matches (if the invite is scoped to an org)
    if (invite.orgId && invite.orgId !== orgId) {
      return NextResponse.json({ error: 'Invite does not belong to this organization' }, { status: 400 });
    }

    // Reassign the listing's ownerId to the accepting landlord
    await prisma.listing.update({
      where: { id: invite.listingId },
      data: { ownerId: user.id },
    });

    // Mark the invite as accepted
    const updated = await prisma.ownerInvite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        ownerId: user.id,
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: updated.id, status: updated.status, listingId: invite.listingId },
    });
  } catch (error) {
    console.error('Owner invite accept error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

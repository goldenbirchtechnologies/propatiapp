import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/orgs/[orgId]/agreements/[agreementId]
// Get a single agreement scoped to the organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; agreementId: string }> }
) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { orgId, agreementId } = await params;

  try {
    // Verify user is an active member of the org
    const membership = await prisma.orgMember.findFirst({
      where: { userId: user.id, orgId, status: 'active' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Get agreement with listing scoped to the org
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
        tenant: { select: { id: true, fullName: true, email: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        documentUrl: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Verify the agreement's listing belongs to this org
    const orgListing = await prisma.orgListing.findFirst({
      where: { orgId, listingId: agreement.listingId },
    });

    if (!orgListing) {
      return NextResponse.json({ error: 'Agreement not found in this organization' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: agreement });
  } catch (error) {
    console.error('Org agreement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
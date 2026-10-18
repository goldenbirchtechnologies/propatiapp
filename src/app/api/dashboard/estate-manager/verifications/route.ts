import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const ownedOrg = await prisma.organisation.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const membership = ownedOrg
      ? null
      : await prisma.orgMember.findFirst({
          where: { userId: user.id, status: 'active' },
          select: { orgId: true },
        });

    const orgId = ownedOrg?.id || membership?.orgId;

    const verifications = await prisma.verification.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          ...(orgId ? [{ listing: { orgListings: { some: { orgId } } } }] : []),
        ],
      },
      include: {
        listing: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ data: verifications });
  } catch (e) {
    console.error('[verifications] GET failed:', e);
    return NextResponse.json({ error: 'Failed to load verifications' }, { status: 500 });
  }
}

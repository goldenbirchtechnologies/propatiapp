import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveAuthUserId } from '@/lib/auth-bypass';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await resolveAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Dismiss all flags for this listing
    await prisma.listingFlag.updateMany({
      where: { listingId: id },
      data: { status: 'dismissed' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error dismissing flags:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss flags' },
      { status: 500 }
    );
  }
}

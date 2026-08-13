import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

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

    const body = await req.json();
    const { reason } = body;

    // Suspend the listing
    await prisma.listing.update({
      where: { id: id },
      data: {
        status: 'suspended',
        // In production, you might have an adminNotes field to store the reason
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error suspending listing:', error);
    return NextResponse.json(
      { error: 'Failed to suspend listing' },
      { status: 500 }
    );
  }
}

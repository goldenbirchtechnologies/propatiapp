import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Implement password reset email logic
    // In production, this would trigger a password reset email via your email service
    // For now, we'll just return success
    console.log(`Password reset requested for user: ${targetUser.email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return NextResponse.json(
      { error: 'Failed to send reset password email' },
      { status: 500 }
    );
  }
}

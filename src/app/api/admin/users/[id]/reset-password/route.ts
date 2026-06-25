import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email/email-service';

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

    // Generate a secure random reset token.
    const resetToken = crypto.randomUUID();

    // Send real password reset email. Do not return success until the send
    // is awaited (or fail with 501 if the service is unavailable).
    try {
      await sendPasswordResetEmail(targetUser.email, targetUser.email, resetToken);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return NextResponse.json(
        { error: 'Failed to send reset password email' },
        { status: 500 }
      );
    }

    // TODO: Persist resetToken with expiry in DB once a reset-token model exists.
    // For now the token is ephemeral; the email notifies the user an admin
    // initiated a reset and includes a fallback contact-support message.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return NextResponse.json(
      { error: 'Failed to send reset password email' },
      { status: 500 }
    );
  }
}

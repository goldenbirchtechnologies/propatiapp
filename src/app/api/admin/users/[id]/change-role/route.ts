import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

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
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;

    // Validate role
    const validRoles: UserRole[] = ['tenant', 'landlord', 'agent', 'admin', 'estate_manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user role
    await prisma.user.update({
      where: { id: params.id },
      data: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { error: 'Failed to change user role' },
      { status: 500 }
    );
  }
}

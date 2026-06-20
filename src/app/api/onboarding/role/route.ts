import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  const authResult = await withAuth(request as any);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { role } = await request.json();
    const validRoles: UserRole[] = [
      'landlord',
      'tenant',
      'agent',
      'admin',
      'estate_manager',
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: role as UserRole },
      select: { id: true, role: true },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

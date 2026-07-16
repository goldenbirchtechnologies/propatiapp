import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Allowed self-onboarding roles (no admin self-promotion)
const SELF_SERVICEABLE_ROLES: UserRole[] = [
  'landlord',
  'tenant',
  'agent',
  'estate_manager',
];

export async function POST(request: Request) {
  const authResult = await withAuth(request as any);
  if (authResult instanceof NextResponse) return authResult;
  // Only roles explicitly allowed by SELF_SERVICEABLE_ROLES may be set here.
  // Admin promotion must go through a server-only privileged path.
  const { user } = authResult;

  try {
    const { role } = await request.json();

    if (!SELF_SERVICEABLE_ROLES.includes(role as UserRole)) {
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

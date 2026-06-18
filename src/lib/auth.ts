import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function getCurrentUserId() {
  const { userId } = auth();
  return userId;
}

export async function syncClerkUser(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) return null;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        fullName: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
        avatarUrl: clerkUser.imageUrl,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
        updatedAt: new Date(),
      },
    });
  }

  // Determine role from Clerk metadata or default to tenant
  const role = (clerkUser.publicMetadata?.role as UserRole) ?? 'tenant';

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      fullName: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
      avatarUrl: clerkUser.imageUrl,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
      role,
      password: 'clerk_managed', // Placeholder since Clerk handles auth
      isActive: true,
    },
  });
}

export function getRoleRedirectPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    landlord: '/dashboard/properties',
    tenant: '/dashboard/search',
    agent: '/dashboard/pipeline',
    admin: '/admin',
    estate_manager: '/estate-manager/portfolio',
  };
  return paths[role] ?? '/dashboard';
}

export async function getCurrentUserWithProfile() {
  const { userId } = auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      ownedOrganisations: true,
      orgMemberships: {
        where: { status: 'active' },
        include: { organisation: true },
      },
    },
  });

  return user;
}

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

// Roles a user may end up with via signup/onboarding. 'admin' is excluded on
// purpose: it can only be granted through the admin-guarded change-role route.
const SELF_ASSIGNABLE_ROLES: UserRole[] = ['landlord', 'tenant', 'agent', 'estate_manager'];


async function ensurePrismaUserFromClerk() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  // publicMetadata only. unsafeMetadata is writable by the end user from the
  // browser, so it must never determine authorization state. 'admin' is never
  // self-assignable; it is granted only through the admin-guarded route.
  const claimedRole = clerkUser.publicMetadata?.role as UserRole | undefined;
  const role: UserRole =
    claimedRole && claimedRole !== 'admin' && SELF_ASSIGNABLE_ROLES.includes(claimedRole)
      ? claimedRole
      : 'tenant';
  const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;
  const phone = clerkUser.phoneNumbers[0]?.phoneNumber ?? null;

  // NOTE: `role` is deliberately absent here. This object is used for UPDATES of
  // existing users, and re-applying a metadata-derived role on every request
  // would clobber legitimate role changes and make any escalation sticky.
  const commonData = {
    email,
    fullName,
    avatarUrl: clerkUser.imageUrl,
    phone,
  };


  const byClerkId = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (byClerkId) {
    return prisma.user.update({ where: { clerkId: clerkUser.id }, data: commonData });
  }

  const byEmail = email ? await prisma.user.findFirst({ where: { email } }) : null;
  if (byEmail) {
    return prisma.user.update({ where: { id: byEmail.id }, data: { ...commonData, clerkId: clerkUser.id } });
  }

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      ...commonData,
      role,
      isActive: true,
      isBanned: false,
    },
  });
}

export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      user = await ensurePrismaUserFromClerk();
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;
      console.error('getCurrentUser fallback: database unavailable, cannot resolve Prisma user id for', clerkUser.id);
      return null;
    } catch {
      return null;
    }
  }
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
  const { userId } = await auth();
  return userId;
}

export async function syncClerkUser(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;

  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (existing) {
    return prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        email,
        fullName,
        avatarUrl: clerkUser.imageUrl,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
        updatedAt: new Date(),
      },
    });
  }

  const byEmail = email ? await prisma.user.findFirst({ where: { email } }) : null;
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId: clerkUser.id,
        email,
        fullName,
        avatarUrl: clerkUser.imageUrl,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
        updatedAt: new Date(),
      },
    });
  }

  const claimedRole = clerkUser.publicMetadata?.role as UserRole | undefined;
  const role: UserRole =
    claimedRole && claimedRole !== 'admin' && SELF_ASSIGNABLE_ROLES.includes(claimedRole)
      ? claimedRole
      : 'tenant';

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      fullName,
      avatarUrl: clerkUser.imageUrl,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
      role,
      password: 'clerk_managed',
      isActive: true,
    },
  });
}

export function getRoleRedirectPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/dashboard/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  return paths[role] ?? '/dashboard/tenant';
}

export async function getCurrentUserWithProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        ownedOrganisations: true,
        orgMemberships: {
          where: { status: 'active' },
          include: { org: true },
        },
      },
    });

    if (!user) {
      await ensurePrismaUserFromClerk();
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          ownedOrganisations: true,
          orgMemberships: {
            where: { status: 'active' },
            include: { org: true },
          },
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUserWithProfile:', error);
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;
      console.error('getCurrentUserWithProfile fallback: database unavailable, cannot resolve Prisma user id for', clerkUser.id);
      return null;
    } catch {
      return null;
    }
  }
}

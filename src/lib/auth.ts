'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

async function ensurePrismaUserFromClerk() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const role = (clerkUser.unsafeMetadata?.role as UserRole) ??
               (clerkUser.publicMetadata?.role as UserRole) ??
               'tenant';
  const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;
  const phone = clerkUser.phoneNumbers[0]?.phoneNumber ?? null;

  const commonData = {
    email,
    fullName,
    avatarUrl: clerkUser.imageUrl,
    phone,
    role,
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
      isActive: true,
      isBanned: false,
    },
  });
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    user = await ensurePrismaUserFromClerk();
  }

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

  const role = (clerkUser.unsafeMetadata?.role as UserRole) ??
               (clerkUser.publicMetadata?.role as UserRole) ??
               'tenant';

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
    realtor: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  return paths[role] ?? '/dashboard/tenant';
}

export async function getCurrentUserWithProfile() {
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
}

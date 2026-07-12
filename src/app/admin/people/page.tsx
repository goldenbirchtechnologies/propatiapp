import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PeopleClient from './PeopleClient';

export default async function AdminPeoplePage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  // Fetch all users across the platform for the people directory
  const users = await prisma.user.findMany({
    take: 200,
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      clerkId: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      idVerified: true,
      createdAt: true,
    },
  });

  const mapped = users.map((u) => ({
    id: u.clerkId ?? u.id,
    name: u.fullName,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl ?? null,
    verified: u.idVerified,
    joinedAt: u.createdAt ? u.createdAt.toISOString() : null,
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <PeopleClient initialPeople={mapped} />
    </DashboardShell>
  );
}

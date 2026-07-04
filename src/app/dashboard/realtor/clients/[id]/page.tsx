import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import RealtorClientDetailClient from './RealtorClientDetailClient';

export default async function RealtorClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const client = await prisma.user.findUnique({
    where: { id: params.id },
    select: ({
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      profileBio: true,
      createdAt: true,
      agreements: {
        where: { type: 'sale' },
        include: {
          listing: { select: { id: true, title: true, price: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    } as any),
  });

  if (!client) {
    notFound();
  }

  const data = (() => {
    const c = client as any;
    return {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      avatarUrl: c.avatarUrl,
      role: c.role,
      profileBio: c.profileBio,
      createdAt: (c.createdAt as any).toISOString(),
      deals: c.agreements.map((a: any) => ({
        id: a.id,
        property: a.listing?.title || '—',
        value: Number(a.listing?.price || 0),
        status: a.status,
        createdAt: (a.createdAt as any).toISOString(),
      })),
    };
  })();

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <RealtorClientDetailClient client={data as any} />
    </DashboardShell>
  );
}

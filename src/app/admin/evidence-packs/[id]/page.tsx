import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EvidencePackDetailClient from './EvidencePackDetailClient';
import type { EvidencePackDetail } from './EvidencePackDetailClient';

export const dynamic = 'force-dynamic';

export default async function AdminEvidencePackDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
    realtor: '/dashboard/agent',
  };
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  try {
    const evidencePack = await prisma.evidencePack.findUnique({
      where: { id: params.id },
      include: {
        dispute: {
          select: {
            id: true,
            type: true,
            status: true,
            description: true,
            resolution: true,
            createdAt: true,
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                propertyType: true,
                price: true,
                owner: { select: { fullName: true, email: true, phone: true } },
              },
            },
            raisedByUser: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
            lawFirmCase: {
              select: {
                id: true,
                status: true,
                fee: true,
                firm: { select: { id: true, name: true, cacNumber: true } },
              },
            },
          },
        },
        lawFirm: {
          select: { id: true, name: true, cacNumber: true, address: true, billingEmail: true },
        },
        exhibits: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            exhibitNumber: true,
            category: true,
            contentHash: true,
            title: true,
            description: true,
            url: true,
            sourceRecordId: true,
            sourceTable: true,
            sortOrder: true,
            createdAt: true,
          },
        },
        custodyEntries: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            stateHash: true,
            exhibitRef: true,
            note: true,
            ipAddress: true,
            createdAt: true,
          },
        },
      },
    });

    if (!evidencePack) {
      return (
        <DashboardShell
          navigation={ADMIN_NAVIGATION}
          userRole={user.role}
          userName={user.fullName}
          userAvatar={user.avatarUrl || undefined}
        >
          <EvidencePackDetailClient
            evidencePack={null}
            initialEmpty
          />
        </DashboardShell>
      );
    }

    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <EvidencePackDetailClient
          evidencePack={{
            ...evidencePack,
            createdAt:
              evidencePack.createdAt instanceof Date
                ? evidencePack.createdAt.toISOString()
                : evidencePack.createdAt,
            updatedAt:
              evidencePack.updatedAt instanceof Date
                ? evidencePack.updatedAt.toISOString()
                : evidencePack.updatedAt,
            sealedAt:
              evidencePack.sealedAt instanceof Date
                ? evidencePack.sealedAt.toISOString()
                : evidencePack.sealedAt,
            dispute: {
              ...evidencePack.dispute,
              createdAt:
                evidencePack.dispute.createdAt instanceof Date
                  ? evidencePack.dispute.createdAt.toISOString()
                  : evidencePack.dispute.createdAt,
            },
            exhibits: evidencePack.exhibits.map((ex) => ({
              ...ex,
              createdAt:
                ex.createdAt instanceof Date ? ex.createdAt.toISOString() : ex.createdAt,
            })),
            custodyEntries: evidencePack.custodyEntries.map((ce) => ({
              ...ce,
              createdAt:
                ce.createdAt instanceof Date ? ce.createdAt.toISOString() : ce.createdAt,
            })),
          } as EvidencePackDetail}
        />
      </DashboardShell>
    );
  } catch (error) {
    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <EvidencePackDetailClient
          evidencePack={null}
          initialError={
            error instanceof Error
              ? error.message
              : 'Failed to load evidence pack details'
          }
        />
      </DashboardShell>
    );
  }
}

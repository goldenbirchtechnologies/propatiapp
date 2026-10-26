import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentAgreementsClient from './AgentAgreementsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Agreements | PROPTI',
  description: 'View and manage all agreements across your assigned properties.',
};

export default async function AgentAgreementsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'agent') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'Agent';

  let agreements;
  try {
    // Fetch agreements where agent is directly assigned OR through AgentAssignment with proper scope
    agreements = await prisma.agreement.findMany({
      where: {
        OR: [
          { agentId: user.id },
          {
            listing: {
              assignments: {
                some: {
                  agentId: user.id,
                  status: 'active',
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('AgentAgreementsPage server data load error:', error);
    return (
      <DashboardShell
        navigation={AGENT_NAVIGATION}
        userRole={user.role}
        userName={displayName}
        userAvatar={user.avatarUrl || undefined}
      >
        <div className="rounded-lg border border-red-500/30 bg-destructive/5 p-6 text-center" role="alert">
          <p className="text-error font-medium mb-1">Unable to load agreements</p>
          <p className="text-sm text-on-surface-variant dark:text-surface-variant">
            Something went wrong while fetching your agreements. Please try again later.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const serializedAgreements = agreements.map((agr) => ({
    id: agr.id,
    type: agr.type,
    status: agr.status,
    createdAt: agr.createdAt?.toISOString() ?? new Date().toISOString(),
    listing: {
      id: agr.listing?.id ?? '',
      title: agr.listing?.title ?? 'Untitled',
      address: agr.listing?.address ?? '',
    },
    landlord: agr.landlord
      ? {
          id: agr.landlord.id,
          fullName: agr.landlord.fullName,
          email: agr.landlord.email,
        }
      : null,
    tenant: agr.tenant
      ? {
          id: agr.tenant.id,
          fullName: agr.tenant.fullName,
          email: agr.tenant.email,
        }
      : null,
    rentAmount: agr.rentAmount ? Number(agr.rentAmount) : 0,
    cautionDeposit: agr.cautionDeposit ? Number(agr.cautionDeposit) : 0,
    startDate: agr.startDate?.toISOString() ?? null,
    endDate: agr.endDate?.toISOString() ?? null,
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentAgreementsClient agreements={serializedAgreements} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
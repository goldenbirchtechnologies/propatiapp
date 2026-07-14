import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgreementDetailClient from './AgreementDetailClient';

export default async function AdminAgreementDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

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

  // Fetch agreement with all related data
  const agreement = await prisma.agreement.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      type: true,
      status: true,
      startDate: true,
      endDate: true,
      rentAmount: true,
      rentPeriod: true,
      cautionDeposit: true,
      serviceCharge: true,
      noticePeriodDays: true,
      specialClauses: true,
      riskTier: true,
      jurisdictionState: true,
      governingStatute: true,
      headTenantVerified: true,
      lockStatus: true,
      finalizedAt: true,
      createdAt: true,
      pdfUrl: true,
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          area: true,
          state: true,
          price: true,
          propertyType: true,
          images: { where: { isCover: true }, take: 1 },
        },
      },
      landlord: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      tenant: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      agent: {
        select: { id: true, fullName: true, email: true },
      },
      signatures: {
        include: {
          signer: { select: { id: true, fullName: true, email: true } },
        },
      },
      stampDuty: {
        select: {
          id: true,
          amount: true,
          status: true,
          remitaRrr: true,
          certificateHash: true,
          agreementPdfHash: true,
          linkageHash: true,
        },
      },
      rentSchedule: {
        select: {
          id: true,
          amount: true,
          dueDate: true,
          paidAt: true,
          status: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 12,
      },
      transactions: {
        select: {
          id: true,
          amount: true,
          status: true,
          type: true,
          createdAt: true,
          payer: { select: { fullName: true } },
          payee: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!agreement) {
    redirect('/admin/agreements');
  }

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AgreementDetailClient agreement={agreement} />
    </DashboardShell>
  );
}
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AdminPaymentsClient from './AdminPaymentsClient';

export default async function AdminPaymentsPage() {
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

  const transactions = await prisma.transaction.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: {
      payer: { select: { id: true, fullName: true, email: true } },
      payee: { select: { id: true, fullName: true, email: true } },
      listing: { select: { id: true, title: true, address: true } },
    },
  });

  const mapped = transactions.map((txn) => {
    const { paystackData: _pd, ...rest } = txn as any;
    return {
      ...rest,
      amount: Number(txn.amount),
      platformFee: Number(txn.platformFee),
      agentCommission: Number(txn.agentCommission),
      payeeAmount: txn.payeeAmount ? Number(txn.payeeAmount) : null,
      paidAt: txn.paidAt instanceof Date ? txn.paidAt.toISOString() : txn.paidAt,
      createdAt: txn.createdAt instanceof Date ? txn.createdAt.toISOString() : txn.createdAt,
      updatedAt: txn.updatedAt instanceof Date ? txn.updatedAt.toISOString() : txn.updatedAt,
    };
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AdminPaymentsClient initialTransactions={mapped} />
    </DashboardShell>
  );
}

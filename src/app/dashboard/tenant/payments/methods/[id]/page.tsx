import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import AddPaymentMethodClient from '@/app/dashboard/tenant/payments/methods/[id]/AddPaymentMethodClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AddPaymentMethodPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  // In real implementation, id refers to 'card' or 'bank'; validated server-side
  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AddPaymentMethodClient methodType={id} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantProfileClient from './TenantProfileClient';

export default async function TenantProfilePage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const initialUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    profileBio: user.profileBio ?? null,
    employmentStatus: (user as unknown as { employmentStatus: string | null }).employmentStatus ?? null,
    employmentType: (user as unknown as { employmentType: string | null }).employmentType ?? null,
    employerName: (user as unknown as { employerName: string | null }).employerName ?? null,
    jobTitle: (user as unknown as { jobTitle: string | null }).jobTitle ?? null,
    yearlyIncome: (user as unknown as { yearlyIncome: bigint | null }).yearlyIncome
      ? Number((user as unknown as { yearlyIncome: bigint }).yearlyIncome)
      : null,
    idVerified: (user as unknown as { idVerified: boolean }).idVerified ?? false,
    ninVerified: (user as unknown as { ninVerified: boolean }).ninVerified ?? false,
    phoneVerified: (user as unknown as { phoneVerified: boolean }).phoneVerified ?? false,
    guarantorName: (user as unknown as { guarantorName: string | null }).guarantorName ?? null,
    guarantorPhone: (user as unknown as { guarantorPhone: string | null }).guarantorPhone ?? null,
    guarantorRelationship: (user as unknown as { guarantorRelationship: string | null }).guarantorRelationship ?? null,
  };

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantProfileClient initialUser={initialUser} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

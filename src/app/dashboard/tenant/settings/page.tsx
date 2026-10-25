import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantSettingsClient from './TenantSettingsClient';

export default async function TenantSettingsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');
  const initialUser = {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? null,
  };
  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <TenantSettingsClient initialUser={initialUser} />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
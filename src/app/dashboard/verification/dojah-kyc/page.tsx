import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  TENANT_NAVIGATION,
  AGENT_NAVIGATION,
  LANDLORD_NAVIGATION,
  ADMIN_NAVIGATION,
  ESTATE_MANAGER_NAVIGATION,
  ACCOUNTANT_NAVIGATION,
} from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import VerificationDojahPadClient from './VerificationDojahPadClient';
import { PageHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function VerificationDojahKycPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const navigation =
    user.role.toLowerCase() === 'landlord'
      ? LANDLORD_NAVIGATION
      : user.role.toLowerCase() === 'agent'
        ? AGENT_NAVIGATION
        : user.role.toLowerCase() === 'admin'
          ? ADMIN_NAVIGATION
          : user.role.toLowerCase() === 'estate_manager'
            ? ESTATE_MANAGER_NAVIGATION
            : user.role.toLowerCase() === 'accountant'
              ? ACCOUNTANT_NAVIGATION
              : TENANT_NAVIGATION;

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName || 'User'}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="p-6 space-y-6">
        <PageHeader
          title="KYC Verification"
          description="Complete your KYC verification with Dojah to access all platform features."
          breadcrumb={['Verification', 'Dojah KYC']}
        />
        <ErrorBoundary>
          <VerificationDojahPadClient _userId={user.id} />
        </ErrorBoundary>
      </div>
    </DashboardShell>
  );
}

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
import VerificationGuideClient from './VerificationGuideClient';

export const dynamic = 'force-dynamic';

export default async function VerificationGuidePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const sp = await searchParams;
  const listingId = sp.listingId as string | undefined;
  const rawType = (sp.type as string | undefined) || (user.role.toLowerCase() === 'tenant' || user.role.toLowerCase() === 'accountant' ? 'identity' : 'property');
  const type = (rawType || 'property') as 'property' | 'identity' | 'company' | 'professional';

  if (type === 'identity') {
    redirect('/dashboard/verification/dojah-kyc');
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
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Verification Guide
            </h1>
            <p className="text-muted-foreground mt-1">
              How verification works and what to expect for your selected type.
            </p>
          </div>
          <VerificationGuideClient listingId={listingId || null} type={type || 'property'} />
        </div>
    
      </ErrorBoundary>
    </DashboardShell>
  );
}

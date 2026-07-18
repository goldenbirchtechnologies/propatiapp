import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION, LANDLORD_NAVIGATION } from '@/lib/navigation';
import AgreementDetailClient from './AgreementDetailClient';

export default async function AgreementDetailLayout({
  params,
  children,
}: {
  params: Promise<{ role: string; id: string }>;
  children: React.ReactNode;
}) {
  // Server-side auth check
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  const { role } = await params;
  const validRole = role === 'landlord' ? 'landlord' : 'tenant';
  const navigation = validRole === 'landlord' ? LANDLORD_NAVIGATION : TENANT_NAVIGATION;

  return (
    <DashboardShell
      navigation={navigation}
      userRole={validRole}
      userName={user.fullName || (validRole === 'landlord' ? 'Landlord' : 'Tenant')}
      userAvatar={user.avatarUrl || undefined}
    >
      {children}
    </DashboardShell>
  );
}

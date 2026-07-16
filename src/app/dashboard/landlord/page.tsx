import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import LandlordDashboardClient from './LandlordDashboardClient';

export default async function LandlordDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  const displayName = user.fullName || 'User';

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <div className="dashboard-content-area fade-up">
        <LandlordDashboardClient userName={displayName} />
      </div>
    </DashboardShell>
  );
}

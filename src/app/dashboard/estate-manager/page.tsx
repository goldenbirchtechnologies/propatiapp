import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EstateCommandClient from './EstateCommandClient';

export const dynamic = 'force-dynamic';

export default async function EstateManagerDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'estate_manager') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'Estate Manager';

  return <EstateCommandClient userName={displayName} />;
}

import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  redirect(getRoleRedirectPath(user.role));
}

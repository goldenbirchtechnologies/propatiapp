import { getCurrentUser } from '@/lib/auth';
import { getRoleRedirectPath } from '@/lib/redirects';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  redirect(getRoleRedirectPath(user.role));
}

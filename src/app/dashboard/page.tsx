import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { resolveAuthUserId } from '@/lib/auth-bypass';

export default async function DashboardRootPage() {
  const userId = await resolveAuthUserId();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleRedirectPath(user.role));
  }

  // Authenticated with Clerk, but Prisma user is not resolvable yet.
  // Avoid redirecting the user away from the dashboard on a transient
  // session/provisioning gap; a refresh or client-side retry can resolve it.
  return null;
}

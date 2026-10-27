import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { resolveAuthUserId } from '@/lib/auth-bypass';
import DashboardLandingClient from './DashboardLandingClient';

export default async function DashboardRootPage() {
  const userId = await resolveAuthUserId();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleRedirectPath(user.role));
  }

  // Clerk is authenticated but Prisma has not created (or cannot resolve)
  // the user yet — webhook latency, a transient DB blip, or a migration gap.
  // Render a client component that retries provisioning rather than a blank.
  return <DashboardLandingClient />;
}

import { auth } from '@clerk/nextjs/server';
import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUser();

  const target = user ? getRoleRedirectPath(user.role) : '/sign-in';
  redirect(target);
}

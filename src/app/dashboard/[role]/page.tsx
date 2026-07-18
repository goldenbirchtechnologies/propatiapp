import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  const { role } = await params;

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/dashboard/admin',
    'estate-manager': '/dashboard/estate-manager',
  };

  const target = rolePaths[role.toLowerCase()] ?? getRoleRedirectPath(user.role);
  redirect(target);
}

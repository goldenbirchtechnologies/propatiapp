import { UserRole } from '@prisma/client';

export function getRoleRedirectPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  return paths[role] ?? '/dashboard/tenant';
}

import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ActiveOrganizationProvider } from '@/contexts/ActiveOrganizationContext';

export default async function EstateManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'estate_manager') {
    redirect(getRoleRedirectPath(user.role));
  }

  const initialOrganizations = [...(user.ownedOrganisations || []), ...(user.orgMemberships?.map(m => m.org) || [])];
  const initialOrganization = initialOrganizations[0] || null;

  return (
    <ActiveOrganizationProvider
      initialOrganizations={initialOrganizations}
      initialOrganization={initialOrganization}
    >
      {children}
    </ActiveOrganizationProvider>
  );
}

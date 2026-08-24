import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getRoleRedirectPath } from '@/lib/redirects';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        redirect('/sign-in');
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
      const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;
      const phone = clerkUser.phoneNumbers[0]?.phoneNumber ?? null;
      const role = (clerkUser.unsafeMetadata?.role as 'landlord' | 'tenant' | 'agent' | 'admin' | 'estate_manager') ??
                   (clerkUser.publicMetadata?.role as 'landlord' | 'tenant' | 'agent' | 'admin' | 'estate_manager') ??
                   'tenant';

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          fullName,
          phone,
          role,
          password: 'clerk_managed',
          isActive: true,
          isBanned: false,
        },
      });
    } catch {
      redirect('/sign-in');
    }
  }

  redirect(getRoleRedirectPath(user.role));
}

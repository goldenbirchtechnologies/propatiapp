import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auth guard - server-side redirect guarantees children render only for
  // authenticated users without any infinite-render risk (no state/effects).
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }
  return <>{children}</>;
}

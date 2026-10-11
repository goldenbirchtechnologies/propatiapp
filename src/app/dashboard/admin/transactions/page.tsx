import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';

export default async function AdminTransactionsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole={user.role} userName={user.fullName || 'Admin'} userAvatar={user.avatarUrl || undefined}>
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-900 dark:text-white">Transactions</h3>
        </div>
        <div className="p-6">
          <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">Use the sidebar links to view escrow or withdrawal transactions.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
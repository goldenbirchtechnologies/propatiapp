import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import RentAndPaymentsHub, { type TabItem } from '@/components/financials/RentAndPaymentsHub';
import { TabsContent } from '@/components/ui/tabs';
import TenantPaymentsClient from './TenantPaymentsClient';

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'receipts', label: 'Receipts' },
];

export default async function TenantPaymentsPage() {
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <RentAndPaymentsHub tabs={tabs}>
          <TabsContent value="overview">
            <TenantPaymentsClient userId={user.id} />
          </TabsContent>
          <TabsContent value="invoices">
            <PlaceholderTab title="Invoices" description="Your invoice statements will appear here." />
          </TabsContent>
          <TabsContent value="receipts">
            <PlaceholderTab title="Receipts" description="Payment receipts will appear here." />
          </TabsContent>
        </RentAndPaymentsHub>
      </ErrorBoundary>
    </DashboardShell>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border p-10 text-center">
      <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
      <p className="text-base text-muted-foreground mt-2">{description}</p>
    </div>
  );
}

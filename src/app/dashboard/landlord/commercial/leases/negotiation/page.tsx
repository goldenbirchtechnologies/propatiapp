import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Lease Negotiation – Landlord',
  description: 'Commercial lease negotiation workspace.',
};

export default async function CommercialLeaseNegotiationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: {
      landlordId: user.id,
      status: { in: ['review_required', 'pending_signature'] },
    },
    include: {
      tenant: { select: { fullName: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const agr = agreements[0];

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          {agreements.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 dark:text-zinc-400">No agreements in negotiation.</div>
          ) : (
            <section className="flex flex-col gap-6 overflow-y-auto pr-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-primary">{agr.listing.title}</h2>
                  </div>
                  <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {agr.tenant.fullName}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-4 py-1 bg-secondary-container/20 text-secondary border border-secondary rounded-full text-xs font-medium">Active Negotiation</span>
                  <p className="text-xs text-on-surface-variant mt-1">Ref ID: {agr.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 gap-4 bg-primary-container p-6 rounded-xl text-on-primary border border-outline/20">
                  <div className="font-semibold flex items-center gap-2"><span className="material-symbols-outlined">fact_check</span> Key Terms</div>
                  <div className="text-center text-sm opacity-70">Original Listing</div>
                  <div className="text-center text-sm text-secondary-container">Proposed Counter</div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary">Annual Rent</span>
                    <span className="text-xs text-on-surface-variant">Total</span>
                  </div>
                  <div className="flex items-center justify-center text-on-surface-variant">Negotiable</div>
                  <div className="flex items-center justify-center font-semibold text-secondary bg-secondary-container/10 border border-secondary/20 rounded-lg">
                    {agr.rentAmount ? `₦${Number(agr.rentAmount).toLocaleString()}` : 'Negotiable'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary">Lease Term</span>
                    <span className="text-xs text-on-surface-variant">Commitment Period</span>
                  </div>
                  <div className="flex items-center justify-center text-on-surface-variant">—</div>
                  <div className="flex items-center justify-center font-semibold text-secondary bg-secondary-container/10 border border-secondary/20 rounded-lg">
                    {agr.startDate ? new Date(agr.startDate).toLocaleDateString('en-NG') : '—'} → {agr.endDate ? new Date(agr.endDate).toLocaleDateString('en-NG') : '—'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary">Deposit</span>
                    <span className="text-xs text-on-surface-variant">Caution Deposit</span>
                  </div>
                  <div className="flex items-center justify-center text-on-surface-variant">—</div>
                  <div className="flex items-center justify-center text-on-surface-variant border border-outline-variant rounded-lg border-dashed">
                    {agr.cautionDeposit ? `₦${Number(agr.cautionDeposit).toLocaleString()}` : '—'}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-container border-2 border-primary/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary text-white rounded-xl"><span className="material-symbols-outlined">draw</span></div>
                  <div>
                    <p className="font-semibold text-lg">Finalize Negotiation</p>
                    <p className="text-sm text-on-surface-variant">Status: {agr.status.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 font-bold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors">Submit Counter-Offer</button>
                  <button className="px-6 py-3 font-bold bg-primary text-on-primary rounded-xl shadow-lg active:scale-95 transition-all">Accept Proposed Terms</button>
                </div>
              </div>
            </section>
          )
        }
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatNaira, formatDateLong } from '@/lib/utils';
import { FileText, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatBytes(value: bigint | null): string {
  if (!value) return '—';
  const n = Number(value);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function EstateManagerLeaseNegotiationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'estate_manager') redirect('/dashboard');

  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id, status: 'active' },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const agreement = orgIds.length
    ? await prisma.agreement.findFirst({
        where: {
          listing: { orgListings: { some: { orgId: { in: orgIds } } } },
          status: { in: ['draft', 'pending_landlord', 'pending_tenant'] },
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          status: true,
          rentAmount: true,
          rentPeriod: true,
          serviceCharge: true,
          cautionDeposit: true,
          startDate: true,
          endDate: true,
          listing: {
            select: { id: true, title: true, price: true, pricePeriod: true, serviceCharge: true, cautionDeposit: true },
          },
        },
      })
    : null;

  const documents = agreement?.listing
    ? await prisma.document.findMany({
        where: { listingId: agreement.listing.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, url: true, sizeBytes: true, createdAt: true, type: true },
      })
    : [];

  const terms = agreement
    ? [
        {
          term: 'Annual Rent',
          original: agreement.listing.price ? `${formatNaira(Number(agreement.listing.price))}${agreement.listing.pricePeriod ? ` /${agreement.listing.pricePeriod}` : ''}` : '—',
          proposed: agreement.rentAmount ? `${formatNaira(Number(agreement.rentAmount))}${agreement.rentPeriod ? ` /${agreement.rentPeriod}` : ''}` : '—',
        },
        {
          term: 'Lease Duration',
          original: 'Per listing terms',
          proposed: agreement.startDate && agreement.endDate
            ? `${formatDateLong(agreement.startDate)} → ${formatDateLong(agreement.endDate)}`
            : 'Not set',
        },
        {
          term: 'Service Charge',
          original: agreement.listing.serviceCharge ? formatNaira(Number(agreement.listing.serviceCharge)) : '—',
          proposed: agreement.serviceCharge ? formatNaira(Number(agreement.serviceCharge)) : '—',
        },
        {
          term: 'Security Deposit',
          original: agreement.listing.cautionDeposit ? formatNaira(Number(agreement.listing.cautionDeposit)) : '—',
          proposed: agreement.cautionDeposit ? formatNaira(Number(agreement.cautionDeposit)) : '—',
        },
      ]
    : [];

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="font-bold text-zinc-900 dark:text-white">Lease Negotiation</h1>
            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {agreement?.listing?.title ?? 'No agreement currently in negotiation'}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-none dark:border-white/[0.08] dark:bg-zinc-900">
            <div className="border-b border-zinc-200 bg-surface p-5 dark:border-white/[0.08]">
              <h3 className="font-bold text-zinc-900 dark:text-white">Term Sheet Comparison</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Original listing vs proposed counter-offer
              </p>
            </div>
            {terms.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No agreement is currently in negotiation. Terms appear here once a lease is drafted or awaiting signature.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="border-b border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900">
                    <tr>
                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Term</th>
                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Original Listing</th>
                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-zinc-900 dark:text-white">Proposed Counter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                    {terms.map((item) => (
                      <tr key={item.term} className="transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                        <td className="px-5 py-4 text-sm font-medium text-zinc-900 dark:text-white">{item.term}</td>
                        <td className="px-5 py-4 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{item.original}</td>
                        <td className="px-5 py-4 text-sm font-medium text-zinc-900 dark:text-white">{item.proposed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 p-5 shadow-none dark:border-white/[0.08]">
            <h3 className="mb-4 font-bold text-zinc-900 dark:text-white">Negotiation Documents</h3>
            {documents.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No documents have been uploaded for this listing.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-surface p-3 dark:border-white/[0.08]">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">{doc.name}</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          {doc.type} · {formatDateLong(doc.createdAt)} · {formatBytes(doc.sizeBytes)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
                      aria-label={`Download ${doc.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}

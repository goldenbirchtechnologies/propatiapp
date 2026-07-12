import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FrozenState } from '@/components/feedback/FrozenState';

export const metadata = {
  title: 'Verification Frozen — PROPATI',
};

export default async function VerificationFrozenPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const frozenVerifications = await prisma.verification.findMany({
    where: {
      ownerId: user.id,
      overallStatus: 'frozen',
    },
    include: {
      listing: {
        select: { id: true, title: true },
      },
    },
    orderBy: { frozenAt: 'desc' },
  });

  const primary = frozenVerifications[0];
  const reason = primary?.frozenReason || 'Your verification has been temporarily frozen. Please reach out to resolve this.';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <FrozenState
          title={primary?.listing?.title ? `${primary.listing.title} — Verification Frozen` : 'Verification Frozen'}
          description={reason}
          ticketHref="/support"
          ticketLabel="Open a ticket"
          appealHref="/appeal"
          appealLabel="Submit an appeal"
        />
        {frozenVerifications.length > 1 && (
          <div className="mt-8 space-y-4">
            {frozenVerifications.slice(1).map((v) => (
              <FrozenState
                key={v.id}
                title={v.listing?.title ? `${v.listing.title} — Frozen` : 'Verification Frozen'}
                description={v.frozenReason || 'Frozen'}
                ticketHref="/support"
                ticketLabel="Open a ticket"
                appealHref="/appeal"
                appealLabel="Submit an appeal"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

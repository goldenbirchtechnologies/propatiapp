import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VERIFICATION_TYPES = [
  {
    key: 'property',
    title: 'Property Verification',
    description: 'Verify ownership, documents, and physical inspection of a property.',
    href: '/dashboard/verification/guide?type=property',
    icon: '🏠',
  },
  {
    key: 'identity',
    title: 'Identity Verification',
    description: 'Verify your identity via NIN/BVN and government-issued ID.',
    href: '/dashboard/verification/guide?type=identity',
    icon: '🪪',
  },
  {
    key: 'company',
    title: 'Company / Business Verification',
    description: 'Verify business registration with CAC, TIN, and company documents.',
    href: '/dashboard/verification/guide?type=company',
    icon: '🏢',
  },
  {
    key: 'professional',
    title: 'Professional Verification',
    description: 'Verify professional credentials, licenses, and certifications.',
    href: '/dashboard/verification/guide?type=professional',
    icon: '📜',
  },
];

export default async function VerificationHubPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  let verificationsError: string | null = null;
  let verifications: { id: string; type: string; overallStatus: string; createdAt: Date }[] = [];

  try {
    verifications = await prisma.verification.findMany({
      where: { ownerId: user.id },
      select: { id: true, type: true, overallStatus: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  } catch {
    verificationsError = 'Failed to load verifications';
  }

  if (verificationsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verification Center</h1>
          <p className="text-muted-foreground mt-1">{verificationsError}</p>
        </div>
        <button
          type="button"
          className="underline"
          onClick={() => {
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const latestByType = new Map<string, (typeof verifications)[number]>();
  for (const v of verifications) {
    if (!latestByType.has(v.type)) latestByType.set(v.type, v);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Verification Center</h1>
        <p className="text-muted-foreground mt-1">
          Choose a verification type to begin or continue your application.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {VERIFICATION_TYPES.map((item) => {
          const existing = latestByType.get(item.key);
          return (
            <a
              key={item.key}
              href={item.href}
              className="rounded-lg border border-border p-5 transition hover:border-foreground"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="text-2xl">{item.icon}</span>
              </div>
              {existing && (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status: {existing.overallStatus.replace(/_/g, ' ')}</span>
                  <span>{new Date(existing.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

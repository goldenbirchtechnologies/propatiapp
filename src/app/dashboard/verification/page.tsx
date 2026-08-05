import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    description: 'Verify your identity via the Dojah widget. Complete NIN, ID, and liveness checks.',
    href: '/dashboard/verification/dojah-kyc',
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

const ROLE_VERIFICATION_TYPES: Record<string, typeof VERIFICATION_TYPES> = {
  tenant: VERIFICATION_TYPES.filter(item => item.key === 'identity'),
  landlord: VERIFICATION_TYPES.filter(item => item.key === 'property' || item.key === 'identity'),
  agent: VERIFICATION_TYPES.filter(item => item.key === 'professional' || item.key === 'identity'),
  estate_manager: VERIFICATION_TYPES.filter(item => item.key === 'company' || item.key === 'property' || item.key === 'identity'),
  accountant: VERIFICATION_TYPES.filter(item => item.key === 'identity'),
  admin: VERIFICATION_TYPES,
};

export default async function VerificationHubPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  const visibleTypes = ROLE_VERIFICATION_TYPES[user.role.toLowerCase()] || VERIFICATION_TYPES;

  let verificationsError: string | null = null;
  let verifications: { id: string; type: string; overallStatus: string; createdAt: Date }[] = [];

  try {
    verifications = await prisma.verification.findMany({
      where: { ownerId: user.id, type: { in: visibleTypes.map(item => item.key) } },
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
        {visibleTypes.map((item) => {
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

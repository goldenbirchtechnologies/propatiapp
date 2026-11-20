import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { tenantProfileSummary } from '@/lib/tenant-profile/completion';
import TenantProfileClient, { type TenantProfileData } from './TenantProfileClient';
import TenantProfileOverview from './TenantProfileOverview';

const iso = (d: Date | null | undefined): string | null =>
  d ? new Date(d).toISOString().slice(0, 10) : null;

/**
 * Loads the profile server-side so the first paint already holds the real
 * data — no client fetch, no empty form flashing before it fills in.
 */
export default async function TenantProfilePage({ searchParams }: { searchParams?: Promise<{ edit?: string }> }) {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const [dossier, addresses, emergencyContacts] = await Promise.all([
    prisma.rentalApplicationDossier.findUnique({ where: { userId: user.id } }),
    prisma.tenantAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isCurrent: 'desc' }, { sequence: 'asc' }],
    }),
    prisma.emergencyContact.findMany({
      where: { userId: user.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    }),
  ]);

  const u = user as unknown as {
    phone?: string | null;
    avatarUrl?: string | null;
    profileBio?: string | null;
    idType?: string | null;
    idVerified?: boolean;
    ninVerified?: boolean;
    phoneVerified?: boolean;
    incomeVerified?: boolean;
  };

  const verification = {
    idVerified: Boolean(u.idVerified),
    ninVerified: Boolean(u.ninVerified),
    phoneVerified: Boolean(u.phoneVerified),
    incomeVerified: Boolean(u.incomeVerified),
  };

  const completion = tenantProfileSummary({
    dossier: dossier ?? null,
    addresses,
    emergencyContacts,
    verification,
  });

  const numStr = (v: bigint | null | undefined) => (v === null || v === undefined ? '' : String(v));

  const data: TenantProfileData = {
    account: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: u.phone ?? null,
      avatarUrl: u.avatarUrl ?? null,
      idType: u.idType ?? null,
    },
    verification,
    personal: {
      dateOfBirth: iso(dossier?.dateOfBirth),
      gender: (dossier?.gender as TenantProfileData['personal']['gender']) ?? null,
      nationality: dossier?.nationality ?? null,
      stateOfResidence: dossier?.stateOfResidence ?? null,
      lga: dossier?.lga ?? null,
      maritalStatus: (dossier?.maritalStatus as TenantProfileData['personal']['maritalStatus']) ?? null,
    },
    employment: {
      employmentStatus:
        (dossier?.employmentStatus as TenantProfileData['employment']['employmentStatus']) ?? null,
      employmentType:
        (dossier?.employmentType as TenantProfileData['employment']['employmentType']) ?? null,
      employerName: dossier?.employerName ?? null,
      jobTitle: dossier?.jobTitle ?? null,
      yearsInEmployment: dossier?.yearsInEmployment ?? null,
      yearlyIncome: numStr(dossier?.yearlyIncome),
    },
    financial: { otherIncomeSources: dossier?.otherIncomeSources ?? null },
    guarantor: {
      guarantorName: dossier?.guarantorName ?? null,
      guarantorPhone: dossier?.guarantorPhone ?? null,
      guarantorEmail: dossier?.guarantorEmail ?? null,
      guarantorRelationship: dossier?.guarantorRelationship ?? null,
      guarantorOccupation: dossier?.guarantorOccupation ?? null,
      guarantorEmployer: dossier?.guarantorEmployer ?? null,
      guarantorAddress: dossier?.guarantorAddress ?? null,
    },
    nextOfKin: {
      nokName: dossier?.nokName ?? null,
      nokPhone: dossier?.nokPhone ?? null,
      nokRelationship: dossier?.nokRelationship ?? null,
    },
    address: {
      addressLine1: dossier?.addressLine1 ?? null,
      city: dossier?.city ?? null,
    },
    profileBio: u.profileBio ?? null,
    addresses: addresses.map((a) => ({
      addressLine1: a.addressLine1 ?? '',
      addressLine2: a.addressLine2 ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
      moveInDate: iso(a.moveInDate),
      moveOutDate: iso(a.moveOutDate),
      landlordName: a.landlordName ?? null,
      landlordPhone: a.landlordPhone ?? null,
      reasonForLeaving: a.reasonForLeaving ?? null,
    })),
    emergencyContacts: emergencyContacts.map((c) => ({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email ?? null,
      address: c.address ?? null,
    })),
    preferences: {
      preferredState: dossier?.preferredState ?? null,
      preferredBedrooms: dossier?.preferredBedrooms === null || dossier?.preferredBedrooms === undefined
        ? ''
        : String(dossier.preferredBedrooms),
      maxMonthlyBudget: numStr(dossier?.maxMonthlyBudget),
      preferredMoveInDate: iso(dossier?.preferredMoveInDate),
      pendingLeaseDuration:
        (dossier?.pendingLeaseDuration as TenantProfileData['preferences']['pendingLeaseDuration']) ?? null,
      occupants: dossier?.occupants === null || dossier?.occupants === undefined ? '' : String(dossier.occupants),
      hasPets: dossier?.hasPets ?? null,
      petsDetail: dossier?.petsDetail ?? null,
    },
    completion,
  };

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        {(await searchParams)?.edit === '1' ? <TenantProfileClient data={data} /> : <TenantProfileOverview data={data} />}
      </ErrorBoundary>
    </TenantRailShell>
  );
}

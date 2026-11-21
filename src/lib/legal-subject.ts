import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

type LegalSubjectType = 'individual' | 'joint' | 'company';

function cleanName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Creates or updates the legal subject represented by the primary onboarding
 * user. Identity verification remains attached to each person; this record
 * describes who owns or operates the money/property relationship.
 */
export async function syncLegalSubject(params: {
  primaryUserId: string;
  type: LegalSubjectType;
  name: string;
  registrationNumber?: string | null;
  members?: Array<{
    fullName: string;
    email?: string | null;
    role?: string;
    ownershipPercent?: number | null;
    userId?: string | null;
  }>;
}) {
  const name = cleanName(params.name);
  const primary = await prisma.user.findUnique({
    where: { id: params.primaryUserId },
    select: { idVerified: true },
  });
  const subject = await prisma.legalSubject.upsert({
    where: { primaryUserId_type: { primaryUserId: params.primaryUserId, type: params.type } },
    update: {
      name,
      registrationNumber: params.registrationNumber?.trim() || null,
      status: params.type === 'individual' && primary?.idVerified ? 'approved' : 'pending_verification',
    },
    create: {
      primaryUserId: params.primaryUserId,
      type: params.type,
      name,
      registrationNumber: params.registrationNumber?.trim() || null,
      status: params.type === 'individual' && primary?.idVerified ? 'approved' : 'pending_verification',
    },
  });

  if (params.members?.length) {
    for (const member of params.members) {
      const fullName = cleanName(member.fullName);
      if (!fullName) continue;
      const email = member.email?.trim().toLowerCase() || null;
      const existing = email
        ? await prisma.legalSubjectMember.findFirst({ where: { subjectId: subject.id, email } })
        : await prisma.legalSubjectMember.findFirst({
            where: { subjectId: subject.id, fullName, role: member.role || 'owner' },
          });

      const data = {
        fullName,
        email,
        role: member.role || 'owner',
        ownershipPercent: member.ownershipPercent ?? null,
        userId: member.userId ?? undefined,
        status: member.userId && member.userId === params.primaryUserId && primary?.idVerified
          ? 'verified'
          : member.userId
            ? 'pending_verification'
            : 'invited',
        verifiedAt: member.userId && member.userId === params.primaryUserId && primary?.idVerified ? new Date() : null,
        ...(existing || email || member.userId ? {} : { inviteToken: randomBytes(24).toString('hex') }),
      };

      if (existing) {
        await prisma.legalSubjectMember.update({ where: { id: existing.id }, data });
      } else {
        await prisma.legalSubjectMember.create({ data: { subjectId: subject.id, ...data } });
      }
    }
  }

  // Identity may have completed before the role-specific legal profile. Link
  // an already-created Paystack customer/DVA as soon as the legal subject is
  // known, without changing the provider account itself.
  await prisma.userPaystackAccount.updateMany({
    where: { userId: params.primaryUserId },
    data: { legalSubjectId: subject.id },
  });

  return subject;
}

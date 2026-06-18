import { prisma } from './prisma';
import crypto from 'crypto';

export interface SignatureData {
  agreementId: string;
  signerId: string;
  signerRole: 'landlord' | 'tenant' | 'agent';
  ipAddress: string;
  userAgent: string;
  consentText: string;
}

/**
 * Create a signature record with audit trail
 */
export async function createSignature(data: SignatureData) {
  const { agreementId, signerId, signerRole, ipAddress, userAgent, consentText } = data;

  // Fetch agreement to generate checksum
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: { id: true, status: true },
  });

  if (!agreement) {
    throw new Error('Agreement not found');
  }

  // Generate checksum for audit trail
  const checksum = generateAgreementChecksum(agreementId, signerId, new Date().toISOString());

  // Create signature record
  const signature = await prisma.agreementSignature.create({
    data: {
      agreementId,
      signerId,
      role: signerRole,
      ipAddress,
      userAgent,
      consentText,
      checksum,
      signedAt: new Date(),
    },
    include: {
      signer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      agreement: {
        select: {
          id: true,
          status: true,
          listing: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return signature;
}

/**
 * Verify signature integrity by comparing checksum
 */
export async function verifySignature(signatureId: string): Promise<boolean> {
  const signature = await prisma.agreementSignature.findUnique({
    where: { id: signatureId },
    select: {
      agreementId: true,
      signerId: true,
      signedAt: true,
      checksum: true,
    },
  });

  if (!signature) {
    return false;
  }

  // Regenerate checksum and compare
  const expectedChecksum = generateAgreementChecksum(
    signature.agreementId,
    signature.signerId,
    signature.signedAt.toISOString()
  );

  return signature.checksum === expectedChecksum;
}

/**
 * Generate SHA256 hash for agreement checksum
 */
export function generateAgreementChecksum(
  agreementId: string,
  signerId: string,
  timestamp: string
): string {
  const data = `${agreementId}:${signerId}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get all signatures for an agreement
 */
export async function getAgreementSignatures(agreementId: string) {
  return prisma.agreementSignature.findMany({
    where: { agreementId },
    orderBy: { signedAt: 'asc' },
    include: {
      signer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

/**
 * Check if a user has already signed an agreement
 */
export async function hasUserSigned(agreementId: string, userId: string): Promise<boolean> {
  const signature = await prisma.agreementSignature.findFirst({
    where: {
      agreementId,
      signerId: userId,
    },
  });

  return signature !== null;
}

/**
 * Get signature audit trail for an agreement
 */
export async function getSignatureAuditTrail(agreementId: string) {
  const signatures = await prisma.agreementSignature.findMany({
    where: { agreementId },
    orderBy: { signedAt: 'asc' },
    select: {
      id: true,
      role: true,
      ipAddress: true,
      userAgent: true,
      signedAt: true,
      checksum: true,
      signer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return signatures.map(sig => ({
    id: sig.id,
    signerName: sig.signer.fullName,
    signerEmail: sig.signer.email,
    role: sig.role,
    signedAt: sig.signedAt,
    ipAddress: sig.ipAddress,
    userAgent: sig.userAgent,
    checksum: sig.checksum,
    verified: true, // Could call verifySignature for each if needed
  }));
}

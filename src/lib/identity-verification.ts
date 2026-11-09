import { DojahApiError, getDojahService, type DojahIdType } from './dojah';
import {
  maskIdentifier,
  namesMatch,
  recordVerifiedIdentity,
  syncPaystackCustomerFromKyc,
  toVerifiedIdentity,
  type PaystackProvisionResult,
  type VerifiedIdentityRecord,
} from './verified-identity';

/**
 * The one place a NIN or BVN is verified.
 *
 * Both the onboarding identity step (`/api/onboarding/identity`) and the
 * standalone verification lookup (`/api/verification/dojah/lookup`) call this,
 * so the name check, the persistence rules and the Paystack sync can never
 * drift apart. It returns a result rather than throwing: callers translate the
 * failure into their own HTTP shape.
 */

export interface IdentitySubject {
  id: string;
  role: string;
  fullName?: string | null;
}

export interface IdentityLookupInput {
  idType: DojahIdType;
  idNumber: string;
  /** Falls back to the profile name when a caller only captured the number. */
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export type IdentityVerificationResult =
  | {
      ok: true;
      kycId: string;
      identity: VerifiedIdentityRecord;
      /** Masked for display; the plaintext never leaves this module. */
      idNumberMasked: string;
      paystack: PaystackProvisionResult;
    }
  | {
      ok: false;
      error: 'NOT_FOUND' | 'NAME_MISMATCH' | 'DOJAH_ERROR' | 'IDENTITY_ALREADY_LINKED' | 'LOOKUP_FAILED';
      message: string;
      status: number;
      mismatched?: string[];
      providerStatus?: number | null;
    };

function splitProfileName(fullName?: string | null): { firstName?: string; lastName?: string } {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  return { firstName: parts[0], lastName: parts[parts.length - 1] };
}

export async function verifyIdentityWithDojah(
  subject: IdentitySubject,
  input: IdentityLookupInput
): Promise<IdentityVerificationResult> {
  const profileName = splitProfileName(subject.fullName);
  const firstName = input.firstName || profileName.firstName;
  const lastName = input.lastName || profileName.lastName;

  try {
    const dojah = getDojahService();
    const identity =
      input.idType === 'nin'
        ? await dojah.lookupNIN(input.idNumber)
        : await dojah.lookupBVN(input.idNumber, {
            firstName,
            lastName,
            dateOfBirth: input.dateOfBirth,
          });

    // BVN Validate returns per-field confidence without the stored record, so a
    // returned confidence counts as "we found the record".
    const hasRecord = Boolean(
      identity.firstName || identity.lastName || identity.matchConfidence !== undefined
    );
    if (!hasRecord) {
      return {
        ok: false,
        error: 'NOT_FOUND',
        message: `No ${input.idType.toUpperCase()} record was found for that number.`,
        status: 422,
      };
    }

    const match = namesMatch({ firstName, lastName }, identity);
    const weakConfidence = identity.matchConfidence !== undefined && identity.matchConfidence < 50;
    if (!match.matched || weakConfidence) {
      return {
        ok: false,
        error: 'NAME_MISMATCH',
        message: 'The name on this ID does not match your account details.',
        status: 422,
        mismatched: match.mismatched,
      };
    }

    const record = toVerifiedIdentity(identity, 'dojah_direct');
    const { kycId } = await recordVerifiedIdentity({
      userId: subject.id,
      role: subject.role,
      identity: record,
    });

    // Push the proven name onto Paystack and mint the dedicated account in the
    // same pass: Paystack will not issue an account number without a BVN, so the
    // lookup's plaintext is handed over here rather than read back later. A
    // provisioning failure must never undo a successful verification.
    const paystack = await syncPaystackCustomerFromKyc(subject.id, {
      bvn: input.idType === 'bvn' ? input.idNumber : undefined,
    });

    return {
      ok: true,
      kycId,
      identity: record,
      idNumberMasked: maskIdentifier(input.idNumber) || '',
      paystack,
    };
  } catch (error) {
    if (error instanceof DojahApiError) {
      // Reachable provider, rejected number: that is the user's input, not an
      // outage of ours.
      const status = error.status === 400 || error.status === 404 ? 422 : 502;
      return {
        ok: false,
        error: 'DOJAH_ERROR',
        message: error.message,
        status,
        providerStatus: error.status ?? null,
      };
    }

    if (error instanceof Error && error.message === 'IDENTITY_ALREADY_LINKED') {
      return {
        ok: false,
        error: 'IDENTITY_ALREADY_LINKED',
        message: 'This identification number is already linked to another account.',
        status: 409,
      };
    }

    console.error('[identity-verification] Dojah lookup failed:', error);
    return {
      ok: false,
      error: 'LOOKUP_FAILED',
      message: 'Identity verification is temporarily unavailable. Please try again shortly.',
      status: 500,
    };
  }
}

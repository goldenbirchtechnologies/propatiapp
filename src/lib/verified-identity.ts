import { prisma } from './prisma';
import { paystack } from './paystack';
import { decryptSensitiveValue, encryptSensitiveValue, hashSensitiveValue } from './encryption';
import { KycStatus, Prisma } from '@prisma/client';
import type { DojahIdentity } from './dojah';

/**
 * The verified identity we keep once Dojah has confirmed a user.
 *
 * This is the single source the rest of the platform reads from: Paystack
 * customers are created with these names, and Remita stamp duty is initiated
 * with this payer name and phone, so the identity a user proved is the one
 * that ends up on the money rails.
 */
export interface VerifiedIdentityRecord {
  type: 'nin' | 'bvn';
  /** Only present in memory — persisted as ciphertext + hash, never as a plaintext field. */
  idNumber?: string;
  idNumberMasked?: string;
  idNumberHash?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  referenceId?: string;
  verifiedAt: string;
  source: 'dojah_direct' | 'dojah_widget';
}

/** NIN/BVN stay readable enough to confirm the right number without exposing it. */
export function maskIdentifier(value?: string | null): string | undefined {
  const trimmed = (value || '').trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= 4) return '*'.repeat(trimmed.length);
  return `${trimmed.slice(0, 2)}${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-2)}`;
}

export function toVerifiedIdentity(
  identity: DojahIdentity,
  source: VerifiedIdentityRecord['source']
): VerifiedIdentityRecord {
  return {
    type: identity.type,
    idNumber: identity.idNumber,
    firstName: identity.firstName,
    middleName: identity.middleName,
    lastName: identity.lastName,
    dateOfBirth: identity.dateOfBirth,
    gender: identity.gender,
    phone: identity.phone,
    referenceId: identity.referenceId,
    verifiedAt: identity.verifiedAt,
    source,
  };
}

function normalizeName(value?: string | null): string {
  return (value || '').toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Compare the names a user supplied with the names on the government record.
 * Missing values on either side are treated as "no opinion" rather than a
 * mismatch, so a field the provider did not return never blocks a real match.
 */
export function namesMatch(
  supplied: { firstName?: string; lastName?: string },
  record: { firstName?: string; lastName?: string }
): { matched: boolean; mismatched: string[] } {
  const mismatched: string[] = [];

  for (const field of ['firstName', 'lastName'] as const) {
    const a = normalizeName(supplied[field]);
    const b = normalizeName(record[field]);
    if (!a || !b) continue;
    if (a !== b) mismatched.push(field);
  }

  return { matched: mismatched.length === 0, mismatched };
}

/**
 * Read the BVN back out of its encrypted column.
 *
 * Returns undefined rather than throwing when the column is empty or the
 * ciphertext cannot be read, so one unreadable value degrades to "no BVN for
 * Paystack" instead of failing the whole sync.
 */
function decryptBvn(encrypted: string | null | undefined): string | undefined {
  if (!encrypted) return undefined;
  try {
    return decryptSensitiveValue(encrypted) || undefined;
  } catch (error) {
    console.error('[verified-identity] Could not decrypt stored BVN:', error);
    return undefined;
  }
}

function readIdentityFromMetadata(metadata: Prisma.JsonValue | null | undefined): VerifiedIdentityRecord | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const identity = (metadata as Record<string, unknown>).identity;
  if (!identity || typeof identity !== 'object' || Array.isArray(identity)) return null;
  const record = identity as Record<string, unknown>;
  if (record.type !== 'nin' && record.type !== 'bvn') return null;
  return record as unknown as VerifiedIdentityRecord;
}

/**
 * Persist a verified identity against the user: the KYC row moves to
 * `approved`, the user is flagged as ID-verified, and the verified phone is
 * adopted when the account has none.
 */
export async function recordVerifiedIdentity(params: {
  userId: string;
  role: string;
  identity: VerifiedIdentityRecord;
}): Promise<{ kycId: string; identity: VerifiedIdentityRecord }> {
  const { userId, role, identity } = params;

  const rawNumber = identity.idNumber?.trim();
  const encrypted = rawNumber ? encryptSensitiveValue(rawNumber) : undefined;
  const idNumberHash = identity.idNumberHash ?? (rawNumber ? hashSensitiveValue(rawNumber) : undefined);

  // The identity kept in JSON carries only a masked number; the real value
  // lives in the encrypted columns on User.
  const { idNumber: _plaintext, ...rest } = identity;
  const storedIdentity: VerifiedIdentityRecord = {
    ...rest,
    idNumberMasked: identity.idNumberMasked ?? maskIdentifier(rawNumber),
    ...(idNumberHash ? { idNumberHash } : {}),
  };

  const existing = await prisma.userKyc.findUnique({ where: { userId } });
  const existingMetadata =
    existing?.metadata && typeof existing.metadata === 'object' && !Array.isArray(existing.metadata)
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const metadata = {
    ...existingMetadata,
    identity: storedIdentity,
    verifiedVia: storedIdentity.source,
    verifiedAt: storedIdentity.verifiedAt,
  } as unknown as Prisma.InputJsonValue;

  const kyc = await prisma.userKyc.upsert({
    where: { userId },
    update: {
      status: KycStatus.approved,
      dojahRef: identity.referenceId ?? existing?.dojahRef ?? undefined,
      verifiedAt: new Date(identity.verifiedAt),
      rejectedAt: null,
      rejectionReason: null,
      metadata,
    },
    create: {
      userId,
      role,
      status: KycStatus.approved,
      level: 1,
      dojahRef: identity.referenceId ?? null,
      verifiedAt: new Date(identity.verifiedAt),
      metadata,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        idVerified: true,
        idType: identity.type,
        ...(encrypted ? { idNumberEnc: encrypted } : {}),
        ...(idNumberHash ? { idNumberHash } : {}),
        ...(identity.type === 'nin' && encrypted
          ? { ninEncrypted: encrypted, ninHash: idNumberHash, ninVerified: true }
          : {}),
        ...(identity.type === 'bvn' && encrypted ? { bvnEncrypted: encrypted } : {}),
        ...(user?.phone || !identity.phone ? {} : { phone: identity.phone }),
      },
    });
  } catch (error) {
    // ninHash / idNumberHash are unique: the same government id cannot be
    // attached to two accounts.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('IDENTITY_ALREADY_LINKED');
    }
    throw error;
  }

  return { kycId: kyc.id, identity: storedIdentity };
}

export interface PaystackProvisionResult {
  synced: boolean;
  customerCode?: string | null;
  /** The virtual account number the user can transfer into, once issued. */
  accountNumber?: string | null;
  accountName?: string | null;
  dedicatedAccountProvisioned?: boolean;
  /** Paystack's own reason when a customer or account could not be created. */
  reason?: string;
}

/**
 * Mirror the verified identity onto Paystack so checkout, dedicated accounts
 * and transfers all carry the name the user actually proved — and, once that
 * identity exists, mint the dedicated virtual account the user transfers into.
 *
 * `bvn` must be the number the provider verified. Paystack will not issue a
 * dedicated account for a customer without a validated BVN, and the plaintext
 * is deliberately never stored outside the encrypted User columns, so the
 * caller passes it straight from the lookup response.
 *
 * Nothing here throws: a Paystack refusal is reported in the result, because a
 * KYC pass must not be undone by a provisioning problem.
 */
export async function syncPaystackCustomerFromKyc(
  userId: string,
  opts?: { bvn?: string }
): Promise<PaystackProvisionResult> {
  const [user, kyc, existing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true, phone: true, bvnEncrypted: true },
    }),
    prisma.userKyc.findUnique({ where: { userId }, select: { metadata: true } }),
    prisma.userPaystackAccount.findUnique({ where: { userId } }),
  ]);

  if (!user) return { synced: false, reason: 'user_not_found' };

  const identity = readIdentityFromMetadata(kyc?.metadata ?? null);
  if (!identity) return { synced: false, reason: 'no_verified_identity' };

  const firstName = identity.firstName || existing?.firstName || undefined;
  const lastName = identity.lastName || existing?.lastName || undefined;
  const phone = identity.phone || existing?.phone || user.phone || undefined;

  // Prefer the BVN handed in from the live lookup; fall back to the encrypted
  // copy on the user so a retry path needs no plaintext of its own.
  const bvn = opts?.bvn || decryptBvn(user.bvnEncrypted);

  if (!paystack.isConfigured()) {
    await prisma.userPaystackAccount.upsert({
      where: { userId },
      update: { firstName, lastName, phone },
      create: {
        userId,
        email: existing?.email || user.email,
        firstName,
        lastName,
        phone,
        status: 'pending',
        currency: 'NGN',
      },
    });
    return { synced: false, reason: 'paystack_not_configured' };
  }

  try {
    let customerCode = existing?.customerCode ?? null;

    if (!customerCode) {
      const created = await paystack.createCustomer({
        email: existing?.email || user.email,
        first_name: firstName,
        last_name: lastName,
        phone,
        metadata: { userId, idType: identity.type },
      });
      if (created?.status && created.data?.customer_code) {
        customerCode = created.data.customer_code;
      }
    }

    const account = await prisma.userPaystackAccount.upsert({
      where: { userId },
      update: { firstName, lastName, phone, ...(customerCode ? { customerCode } : {}) },
      create: {
        userId,
        email: existing?.email || user.email,
        firstName,
        lastName,
        phone,
        customerCode,
        status: customerCode ? 'active' : 'pending',
        currency: 'NGN',
      },
    });

    // No customer, or an account number already minted: nothing left to do.
    if (!customerCode || account.accountNumber) {
      return {
        synced: Boolean(customerCode),
        customerCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        dedicatedAccountProvisioned: Boolean(account.accountNumber),
      };
    }

    // Where the user settles through a split, the account still receives but the
    // money lands on their subaccount's ledger.
    const dedicated = await paystack.createDedicatedAccount(customerCode, {
      subaccount: account.subaccountCode ?? undefined,
    });

    if (!dedicated?.status || !dedicated.data?.account_number) {
      return {
        synced: true,
        customerCode,
        dedicatedAccountProvisioned: false,
        reason: 'dedicated_account_not_issued',
      };
    }

    const updated = await prisma.userPaystackAccount.update({
      where: { userId },
      data: {
        bankName: dedicated.data.bank?.name ?? undefined,
        accountNumber: dedicated.data.account_number,
        accountName: dedicated.data.account_name,
        dedicatedAccountId: String(dedicated.data.id),
        status: 'active',
      },
    });

    return {
      synced: true,
      customerCode,
      accountNumber: updated.accountNumber,
      accountName: updated.accountName,
      dedicatedAccountProvisioned: true,
    };
  } catch (error) {
    console.error('[verified-identity] Paystack customer sync failed:', error);
    await prisma.userPaystackAccount.upsert({
      where: { userId },
      update: { firstName, lastName, phone },
      create: {
        userId,
        email: existing?.email || user.email,
        firstName,
        lastName,
        phone,
        status: 'pending',
        currency: 'NGN',
      },
    });
    return { synced: false, reason: 'paystack_error' };
  }
}

/**
 * Payer details for Remita stamp duty, preferring the verified identity over
 * whatever the user typed into their profile.
 */
export async function getVerifiedPayerIdentity(userId: string): Promise<{
  verified: boolean;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
} | null> {
  const [user, kyc] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true, phone: true },
    }),
    prisma.userKyc.findUnique({ where: { userId }, select: { status: true, metadata: true } }),
  ]);

  if (!user) return null;

  const identity =
    kyc?.status === KycStatus.approved ? readIdentityFromMetadata(kyc.metadata) : null;

  if (!identity) {
    return { verified: false, fullName: user.fullName, phone: user.phone ?? undefined, email: user.email };
  }

  const fullName = [identity.firstName, identity.lastName].filter(Boolean).join(' ') || user.fullName;

  return {
    verified: true,
    fullName,
    firstName: identity.firstName,
    lastName: identity.lastName,
    phone: identity.phone || user.phone || undefined,
    email: user.email,
  };
}

/** Platform's default share of a settlement split, in percent. */
export const DEFAULT_PLATFORM_PERCENTAGE_CHARGE = 10;

export type SubaccountResult =
  | {
      ok: true;
      subaccountCode: string;
      accountName: string;
      percentageCharge: number;
      /** False when Paystack accepted the subaccount but has not verified it yet. */
      verified: boolean;
    }
  | { ok: false; error: SubaccountError; message: string };

export type SubaccountError =
  | 'KYC_REQUIRED'
  | 'INVALID_ACCOUNT'
  | 'ACCOUNT_NAME_MISMATCH'
  | 'PAYSTACK_NOT_CONFIGURED'
  | 'SUBACCOUNT_REJECTED'
  | 'PAYSTACK_ERROR';

/**
 * Provision a Paystack subaccount for a user, so their collections settle
 * against their own ledger instead of the platform balance.
 *
 * The settlement account is resolved first and its name is matched against the
 * identity Dojah verified — otherwise anyone could point a subaccount at an
 * account they do not own and receive the rent. The subaccount is only created
 * once that check passes.
 *
 * Note: an existing dedicated account keeps the routing it was minted with.
 * Paystack fixes the split at creation, so this applies to accounts issued after
 * the subaccount exists.
 */
export async function provisionSubaccount(
  userId: string,
  params: {
    bankCode: string;
    accountNumber: string;
    /** Trading name; defaults to the verified name. */
    businessName?: string;
    percentageCharge?: number;
  }
): Promise<SubaccountResult> {
  const payer = await getVerifiedPayerIdentity(userId);
  if (!payer?.verified) {
    return {
      ok: false,
      error: 'KYC_REQUIRED',
      message: 'Verify your identity before adding a settlement account.',
    };
  }

  if (!paystack.isConfigured()) {
    return {
      ok: false,
      error: 'PAYSTACK_NOT_CONFIGURED',
      message: 'Payments are not configured on this environment.',
    };
  }

  let accountName: string;
  try {
    const resolved = await paystack.resolveAccountNumber(params.accountNumber, params.bankCode);
    accountName = String(resolved?.data?.account_name ?? '');
    if (!resolved?.status || !accountName) {
      return { ok: false, error: 'INVALID_ACCOUNT', message: 'That bank account could not be resolved.' };
    }
  } catch (error) {
    console.error('[verified-identity] Account resolution failed:', error);
    return {
      ok: false,
      error: 'INVALID_ACCOUNT',
      message: 'That bank account could not be resolved.',
    };
  }

  // Bank records read "SURNAME FIRSTNAME MIDDLENAME", so require the verified
  // surname to appear rather than an exact full-name match.
  const surname = normalizeName(payer.lastName);
  if (surname && !normalizeName(accountName).includes(surname)) {
    return {
      ok: false,
      error: 'ACCOUNT_NAME_MISMATCH',
      message: 'The account name does not match your verified identity.',
    };
  }

  const percentageCharge = params.percentageCharge ?? DEFAULT_PLATFORM_PERCENTAGE_CHARGE;

  try {
    const created = await paystack.createSubaccount({
      business_name: params.businessName || payer.fullName || accountName,
      settlement_bank: params.bankCode,
      account_number: params.accountNumber,
      percentage_charge: percentageCharge,
      primary_contact_email: payer.email,
      primary_contact_name: payer.fullName,
      primary_contact_phone: payer.phone,
      description: `Settlement account for ${payer.fullName ?? userId}`,
    });

    if (!created?.status || !created.data?.subaccount_code) {
      return {
        ok: false,
        error: 'SUBACCOUNT_REJECTED',
        message: created?.message || 'Paystack did not accept this settlement account.',
      };
    }

    await prisma.userPaystackAccount.upsert({
      where: { userId },
      update: {
        subaccountCode: created.data.subaccount_code,
        percentageCharge,
        accountName,
        bankName: typeof created.data.settlement_bank === 'string' ? created.data.settlement_bank : undefined,
      },
      create: {
        userId,
        email: payer.email ?? '',
        firstName: payer.firstName,
        lastName: payer.lastName,
        phone: payer.phone,
        subaccountCode: created.data.subaccount_code,
        percentageCharge,
        accountName,
        accountNumber: params.accountNumber,
        status: 'pending',
        currency: 'NGN',
      },
    });

    return {
      ok: true,
      subaccountCode: created.data.subaccount_code,
      accountName,
      percentageCharge,
      verified: Boolean(created.data.is_verified),
    };
  } catch (error) {
    console.error('[verified-identity] Subaccount creation failed:', error);
    return {
      ok: false,
      error: 'PAYSTACK_ERROR',
      message: error instanceof Error ? error.message : 'Could not create the settlement account.',
    };
  }
}

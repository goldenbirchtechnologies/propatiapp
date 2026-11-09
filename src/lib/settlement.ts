import { PaystackAccountStatus } from '@prisma/client';
import { prisma } from './prisma';
import { paystack } from './paystack';
import { resolveBank } from './banks';
import {
  DEFAULT_PLATFORM_PERCENTAGE_CHARGE,
  getVerifiedPayerIdentity,
  normalizeName,
} from './verified-identity';

/**
 * Settlement accounts, verified the way the rest of the platform expects.
 *
 * A settlement account is only safe to pay into once two things are true:
 * the NUBAN resolves at the bank, and the name it resolves to belongs to the
 * identity Dojah verified. The check runs here, on the server, so a crafted
 * request cannot point a landlord's rent at somebody else's account.
 *
 * Onboarding saves whatever the user submitted — a failed check leaves the
 * account `pending` rather than rejecting the step — but only a `verified`
 * account is allowed to receive payouts (see `isSettlementReady`).
 */

export type SettlementState =
  | 'verified'
  | 'pending'
  | 'mismatch'
  | 'unresolved'
  | 'no_identity'
  | 'not_configured';

export interface SettlementAttempt {
  state: SettlementState;
  /** The name Paystack resolved for the NUBAN, when it answered. */
  resolvedName?: string;
  /** What should be written to the role profile: resolved when known, else submitted. */
  storedName: string;
  bankName: string;
  bankCode: string;
  subaccountCode?: string | null;
  /** Shown to the user after a save that could not be fully verified. */
  message?: string;
}

export interface SettlementInput {
  accountNumber: string;
  bankCode?: string | null;
  bankName?: string | null;
  /** The account name as typed. Only used when Paystack cannot resolve. */
  submittedName?: string;
  /**
   * A settlement account must belong to the verified identity. Estate trust
   * accounts are corporate and legitimately carry the firm's name, so they set
   * this false and are only resolved, not name-matched.
   */
  requireNameMatch?: boolean;
  /** Register the Paystack subaccount splits route into. */
  createSubaccount?: boolean;
  businessName?: string;
  percentageCharge?: number;
}

function maskAccountNumber(accountNumber?: string | null): string | null {
  const digits = (accountNumber || '').replace(/\D/g, '');
  if (!digits) return null;
  return `•••• ${digits.slice(-4)}`;
}

/**
 * Does the resolved bank record carry the verified surname?
 *
 * Bank records print "SURNAME FIRSTNAME", so containment is the honest test —
 * an exact full-name comparison fails on almost every real account.
 */
export function nameMatchesIdentity(
  resolvedName: string,
  payer: { firstName?: string; lastName?: string; fullName?: string }
): boolean {
  const record = normalizeName(resolvedName);
  if (!record) return false;

  const surname = normalizeName(payer.lastName);
  if (surname && record.includes(surname)) return true;

  // Fall back to the full verified name when the surname is missing (a widget
  // record that only carried a display name).
  const full = normalizeName(payer.fullName);
  return Boolean(full && record.includes(full));
}

/** Store the attempt on the user's Paystack account row and return it. */
async function persistAttempt(
  userId: string,
  attempt: SettlementAttempt,
  opts: { accountNumber: string; percentageCharge: number }
): Promise<SettlementAttempt> {
  const status: PaystackAccountStatus =
    attempt.state === 'verified' ? PaystackAccountStatus.active : PaystackAccountStatus.pending;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return attempt;

    await prisma.userPaystackAccount.upsert({
      where: { userId },
      update: {
        bankName: attempt.bankName,
        accountNumber: opts.accountNumber,
        accountName: attempt.storedName,
        status,
        ...(attempt.subaccountCode ? { subaccountCode: attempt.subaccountCode } : {}),
        ...(attempt.state === 'verified' ? { percentageCharge: opts.percentageCharge } : {}),
      },
      create: {
        userId,
        email: user.email,
        bankName: attempt.bankName,
        accountNumber: opts.accountNumber,
        accountName: attempt.storedName,
        status,
        currency: 'NGN',
        ...(attempt.subaccountCode ? { subaccountCode: attempt.subaccountCode } : {}),
        ...(attempt.state === 'verified' ? { percentageCharge: opts.percentageCharge } : {}),
      },
    });
  } catch (error) {
    // Persisting the settlement mirrors a save that already succeeded; a write
    // problem here must not turn a stored profile into an error page.
    console.error('[settlement] Could not store settlement account:', error);
  }

  return attempt;
}

/**
 * Resolve, name-match and (optionally) provision a settlement account.
 *
 * Never throws: every failure is a `SettlementState` the caller can show next
 * to the saved account.
 */
export async function verifySettlementAccount(
  userId: string,
  input: SettlementInput
): Promise<SettlementAttempt> {
  const percentageCharge = input.percentageCharge ?? DEFAULT_PLATFORM_PERCENTAGE_CHARGE;
  const submittedName = (input.submittedName || '').trim();

  const bank = await resolveBank({ bankCode: input.bankCode, bankName: input.bankName });
  const bankName = bank?.name || (input.bankName || '').trim();
  const bankCode = bank?.code || (input.bankCode || '').trim();

  const base = {
    bankName,
    bankCode,
    storedName: submittedName,
  };

  if (!bankCode) {
    return persistAttempt(
      userId,
      {
        ...base,
        state: 'unresolved',
        message: 'That bank is not on our settlement list. Choose your bank from the list.',
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }

  if (!paystack.isConfigured()) {
    return persistAttempt(
      userId,
      {
        ...base,
        state: 'not_configured',
        message: 'Saved. Bank verification is unavailable right now, so payouts stay on hold.',
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }

  const payer = await getVerifiedPayerIdentity(userId);
  if (input.requireNameMatch && !payer?.verified) {
    return persistAttempt(
      userId,
      {
        ...base,
        state: 'no_identity',
        message: 'Saved. Verify your identity to finish linking this account.',
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }

  let resolvedName = '';
  try {
    const resolved = await paystack.resolveAccountNumber(input.accountNumber, bankCode);
    resolvedName = String(resolved?.data?.account_name ?? '').trim();
    if (!resolved?.status || !resolvedName) {
      return persistAttempt(
        userId,
        {
          ...base,
          state: 'unresolved',
          message: 'Saved. We could not confirm that account number — check it and try again.',
        },
        { accountNumber: input.accountNumber, percentageCharge }
      );
    }
  } catch (error) {
    console.error('[settlement] Account resolution failed:', error);
    return persistAttempt(
      userId,
      {
        ...base,
        state: 'unresolved',
        message: 'Saved. We could not confirm that account number — check it and try again.',
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }

  const storedName = resolvedName || submittedName;

  if (input.requireNameMatch && payer && !nameMatchesIdentity(resolvedName, payer)) {
    return persistAttempt(
      userId,
      {
        ...base,
        storedName,
        resolvedName,
        state: 'mismatch',
        message: `That account is registered to ${resolvedName}, which does not match your verified identity.`,
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }

  if (!input.createSubaccount) {
    return persistAttempt(
      userId,
      {
        ...base,
        storedName,
        resolvedName,
        state: 'verified',
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }

  // The account is good and belongs to the user: route their collections into
  // it. A Paystack refusal leaves the account pending, so nothing pays out into
  // a split that was never created.
  try {
    const created = await paystack.createSubaccount({
      business_name: input.businessName || payer?.fullName || resolvedName,
      settlement_bank: bankCode,
      account_number: input.accountNumber,
      percentage_charge: percentageCharge,
      primary_contact_email: payer?.email,
      primary_contact_name: payer?.fullName,
      primary_contact_phone: payer?.phone,
      description: 'Settlement account captured during onboarding',
    });

    if (!created?.status || !created.data?.subaccount_code) {
      return persistAttempt(
        userId,
        {
          ...base,
          storedName,
          resolvedName,
          state: 'pending',
          message: 'Saved. Paystack did not accept the settlement split yet — payouts stay on hold.',
        },
        { accountNumber: input.accountNumber, percentageCharge }
      );
    }

    return persistAttempt(
      userId,
      {
        ...base,
        storedName,
        resolvedName,
        state: 'verified',
        subaccountCode: created.data.subaccount_code,
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  } catch (error) {
    console.error('[settlement] Subaccount creation failed:', error);
    return persistAttempt(
      userId,
      {
        ...base,
        storedName,
        resolvedName,
        state: 'pending',
        message: 'Saved. Paystack did not accept the settlement split yet — payouts stay on hold.',
      },
      { accountNumber: input.accountNumber, percentageCharge }
    );
  }
}

/** Whether this user may receive a payout yet. */
export async function isSettlementReady(
  userId: string
): Promise<{ ready: boolean; reason?: 'missing' | 'unverified' }> {
  const account = await prisma.userPaystackAccount.findUnique({
    where: { userId },
    select: { accountNumber: true, subaccountCode: true, status: true },
  });

  if (!account?.accountNumber) return { ready: false, reason: 'missing' };
  const verified = account.status === PaystackAccountStatus.active && Boolean(account.subaccountCode);
  return verified ? { ready: true } : { ready: false, reason: 'unverified' };
}

export interface SettlementSummary {
  identity: {
    verified: boolean;
    status: string;
    idType: string | null;
    verifiedAt: Date | null;
  };
  settlement: {
    linked: boolean;
    state: 'verified' | 'pending' | 'missing';
    bankName: string | null;
    accountName: string | null;
    accountNumberMasked: string | null;
  };
}

/**
 * The dashboard's read of verification + settlement. One query pair, so every
 * role's dashboard and the verification hub show the same truth.
 */
export async function getSettlementSummary(userId: string): Promise<SettlementSummary> {
  const [user, kyc, account] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { idType: true, idVerified: true },
    }),
    prisma.userKyc.findUnique({
      where: { userId },
      select: { status: true, verifiedAt: true },
    }),
    prisma.userPaystackAccount.findUnique({
      where: { userId },
      select: {
        bankName: true,
        accountName: true,
        accountNumber: true,
        subaccountCode: true,
        status: true,
      },
    }),
  ]);

  const identityVerified = Boolean(user?.idVerified) || kyc?.status === 'approved';

  let state: SettlementSummary['settlement']['state'] = 'missing';
  if (account?.accountNumber) {
    state =
      account.status === PaystackAccountStatus.active && account.subaccountCode
        ? 'verified'
        : 'pending';
  }

  return {
    identity: {
      verified: identityVerified,
      status: kyc?.status ?? 'not_started',
      idType: user?.idType ?? null,
      verifiedAt: kyc?.verifiedAt ?? null,
    },
    settlement: {
      linked: Boolean(account?.accountNumber),
      state,
      bankName: account?.bankName ?? null,
      accountName: account?.accountName ?? null,
      accountNumberMasked: maskAccountNumber(account?.accountNumber),
    },
  };
}

export interface SettlementPreview {
  state: SettlementState;
  bankName: string;
  bankCode: string;
  resolvedName?: string;
  matchesIdentity?: boolean;
  message?: string;
}

/**
 * Resolve and name-check an account without writing anything.
 *
 * The onboarding step calls this as the user types, so the bank's own record of
 * the name is on screen before the step is saved. The save path re-runs the
 * same checks server-side, so a preview cannot be trusted into the database.
 */
export async function previewSettlementAccount(
  userId: string,
  input: { accountNumber: string; bankCode?: string | null; bankName?: string | null },
  opts?: { requireNameMatch?: boolean }
): Promise<SettlementPreview> {
  const requireNameMatch = opts?.requireNameMatch ?? true;
  const bank = await resolveBank({ bankCode: input.bankCode, bankName: input.bankName });
  const bankName = bank?.name || (input.bankName || '').trim();
  const bankCode = bank?.code || (input.bankCode || '').trim();

  if (!bankCode) {
    return {
      state: 'unresolved',
      bankName,
      bankCode,
      message: 'That bank is not on our settlement list.',
    };
  }

  if (!paystack.isConfigured()) {
    return {
      state: 'not_configured',
      bankName,
      bankCode,
      message: 'Bank verification is unavailable right now — your account will be saved as pending.',
    };
  }

  const payer = await getVerifiedPayerIdentity(userId);
  if (requireNameMatch && !payer?.verified) {
    return {
      state: 'no_identity',
      bankName,
      bankCode,
      message: 'Verify your identity first so we can match this account to you.',
    };
  }

  try {
    const resolved = await paystack.resolveAccountNumber(input.accountNumber, bankCode);
    const resolvedName = String(resolved?.data?.account_name ?? '').trim();
    if (!resolved?.status || !resolvedName) {
      return {
        state: 'unresolved',
        bankName,
        bankCode,
        message: 'We could not find that account number at this bank.',
      };
    }

    const matchesIdentity = payer ? nameMatchesIdentity(resolvedName, payer) : false;

    return {
      state: requireNameMatch && !matchesIdentity ? 'mismatch' : 'verified',
      bankName,
      bankCode,
      resolvedName,
      matchesIdentity,
      message:
        requireNameMatch && !matchesIdentity
          ? `This account is registered to ${resolvedName}, which does not match your verified identity.`
          : undefined,
    };
  } catch (error) {
    console.error('[settlement] Preview resolution failed:', error);
    return {
      state: 'unresolved',
      bankName,
      bankCode,
      message: 'We could not confirm that account number — check it and try again.',
    };
  }
}

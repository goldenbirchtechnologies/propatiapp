import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

// Dojah's REST API. Sandbox is https://sandbox.dojah.io, production
// https://api.dojah.io — set DOJAH_BASE_URL accordingly.
const DEFAULT_BASE_URL = 'https://api.dojah.io';

export interface DojahConfig {
  appId: string;
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  baseUrl?: string;
}

export interface DojahVerificationResponse {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  referenceId?: string;
  status?: string;
  statusCode?: number;
}

export interface DojahKycPayload {
  referenceId: string;
  widgetId: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export type DojahIdType = 'nin' | 'bvn';

/**
 * Normalised identity returned by a direct lookup. This is the shape the rest
 * of the app consumes — Paystack customer creation and Remita stamp duty both
 * read from it, so provider-specific field names never leak past this module.
 */
export interface DojahIdentity {
  type: DojahIdType;
  idNumber: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  photo?: string;
  referenceId?: string;
  /** Set when the provider confirms a match without returning the record (BVN Validate). */
  matchConfidence?: number;
  verifiedAt: string;
  raw?: Record<string, unknown>;
}

export class DojahApiError extends Error {
  readonly status?: number;
  readonly providerMessage?: string;

  constructor(message: string, options?: { status?: number; providerMessage?: string }) {
    super(message);
    this.name = 'DojahApiError';
    this.status = options?.status;
    this.providerMessage = options?.providerMessage;
  }
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

/**
 * Dojah wraps values two ways depending on the product: a plain string, or an
 * object carrying a match status (BVN Validate returns `{ value, status }` /
 * `{ confidence_value, status }`). Read either without caring which.
 */
function readField(node: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!node) return undefined;
  for (const key of keys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      if (typeof nested.value === 'string' && nested.value.trim()) return nested.value.trim();
    }
  }
  return undefined;
}

function readConfidence(node: Record<string, unknown> | undefined, ...keys: string[]): number | undefined {
  if (!node) return undefined;
  for (const key of keys) {
    const value = node[key];
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      if (typeof nested.confidence_value === 'number') return nested.confidence_value;
    }
  }
  return undefined;
}

function toIdentity(
  type: DojahIdType,
  idNumber: string,
  entity: Record<string, unknown> | undefined,
  referenceId?: string
): DojahIdentity {
  return {
    type,
    idNumber,
    firstName: readField(entity, 'first_name', 'firstName', 'firstname'),
    middleName: readField(entity, 'middle_name', 'middleName', 'middlename'),
    lastName: readField(entity, 'last_name', 'lastName', 'surname', 'lastname'),
    dateOfBirth: readField(entity, 'date_of_birth', 'dob', 'birthdate'),
    gender: readField(entity, 'gender'),
    phone: readField(entity, 'phone_number', 'phone_number1', 'phone', 'phoneNumber'),
    photo: readField(entity, 'photo', 'image', 'image_url'),
    referenceId,
    matchConfidence: readConfidence(entity, 'first_name', 'last_name', 'bvn'),
    verifiedAt: new Date().toISOString(),
    raw: entity,
  };
}

export class DojahService {
  private config: DojahConfig;
  private client: AxiosInstance;

  constructor(config: DojahConfig) {
    this.config = { ...config, baseUrl: config.baseUrl || DEFAULT_BASE_URL };
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30_000,
      headers: this.headers(),
    });
  }

  private headers() {
    return {
      // Dojah wants the secret key RAW — prefixing it with "Bearer" returns 401.
      Authorization: this.config.secretKey,
      AppId: this.config.appId,
      'Content-Type': 'application/json',
    };
  }

  isConfigured(): boolean {
    return Boolean(this.config.appId && this.config.publicKey && this.config.secretKey);
  }

  private requireConfigured(operation: string): void {
    if (!this.isConfigured()) {
      throw new DojahApiError(
        `Dojah is not configured: cannot ${operation}. Set NEXT_PUBLIC_DOJAH_APP_ID, NEXT_PUBLIC_DOJAH_PUBLIC_KEY and DOJAH_SECRET_KEY.`
      );
    }
  }

  private failure(operation: string, error: unknown): DojahApiError {
    const response = (error as { response?: { status?: number; data?: { error?: string; message?: string } } })?.response;
    const providerMessage = response?.data?.message || response?.data?.error;
    console.error(`[Dojah] ${operation} failed:`, response?.status, providerMessage ?? error);
    return new DojahApiError(
      providerMessage ? `Dojah: ${providerMessage}` : `Failed to ${operation}.`,
      { status: response?.status, providerMessage }
    );
  }

  /**
   * NIN lookup — GET /api/v1/kyc/nin
   * Returns the holder's identity record.
   */
  async lookupNIN(nin: string): Promise<DojahIdentity> {
    this.requireConfigured('look up a NIN');
    try {
      const { data } = await this.client.get('/api/v1/kyc/nin', { params: { nin } });
      const entity = ((data as Record<string, unknown>)?.entity ?? data) as Record<string, unknown> | undefined;
      return toIdentity('nin', nin, entity, readField(data as Record<string, unknown>, 'reference_id'));
    } catch (error) {
      throw this.failure('look up a NIN', error);
    }
  }

  /**
   * BVN lookup — GET /api/v1/kyc/bvn/full
   *
   * Dojah no longer sells BVN Basic/Advance to new direct-API accounts, so if
   * the full lookup is not enabled on this account we fall back to the BVN
   * Validate product (GET /api/v1/kyc/bvn), which returns per-field match
   * confidence for the names supplied rather than the stored record.
   */
  async lookupBVN(
    bvn: string,
    opts?: { firstName?: string; lastName?: string; dateOfBirth?: string }
  ): Promise<DojahIdentity> {
    this.requireConfigured('look up a BVN');
    try {
      const { data } = await this.client.get('/api/v1/kyc/bvn/full', { params: { bvn } });
      const entity = ((data as Record<string, unknown>)?.entity ?? data) as Record<string, unknown> | undefined;
      return toIdentity('bvn', bvn, entity, readField(data as Record<string, unknown>, 'reference_id'));
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const canValidate = status === 402 || status === 403 || status === 404;
      if (!canValidate || (!opts?.firstName && !opts?.lastName)) {
        throw this.failure('look up a BVN', error);
      }
      try {
        const { data } = await this.client.get('/api/v1/kyc/bvn', {
          params: {
            bvn,
            first_name: opts?.firstName,
            last_name: opts?.lastName,
            dob: opts?.dateOfBirth,
          },
        });
        const entity = ((data as Record<string, unknown>)?.entity ?? data) as Record<string, unknown> | undefined;
        const identity = toIdentity('bvn', bvn, entity, readField(data as Record<string, unknown>, 'reference_id'));
        // Validate confirms the supplied names; keep them so callers still have a name to use.
        return {
          ...identity,
          firstName: identity.firstName || opts?.firstName,
          lastName: identity.lastName || opts?.lastName,
        };
      } catch (validateError) {
        throw this.failure('validate a BVN', validateError);
      }
    }
  }

  /**
   * Fetch a widget verification by the reference id we generated.
   * GET /api/v1/kyc/verification?reference_id=...
   */
  async getVerificationDetails(referenceId: string): Promise<DojahVerificationResponse> {
    this.requireConfigured('fetch verification details');
    try {
      const { data } = await this.client.get('/api/v1/kyc/verification', {
        params: { reference_id: referenceId },
      });

      return {
        success: true,
        data: data as Record<string, unknown>,
        referenceId,
        status: this.mapDojahStatus(data as Record<string, unknown>),
      };
    } catch (error) {
      const failure = this.failure('fetch verification details', error);
      return { success: false, message: failure.message, statusCode: failure.status };
    }
  }

  /**
   * Map a widget verification payload to our KYC status.
   *
   * Dojah's `verification_status` is Ongoing | Pending | Completed | Failed |
   * Abandoned. `Completed` only means the session reached the end — it does
   * NOT mean the user passed, so the top-level boolean `status` decides.
   */
  mapDojahStatus(raw: Record<string, unknown> | undefined): string {
    if (!raw) return 'in_progress';

    const verificationStatus = String(raw.verification_status ?? '').toLowerCase();
    // The pass flag arrives as a boolean, but some payloads stringify it, so
    // "false" must not be read as a pass.
    const passed = raw.status;
    const explicitlyFailed =
      passed === false || (typeof passed === 'string' && passed.toLowerCase() === 'false');

    if (verificationStatus === 'failed' || verificationStatus === 'abandoned') return 'rejected';
    if (verificationStatus === 'completed') return explicitlyFailed ? 'rejected' : 'approved';
    if (verificationStatus === 'ongoing' || verificationStatus === 'pending') return 'in_progress';

    // Legacy / fallback vocabulary.
    const legacy = String(raw.status ?? raw.verification_status ?? '').toLowerCase();
    if (['approved', 'success', 'verified', 'complete', 'completed'].includes(legacy)) return 'approved';
    if (['rejected', 'failed', 'denied'].includes(legacy)) return 'rejected';
    if (['review', 'requires_review', 'manual_review', 'pending_review'].includes(legacy)) return 'requires_review';

    return 'in_progress';
  }

  /**
   * Verify a Dojah webhook.
   *
   * Accepted schemes (either is enough):
   *   • x-dojah-signature     — HMAC-SHA256 of the raw body, keyed with the
   *                             per-subscription webhook secret (DOJAH_WEBHOOK_SECRET)
   *   • x-dojah-signature-v2  — SHA256 of the API secret key alone
   */
  verifyWebhookSignature(
    rawBody: string,
    headers: string | { signature?: string | null; signatureV2?: string | null }
  ): boolean {
    const signature = typeof headers === 'string' ? headers : headers.signature;
    const signatureV2 = typeof headers === 'string' ? null : headers.signatureV2;

    if (signatureV2 && this.config.secretKey) {
      const expected = crypto.createHash('sha256').update(this.config.secretKey).digest('hex');
      if (safeEqual(signatureV2, expected)) return true;
    }

    if (signature && this.config.webhookSecret) {
      const expected = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(rawBody)
        .digest('hex');
      if (safeEqual(signature, expected)) return true;
    }

    return false;
  }
}

export function getDojahService() {
  const config: DojahConfig = {
    appId: process.env.NEXT_PUBLIC_DOJAH_APP_ID || '',
    publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || '',
    secretKey: process.env.DOJAH_SECRET_KEY || '',
    webhookSecret: process.env.DOJAH_WEBHOOK_SECRET || '',
    baseUrl: process.env.DOJAH_BASE_URL || DEFAULT_BASE_URL,
  };

  if (!config.appId || !config.publicKey || !config.secretKey) {
    console.warn('[Dojah] Missing required env vars for server-side service');
  }

  return new DojahService(config);
}

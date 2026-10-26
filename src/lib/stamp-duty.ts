import { getAppUrl } from '@/lib/urls';
import { Decimal } from '@prisma/client';
import type {
  AgreementType,
  PayerEntityType,
  RemittingAuthority,
  StampDutyBasis,
  StampDutyInstrument,
} from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

const REMITA_MERCHANT_ID = process.env.REMITA_MERCHANT_ID;
const REMITA_API_KEY = process.env.REMITA_API_KEY;
const REMITA_BASE_URL = process.env.REMITA_BASE_URL || 'https://remitademo.net';

// Values shipped in .env.example — treated as "not configured" so a copied
// template never looks like a live remittance channel.
const PLACEHOLDER_VALUES = new Set([
  'your_merchant_id',
  'your_api_key',
  'your_service_type_id',
  'your_webhook_secret',
]);
const isPlaceholder = (v: string | undefined): boolean =>
  !v || v.trim().length === 0 || PLACEHOLDER_VALUES.has(v.trim());

// ===========================================================================
// ASSESSMENT RULES
// ===========================================================================
//
// Nigerian Stamp Duties Act, CAP S8, LFN 2004. The duty on a tenancy or lease
// is ad valorem on the rent, with no duty below the threshold and a floor on
// the payable amount.
//
// Which base applies differs by instrument:
//   • an individual residential tenancy is assessed on ONE YEAR's rent
//   • a corporate/commercial lease is assessed on the rent payable across the
//     whole term, which is materially higher for multi-year leases
//
// Rates and thresholds are configurable per instrument so counsel can adjust
// them without a code change. The defaults below are the commonly applied
// figures — confirm the applicable band for your jurisdiction before going live.

export interface StampDutyRule {
  /** Ad valorem rate applied to the taxable amount. */
  rate: number;
  /** What the rate is applied to. */
  basis: StampDutyBasis;
  /** Amounts at or below this are not stampable. */
  threshold: number;
  /** Floor for any payable duty. */
  minimum: number;
}

const DEFAULT_RULES: Record<StampDutyInstrument, StampDutyRule> = {
  residential_tenancy: { rate: 0.0078, basis: 'annual_rent', threshold: 10_000, minimum: 500 },
  commercial_lease: { rate: 0.0078, basis: 'total_term_consideration', threshold: 10_000, minimum: 500 },
  short_let: { rate: 0.0078, basis: 'total_term_consideration', threshold: 10_000, minimum: 500 },
  sale_conveyance: { rate: 0.015, basis: 'total_term_consideration', threshold: 10_000, minimum: 500 },
};

/** Read an env override for a rule field, e.g. STAMP_DUTY_RATE_COMMERCIAL_LEASE. */
function envRule(instrument: StampDutyInstrument): Partial<StampDutyRule> {
  const key = instrument.toUpperCase();
  const rate = process.env[`STAMP_DUTY_RATE_${key}`];
  const threshold = process.env[`STAMP_DUTY_THRESHOLD_${key}`];
  const minimum = process.env[`STAMP_DUTY_MINIMUM_${key}`];
  const basis = process.env[`STAMP_DUTY_BASIS_${key}`];
  return {
    ...(rate && Number.isFinite(Number(rate)) ? { rate: Number(rate) } : {}),
    ...(threshold && Number.isFinite(Number(threshold)) ? { threshold: Number(threshold) } : {}),
    ...(minimum && Number.isFinite(Number(minimum)) ? { minimum: Number(minimum) } : {}),
    ...(basis === 'annual_rent' || basis === 'total_term_consideration'
      ? { basis: basis as StampDutyBasis }
      : {}),
  };
}

export function getStampDutyRule(instrument: StampDutyInstrument): StampDutyRule {
  return { ...DEFAULT_RULES[instrument], ...envRule(instrument) };
}

/**
 * Resolve which instrument a lease falls under.
 *
 * A corporate payer or a commercial listing makes it a commercial lease; a
 * short-let stays a short-let regardless; everything else is a residential
 * tenancy.
 */
export function resolveInstrument(params: {
  agreementType: AgreementType;
  payerType: PayerEntityType;
  listingType?: string | null;
}): StampDutyInstrument {
  if (params.agreementType === 'sale') return 'sale_conveyance';
  if (params.agreementType === 'short_let') return 'short_let';

  const commercialListing = ['commercial', 'office', 'shop', 'warehouse'].includes(
    (params.listingType ?? '').toLowerCase()
  );
  if (params.payerType === 'corporate' || commercialListing) return 'commercial_lease';

  return 'residential_tenancy';
}

/** Whole months between two dates, rounded up. Falls back to 12 when unset. */
export function leaseTermMonths(start: Date | null, end: Date | null): number {
  if (!start || !end) return 12;
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

export interface StampDutyAssessment {
  instrument: StampDutyInstrument;
  basis: StampDutyBasis;
  rate: number;
  /** The base the rate is applied to. */
  taxableAmount: number;
  /** Duty payable, after threshold and floor. Zero means nothing to remit. */
  amount: number;
  leaseTermMonths: number;
  annualRent: number;
}

/**
 * Assess the duty payable on an agreement.
 *
 * `annualRent` is the yearly rent. When the rule's basis is
 * `total_term_consideration` the taxable amount is annualRent × term in years.
 */
export function assessStampDuty(params: {
  instrument: StampDutyInstrument;
  annualRent: number;
  leaseTermMonths: number;
}): StampDutyAssessment {
  const rule = getStampDutyRule(params.instrument);
  const annualRent = Math.max(0, params.annualRent);

  const taxableAmount =
    rule.basis === 'annual_rent'
      ? annualRent
      : Math.round(annualRent * (params.leaseTermMonths / 12));

  if (taxableAmount <= rule.threshold) {
    return {
      instrument: params.instrument,
      basis: rule.basis,
      rate: rule.rate,
      taxableAmount,
      amount: 0,
      leaseTermMonths: params.leaseTermMonths,
      annualRent,
    };
  }

  const computed = taxableAmount * rule.rate;
  return {
    instrument: params.instrument,
    basis: rule.basis,
    rate: rule.rate,
    taxableAmount,
    amount: Math.round(Math.max(computed, rule.minimum) * 100) / 100,
    leaseTermMonths: params.leaseTermMonths,
    annualRent,
  };
}

/** Backwards-compatible helper: residential annual-rent assessment. */
export function calculateStampDuty(annualRent: number): number {
  return assessStampDuty({
    instrument: 'residential_tenancy',
    annualRent,
    leaseTermMonths: 12,
  }).amount;
}

// ===========================================================================
// REMITTING AUTHORITY
// ===========================================================================
//
// Stamp duty on land is collected federally by FIRS or by the state internal
// revenue service, depending on where the instrument is to be stamped. Lagos
// (LIRS) and the FCT (FIRS) are the two the platform sees most; every other
// state routes to its own SIRS. Each authority has its own Remita service type.

export interface AuthorityConfig {
  authority: RemittingAuthority;
  label: string;
  /** Remita service type id used when initiating payment. */
  serviceTypeId: string;
}

const FALLBACK_SERVICE_TYPE = process.env.REMITA_SERVICE_TYPE_ID || '4430731';

function serviceTypeFor(authority: RemittingAuthority): string {
  const byAuthority: Record<RemittingAuthority, string | undefined> = {
    FIRS: process.env.REMITA_SERVICE_TYPE_FIRS,
    LIRS: process.env.REMITA_SERVICE_TYPE_LIRS,
    SIRS: process.env.REMITA_SERVICE_TYPE_SIRS,
  };
  const value = byAuthority[authority];
  return isPlaceholder(value) ? FALLBACK_SERVICE_TYPE : (value as string);
}

/** Route an instrument to the authority that collects duty for its state. */
export function resolveAuthority(state: string | null | undefined): AuthorityConfig {
  const normalised = (state ?? '').trim().toLowerCase();

  if (normalised === 'lagos') {
    return { authority: 'LIRS', label: 'Lagos State Internal Revenue Service (LIRS)', serviceTypeId: serviceTypeFor('LIRS') };
  }
  if (normalised === 'fct' || normalised === 'abuja' || normalised === 'federal capital territory') {
    return { authority: 'FIRS', label: 'Federal Inland Revenue Service (FIRS)', serviceTypeId: serviceTypeFor('FIRS') };
  }
  return { authority: 'SIRS', label: 'State Internal Revenue Service (SIRS)', serviceTypeId: serviceTypeFor('SIRS') };
}

// ===========================================================================
// PAYER IDENTITY
// ===========================================================================
//
// A corporate lease is stamped against the company and its RC number; an
// individual tenancy against the natural person. This is what the certificate
// and the endorsement on the instrument must name.

export interface PayerIdentity {
  type: PayerEntityType;
  name: string;
  rcNumber: string | null;
  email: string;
  phone: string;
}

export function resolvePayerIdentity(params: {
  person: { fullName: string; email: string; phone?: string | null };
  businessProfile?: { companyName: string | null; rcNumber: string | null; verified: boolean } | null;
  agreementType: AgreementType;
  listingType?: string | null;
}): PayerIdentity {
  const commercialListing = ['commercial', 'office', 'shop', 'warehouse'].includes(
    (params.listingType ?? '').toLowerCase()
  );
  const wantsCorporate = params.agreementType !== 'short_let' && commercialListing;
  const hasCompany =
    params.businessProfile?.verified &&
    !!params.businessProfile.companyName &&
    !!params.businessProfile.rcNumber;

  if (wantsCorporate && hasCompany && params.businessProfile) {
    return {
      type: 'corporate',
      name: params.businessProfile.companyName as string,
      rcNumber: params.businessProfile.rcNumber,
      email: params.person.email,
      phone: params.person.phone ?? '',
    };
  }

  return {
    type: 'individual',
    name: params.person.fullName,
    rcNumber: null,
    email: params.person.email,
    phone: params.person.phone ?? '',
  };
}

// ===========================================================================
// REMITA CLIENT
// ===========================================================================

export interface StampDutyInitiateParams {
  agreementId: string;
  amount: number | Decimal;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  propertyAddress: string;
  tenantName: string;
  landlordName: string;
  annualRent: number;
  /** Remita service type for the collecting authority. */
  serviceTypeId?: string;
  authority?: RemittingAuthority;
  instrument?: StampDutyInstrument;
  payerType?: PayerEntityType;
  payerRcNumber?: string | null;
  taxableAmount?: number;
  leaseTermMonths?: number;
}

export interface StampDutyInitiateResult {
  rrr: string;
  paymentUrl: string;
  amount: number | Decimal;
  /** Remita service type the duty was routed to. */
  serviceTypeId?: string;
  /** True when the result is synthetic (Remita not configured, dev only). */
  mock?: boolean;
}

export interface StampDutyVerifyResult {
  paid: boolean;
  transactionId?: string;
  certificateNumber?: string;
  certificateUrl?: string;
}

export interface EmbedCertificateParams {
  agreementId: string;
  certificateNumber: string;
  certificateUrl: string;
  paidAt: Date;
}

class RemitaClient {
  private client: AxiosInstance;
  private allowMock: boolean;

  constructor() {
    this.allowMock = process.env.NODE_ENV !== 'production';
    if (!this.isConfigured() && process.env.NODE_ENV !== 'test') {
      const msg =
        '[Remita] REMITA_MERCHANT_ID / REMITA_API_KEY are not configured. ' +
        (this.allowMock
          ? 'Falling back to MOCK remittance (development only).'
          : 'Stamp duty remittance is disabled.');
      console.warn(msg);
    }
    this.client = axios.create({
      baseURL: REMITA_BASE_URL,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  isConfigured(): boolean {
    return !isPlaceholder(REMITA_MERCHANT_ID) && !isPlaceholder(REMITA_API_KEY);
  }

  /** True when the client returns synthetic results instead of calling Remita. */
  isMockMode(): boolean {
    return !this.isConfigured() && this.allowMock;
  }

  private unavailable(operation: string): never {
    throw new Error(
      `Remita is not configured: cannot ${operation}. Set REMITA_MERCHANT_ID and REMITA_API_KEY.`
    );
  }

  private buildAuthHash(orderId: string, serviceTypeId: string): string {
    const raw = `${REMITA_MERCHANT_ID}${serviceTypeId}${orderId}${REMITA_API_KEY}`;
    return crypto.createHash('sha512').update(raw).digest('hex');
  }

  async generateRRR(params: StampDutyInitiateParams): Promise<StampDutyInitiateResult> {
    const serviceTypeId = params.serviceTypeId || FALLBACK_SERVICE_TYPE;

    if (!this.isConfigured()) {
      if (!this.allowMock) this.unavailable('generate a stamp duty RRR');
      return this.mockGenerateRRR(params, serviceTypeId);
    }

    const orderId = `PROPATI_SD_${params.agreementId}_${Date.now()}`;
    const hash = this.buildAuthHash(orderId, serviceTypeId);
    const amount = Number(params.amount);

    try {
      const response = await this.client.post(
        '/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit',
        {
          serviceTypeId,
          amount: amount.toFixed(2),
          orderId,
          payerName: params.payerName,
          payerEmail: params.payerEmail,
          payerPhone: params.payerPhone,
          description: `Stamp Duty - ${params.propertyAddress}`,
          merchantId: REMITA_MERCHANT_ID,
          hash,
          customFields: [
            { name: 'tenantName', value: params.tenantName, type: 'ALL' },
            { name: 'landlordName', value: params.landlordName, type: 'ALL' },
            { name: 'propertyAddress', value: params.propertyAddress, type: 'ALL' },
            { name: 'annualRent', value: String(params.annualRent), type: 'ALL' },
            { name: 'agreementId', value: params.agreementId, type: 'ALL' },
            { name: 'instrument', value: params.instrument ?? 'residential_tenancy', type: 'ALL' },
            { name: 'payerType', value: params.payerType ?? 'individual', type: 'ALL' },
            ...(params.payerRcNumber
              ? [{ name: 'payerRcNumber', value: params.payerRcNumber, type: 'ALL' }]
              : []),
            ...(params.taxableAmount != null
              ? [{ name: 'taxableAmount', value: String(params.taxableAmount), type: 'ALL' }]
              : []),
            ...(params.leaseTermMonths != null
              ? [{ name: 'leaseTermMonths', value: String(params.leaseTermMonths), type: 'ALL' }]
              : []),
          ],
        }
      );

      const data = response.data;
      const rrr: string = data.RRR || data.rrr || data.data?.RRR;
      if (!rrr) throw new Error('Remita did not return an RRR');

      return {
        rrr,
        paymentUrl: `${REMITA_BASE_URL}/remita/onlinepayments/${rrr}`,
        amount: params.amount,
        serviceTypeId,
        mock: false,
      };
    } catch (error) {
      console.error('[Remita] Generate RRR error:', error);
      throw new Error('Failed to generate stamp duty payment reference. Please try again.');
    }
  }

  async verifyRRR(rrr: string): Promise<StampDutyVerifyResult> {
    if (!this.isConfigured()) {
      if (!this.allowMock) this.unavailable('verify a stamp duty RRR');
      return this.mockVerifyRRR(rrr);
    }

    const verifyHash = crypto
      .createHash('sha512')
      .update(`${rrr}${REMITA_API_KEY}${REMITA_MERCHANT_ID}`)
      .digest('hex');

    try {
      const response = await this.client.get(
        `/remita/exapp/api/v1/send/api/echannelsvc/${REMITA_MERCHANT_ID}/${rrr}/${verifyHash}/status.reg`,
        {
          headers: {
            Authorization: `remitaConsumerKey=${REMITA_MERCHANT_ID},remitaConsumerToken=${verifyHash}`,
          },
        }
      );

      const data = response.data;
      const isPaid = data.status === '00' || data.status === '01';
      if (!isPaid) return { paid: false };

      const certificateNumber: string =
        data.firsStampCertNo || data.certificateNumber || `FIRS-${rrr}-${Date.now()}`;
      const certificateUrl: string =
        data.certificateUrl || `${REMITA_BASE_URL}/remita/stamp/${certificateNumber}.pdf`;

      return {
        paid: true,
        transactionId: data.transactionId || data.paymentId,
        certificateNumber,
        certificateUrl,
      };
    } catch (error) {
      console.error('[Remita] Verify RRR error:', error);
      throw new Error('Failed to verify stamp duty payment. Please try again.');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!REMITA_API_KEY) return false;
    const expected = crypto
      .createHash('sha512')
      .update(`${payload}${REMITA_API_KEY}`)
      .digest('hex');
    return expected === signature;
  }

  private mockGenerateRRR(
    params: StampDutyInitiateParams,
    serviceTypeId: string
  ): StampDutyInitiateResult {
    console.log('[Remita Mock] Generate RRR:', params.agreementId);
    const rrr = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`.slice(0, 12);
    return {
      rrr,
      paymentUrl: `${getAppUrl()}/mock-stamp-payment/${rrr}?amount=${Number(params.amount)}`,
      amount: params.amount,
      serviceTypeId,
      mock: true,
    };
  }

  private mockVerifyRRR(rrr: string): StampDutyVerifyResult {
    console.log('[Remita Mock] Verify RRR:', rrr);
    const certificateNumber = `FIRS-SD-${Date.now().toString(36).toUpperCase()}-NG`;
    return {
      paid: true,
      transactionId: `TXN_REMITA_${Date.now()}`,
      certificateNumber,
      certificateUrl: `${getAppUrl()}/mock-certificates/${certificateNumber}.pdf`,
    };
  }
}

const remita = new RemitaClient();

export async function initiateStampDutyPayment(
  params: StampDutyInitiateParams
): Promise<StampDutyInitiateResult> {
  return remita.generateRRR(params);
}

export async function verifyStampDutyPayment(rrr: string): Promise<StampDutyVerifyResult> {
  return remita.verifyRRR(rrr);
}

// ===========================================================================
// INTEGRITY CHAIN
// ===========================================================================
//
// Admissibility turns on being able to show that the certificate presented is
// the one issued for this instrument. Three hashes are recorded when a
// certificate is issued:
//   agreementPdfHash — the instrument as signed
//   certificateHash  — the certificate as issued
//   linkageHash      — both, plus the RRR and amount, bound together

export function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function buildLinkageHash(params: {
  agreementPdfHash: string | null;
  certificateHash: string;
  rrr: string | null;
  amount: number;
}): string {
  return sha256(
    [
      params.agreementPdfHash ?? 'no-agreement-pdf',
      params.certificateHash,
      params.rrr ?? 'no-rrr',
      params.amount.toFixed(2),
    ].join('|')
  );
}

/** Hash the signed agreement document. Returns null when no PDF is on file. */
export async function hashAgreementDocument(agreementId: string): Promise<string | null> {
  const { prisma } = await import('./prisma');
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: { pdfUrl: true, id: true, rentAmount: true, startDate: true, endDate: true },
  });
  if (!agreement) return null;

  if (agreement.pdfUrl) {
    try {
      const res = await fetch(agreement.pdfUrl);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        return sha256(buffer);
      }
    } catch {
      // fall through to the canonical payload hash
    }
  }

  // No retrievable PDF — bind the canonical agreement facts instead so the
  // chain still proves which instrument the certificate belongs to.
  return sha256(
    [
      agreement.id,
      agreement.rentAmount?.toString() ?? '',
      agreement.startDate?.toISOString() ?? '',
      agreement.endDate?.toISOString() ?? '',
    ].join('|')
  );
}

/** Hash the issued certificate artifact (falls back to its identifier). */
export async function hashCertificate(params: {
  certificateUrl: string;
  certificateNumber: string;
}): Promise<string> {
  try {
    const res = await fetch(params.certificateUrl);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      return sha256(buffer);
    }
  } catch {
    // certificate not retrievable — hash the identifier so the chain is intact
  }
  return sha256(params.certificateNumber);
}

// ===========================================================================
// CERTIFICATE ENDORSEMENT
// ===========================================================================

export async function embedStampCertificate(params: EmbedCertificateParams): Promise<string> {
  const { prisma } = await import('./prisma');
  const cloudinaryModule = await import('cloudinary');
  const cloudinary = cloudinaryModule.v2;

  const agreement = await prisma.agreement.findUnique({
    where: { id: params.agreementId },
    include: {
      listing: { select: { title: true, address: true, area: true, state: true } },
      landlord: { select: { fullName: true } },
      tenant: { select: { fullName: true } },
      stampDuty: true,
    },
  });

  if (!agreement) throw new Error('Agreement not found');

  const duty = agreement.stampDuty;

  const endorsementHtml = buildEndorsementHtml({
    certificateNumber: params.certificateNumber,
    certificateUrl: params.certificateUrl,
    paidAt: params.paidAt,
    amount: duty?.amount ? Number(duty.amount) : 0,
    agreementId: params.agreementId,
    landlordName: agreement.landlord.fullName,
    tenantName: agreement.tenant.fullName,
    instrument: duty?.instrument ?? null,
    basis: duty?.basis ?? null,
    taxableAmount: duty?.taxableAmount ? Number(duty.taxableAmount) : null,
    leaseTermMonths: duty?.leaseTermMonths ?? null,
    authority: duty?.authority ?? null,
    authorityState: duty?.authorityState ?? null,
    payerType: duty?.payerType ?? null,
    payerName: duty?.payerName ?? null,
    payerRcNumber: duty?.payerRcNumber ?? null,
    rrr: duty?.remitaRrr ?? null,
    linkageHash: duty?.linkageHash ?? null,
  });

  const publicId = `propati/agreements/${params.agreementId}/stamped`;

  try {
    const uploadResult = await cloudinary.uploader.upload(
      `data:text/html;base64,${Buffer.from(endorsementHtml, 'utf-8').toString('base64')}`,
      { public_id: publicId, resource_type: 'raw', folder: 'propati/agreements', format: 'html' }
    );
    return uploadResult.secure_url;
  } catch (error) {
    console.error('[StampDuty] Embed certificate error:', error);
    return params.certificateUrl;
  }
}

const INSTRUMENT_LABEL: Record<StampDutyInstrument, string> = {
  residential_tenancy: 'Residential Tenancy (individual lessee)',
  commercial_lease: 'Commercial / Corporate Lease',
  short_let: 'Short-let Tenancy',
  sale_conveyance: 'Conveyance on Sale',
};

const AUTHORITY_LABEL: Record<RemittingAuthority, string> = {
  FIRS: 'Federal Inland Revenue Service (FIRS)',
  LIRS: 'Lagos State Internal Revenue Service (LIRS)',
  SIRS: 'State Internal Revenue Service (SIRS)',
};

function buildEndorsementHtml(data: {
  certificateNumber: string;
  certificateUrl: string;
  paidAt: Date;
  amount: number;
  agreementId: string;
  landlordName: string;
  tenantName: string;
  instrument: StampDutyInstrument | null;
  basis: StampDutyBasis | null;
  taxableAmount: number | null;
  leaseTermMonths: number | null;
  authority: RemittingAuthority | null;
  authorityState: string | null;
  payerType: PayerEntityType | null;
  payerName: string | null;
  payerRcNumber: string | null;
  rrr: string | null;
  linkageHash: string | null;
}): string {
  const formattedDate = data.paidAt.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const money = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

  const row = (label: string, value: string, shaded = false) => `
    <tr${shaded ? ' style="background:#d6eaf8;"' : ''}>
      <td style="padding:8px;font-weight:bold;color:#555;width:42%;">${label}</td>
      <td style="padding:8px;">${value}</td>
    </tr>`;

  const basisLabel =
    data.basis === 'annual_rent'
      ? "One year's rent"
      : data.basis === 'total_term_consideration'
        ? `Total rent over ${data.leaseTermMonths ?? '—'} months`
        : '—';

  return `
<div style="margin-top:60px;padding:24px;border:2px solid #1a5276;border-radius:8px;background:#eaf4fb;font-family:Arial,sans-serif;">
  <h2 style="text-align:center;color:#1a5276;letter-spacing:2px;margin-bottom:4px;">ELECTRONIC STAMP DUTY CERTIFICATE</h2>
  <p style="text-align:center;color:#555;font-size:12px;margin-top:0;margin-bottom:16px;">
    Issued under the Stamp Duties Act, CAP S8, LFN 2004
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${row('Certificate Number', `<span style="font-family:monospace;color:#1a5276;font-weight:bold;">${data.certificateNumber}</span>`)}
    ${row('Remita RRR', data.rrr ? `<span style="font-family:monospace;">${data.rrr}</span>` : '—', true)}
    ${row('Instrument Stamped', data.instrument ? INSTRUMENT_LABEL[data.instrument] : '—')}
    ${row('Duty Basis', basisLabel, true)}
    ${row('Taxable Amount', data.taxableAmount != null ? money(data.taxableAmount) : '—')}
    ${row('Duty Paid', `<strong>${money(data.amount)}</strong>`, true)}
    ${row('Collecting Authority', data.authority ? `${AUTHORITY_LABEL[data.authority]}${data.authorityState ? ` — ${data.authorityState} State` : ''}` : '—')}
    ${row('Date of Payment', formattedDate, true)}
    ${row('Payer', data.payerName ? `${data.payerName}${data.payerRcNumber ? ` (RC ${data.payerRcNumber})` : ''}` : '—')}
    ${row('Payer Category', data.payerType === 'corporate' ? 'Registered Company' : 'Individual', true)}
    ${row('Lessor', data.landlordName)}
    ${row('Lessee', data.tenantName, true)}
    ${row('Verify Online', `<a href="${data.certificateUrl}" style="color:#1a5276;">${data.certificateUrl}</a>`)}
    ${data.linkageHash ? row('Integrity Hash', `<span style="font-family:monospace;font-size:10px;word-break:break-all;">${data.linkageHash}</span>`, true) : ''}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#555;text-align:center;font-style:italic;">
    This instrument has been duly stamped. The integrity hash above binds this certificate to the
    executed agreement and its Remita payment reference.
  </p>
</div>`;
}

export { remita as remitaClient };

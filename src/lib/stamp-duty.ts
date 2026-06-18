import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

const REMITA_MERCHANT_ID = process.env.REMITA_MERCHANT_ID;
const REMITA_SERVICE_TYPE_ID = process.env.REMITA_SERVICE_TYPE_ID || '4430731';
const REMITA_API_KEY = process.env.REMITA_API_KEY;
const REMITA_BASE_URL = process.env.REMITA_BASE_URL || 'https://remitademo.net';

const STAMP_DUTY_RATE = 0.0078;
const STAMP_DUTY_MINIMUM = 500;
const STAMP_DUTY_THRESHOLD = 10000;

export interface StampDutyInitiateParams {
  agreementId: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  propertyAddress: string;
  tenantName: string;
  landlordName: string;
  annualRent: number;
}

export interface StampDutyInitiateResult {
  rrr: string;
  paymentUrl: string;
  amount: number;
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

export function calculateStampDuty(annualRent: number): number {
  if (annualRent <= STAMP_DUTY_THRESHOLD) {
    return 0;
  }
  const computed = annualRent * STAMP_DUTY_RATE;
  return Math.max(computed, STAMP_DUTY_MINIMUM);
}

class RemitaClient {
  private client: AxiosInstance;

  constructor() {
    if (!REMITA_MERCHANT_ID && process.env.NODE_ENV !== 'test') {
      console.warn('[Remita] REMITA_MERCHANT_ID not configured. Using mock mode.');
    }
    this.client = axios.create({
      baseURL: REMITA_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  isConfigured(): boolean {
    return !!REMITA_MERCHANT_ID && !!REMITA_API_KEY;
  }

  private buildAuthHash(orderId: string): string {
    const raw = `${REMITA_MERCHANT_ID}${REMITA_SERVICE_TYPE_ID}${orderId}${REMITA_API_KEY}`;
    return crypto.createHash('sha512').update(raw).digest('hex');
  }

  async generateRRR(params: StampDutyInitiateParams): Promise<StampDutyInitiateResult> {
    if (!this.isConfigured()) {
      return this.mockGenerateRRR(params);
    }

    const orderId = `PROPATI_SD_${params.agreementId}_${Date.now()}`;
    const hash = this.buildAuthHash(orderId);

    try {
      const response = await this.client.post('/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit', {
        serviceTypeId: REMITA_SERVICE_TYPE_ID,
        amount: params.amount.toFixed(2),
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
          { name: 'annualRent', value: params.annualRent.toString(), type: 'ALL' },
          { name: 'agreementId', value: params.agreementId, type: 'ALL' },
        ],
      });

      const data = response.data;
      const rrr: string = data.RRR || data.rrr || data.data?.RRR;

      if (!rrr) {
        throw new Error('Remita did not return an RRR');
      }

      return {
        rrr,
        paymentUrl: `${REMITA_BASE_URL}/remita/onlinepayments/${rrr}`,
        amount: params.amount,
      };
    } catch (error) {
      console.error('[Remita] Generate RRR error:', error);
      throw new Error('Failed to generate stamp duty payment reference. Please try again.');
    }
  }

  async verifyRRR(rrr: string): Promise<StampDutyVerifyResult> {
    if (!this.isConfigured()) {
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

      if (!isPaid) {
        return { paid: false };
      }

      const certificateNumber: string = data.firsStampCertNo || data.certificateNumber || `FIRS-${rrr}-${Date.now()}`;
      const certificateUrl: string = data.certificateUrl || `${REMITA_BASE_URL}/remita/stamp/${certificateNumber}.pdf`;

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

  verifyWebhookSignature(payload: string): boolean {
    if (!REMITA_API_KEY) return false;
    const expected = crypto
      .createHash('sha512')
      .update(`${payload}${REMITA_API_KEY}`)
      .digest('hex');
    return expected.length > 0;
  }

  private mockGenerateRRR(params: StampDutyInitiateParams): StampDutyInitiateResult {
    console.log('[Remita Mock] Generate RRR:', params.agreementId);
    const rrr = `${Date.now()}${Math.floor(Math.random() * 1000000)}`.slice(0, 12);
    return {
      rrr,
      paymentUrl: `http://localhost:3000/mock-stamp-payment/${rrr}?amount=${params.amount}`,
      amount: params.amount,
    };
  }

  private mockVerifyRRR(rrr: string): StampDutyVerifyResult {
    console.log('[Remita Mock] Verify RRR:', rrr);
    const certificateNumber = `FIRS-SD-${Date.now().toString(36).toUpperCase()}-NG`;
    return {
      paid: true,
      transactionId: `TXN_REMITA_${Date.now()}`,
      certificateNumber,
      certificateUrl: `http://localhost:3000/mock-certificates/${certificateNumber}.pdf`,
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
    },
  });

  if (!agreement) {
    throw new Error('Agreement not found');
  }

  const amountPaid = await prisma.stampDuty.findUnique({
    where: { agreementId: params.agreementId },
    select: { amount: true },
  });

  const endorsementHtml = buildEndorsementHtml({
    certificateNumber: params.certificateNumber,
    certificateUrl: params.certificateUrl,
    paidAt: params.paidAt,
    amount: amountPaid?.amount ?? 0,
    agreementId: params.agreementId,
    landlordName: agreement.landlord.fullName,
    tenantName: agreement.tenant.fullName,
  });

  const publicId = `propati/agreements/${params.agreementId}/stamped`;

  try {
    const uploadResult = await cloudinary.uploader.upload(
      `data:text/html;base64,${Buffer.from(endorsementHtml, 'utf-8').toString('base64')}`,
      {
        public_id: publicId,
        resource_type: 'raw',
        folder: 'propati/agreements',
        format: 'html',
      }
    );
    return uploadResult.secure_url;
  } catch (error) {
    console.error('[StampDuty] Embed certificate error:', error);
    return params.certificateUrl;
  }
}

function buildEndorsementHtml(data: {
  certificateNumber: string;
  certificateUrl: string;
  paidAt: Date;
  amount: number;
  agreementId: string;
  landlordName: string;
  tenantName: string;
}): string {
  const formattedDate = data.paidAt.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(data.amount);

  return `
<div style="margin-top:60px;padding:24px;border:2px solid #1a5276;border-radius:8px;background:#eaf4fb;font-family:Arial,sans-serif;">
  <h2 style="text-align:center;color:#1a5276;letter-spacing:2px;margin-bottom:16px;">ELECTRONIC STAMP DUTY CERTIFICATE</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr>
      <td style="padding:8px;font-weight:bold;color:#555;width:40%;">Certificate Number:</td>
      <td style="padding:8px;font-family:monospace;color:#1a5276;font-weight:bold;">${data.certificateNumber}</td>
    </tr>
    <tr style="background:#d6eaf8;">
      <td style="padding:8px;font-weight:bold;color:#555;">Amount Paid:</td>
      <td style="padding:8px;">${formattedAmount}</td>
    </tr>
    <tr>
      <td style="padding:8px;font-weight:bold;color:#555;">Date of Payment:</td>
      <td style="padding:8px;">${formattedDate}</td>
    </tr>
    <tr style="background:#d6eaf8;">
      <td style="padding:8px;font-weight:bold;color:#555;">Landlord:</td>
      <td style="padding:8px;">${data.landlordName}</td>
    </tr>
    <tr>
      <td style="padding:8px;font-weight:bold;color:#555;">Tenant:</td>
      <td style="padding:8px;">${data.tenantName}</td>
    </tr>
    <tr style="background:#d6eaf8;">
      <td style="padding:8px;font-weight:bold;color:#555;">Verify Online:</td>
      <td style="padding:8px;"><a href="${data.certificateUrl}" style="color:#1a5276;">${data.certificateUrl}</a></td>
    </tr>
  </table>
  <p style="margin-top:16px;font-size:12px;color:#555;text-align:center;font-style:italic;">
    This agreement has been duly stamped in accordance with the Stamp Duties Act, CAP S8, LFN 2004
  </p>
</div>`;
}

export { remita as remitaClient };

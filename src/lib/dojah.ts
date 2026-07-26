import { NextResponse } from 'next/server';
import axios from 'axios';

export interface DojahConfig {
  appId: string;
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
}

export interface DojahVerificationResponse {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  referenceId?: string;
  status?: string;
}

export interface DojahKycPayload {
  referenceId: string;
  widgetId: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export class DojahService {
  private config: DojahConfig;

  constructor(config: DojahConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.dojah.io',
      ...config,
    };
  }

  private headers() {
    return {
      AppId: this.config.appId,
      Authorization: this.config.secretKey,
      'Content-Type': 'application/json',
    };
  }

  async createVerification(payload: {
    type: 'custom' | 'verification' | 'identification' | 'liveness';
    widgetId: string;
    referenceId: string;
    userData?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<DojahVerificationResponse> {
    return {
      success: true,
      data: {},
      referenceId: payload.referenceId,
      status: 'in_progress',
    };
  }

  async getVerificationDetails(referenceId: string): Promise<DojahVerificationResponse> {
    try {
      const { data } = await axios.get(
        `${this.config.baseUrl}/api/v1/kyc/verification`,
        {
          headers: this.headers(),
          params: { reference_id: referenceId },
        }
      );

      return {
        success: true,
        data,
        referenceId,
        status: this.mapDojahStatus(data),
      };
    } catch (error) {
      console.error('Dojah get verification details error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch verification details',
      };
    }
  }

  mapDojahStatus(raw: Record<string, unknown>): string {
    const status = String(raw?.status ?? raw?.verification_status ?? 'pending').toLowerCase();

    if (['approved', 'success', 'verified', 'complete', 'completed'].includes(status)) {
      return 'approved';
    }

    if (['rejected', 'failed', 'denied'].includes(status)) {
      return 'rejected';
    }

    if (['review', 'requires_review', 'manual_review', 'pending_review'].includes(status)) {
      return 'requires_review';
    }

    return 'in_progress';
  }

  verifyWebhookSignature(payload: string, signatureHeader: string | null): boolean {
    if (!signatureHeader) {
      return false;
    }

    try {
      const crypto = require('crypto');
      const expected = crypto
        .createHmac('sha512', this.config.secretKey)
        .update(payload)
        .digest('hex');
      return signatureHeader === expected;
    } catch {
      return false;
    }
  }
}

export function getDojahService() {
  const config: DojahConfig = {
    appId: process.env.NEXT_PUBLIC_DOJAH_APP_ID || '',
    publicKey: process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || '',
    secretKey: process.env.DOJAH_SECRET_KEY || '',
    baseUrl: process.env.DOJAH_BASE_URL || 'https://api.dojah.io',
  };

  if (!config.appId || !config.publicKey || !config.secretKey) {
    console.warn('[Dojah] Missing required env vars for server-side service');
  }

  return new DojahService(config);
}

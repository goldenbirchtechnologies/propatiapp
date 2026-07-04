import axios, { AxiosInstance } from 'axios';
import { computeFees } from './fees';
import { createHmac } from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Type definitions for better type safety
export interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (multiply NGN by 100)
  reference: string;
  metadata: {
    transactionType: 'rent' | 'caution_deposit' | 'service_charge' | 'sale' | 'short_let';
    agreementId?: string;
    listingId?: string;
    userId: string;
    [key: string]: unknown;
  };
  callback_url?: string;
  channels?: string[];
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, unknown>;
    fees: number;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

export interface TransferRecipientParams {
  name: string;
  account_number: string;
  bank_code: string;
  type?: 'nuban';
  currency?: 'NGN';
}

export interface TransferRecipientResponse {
  status: boolean;
  message: string;
  data: {
    recipient_code: string;
    type: string;
    name: string;
    details: {
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

export interface InitiateTransferParams {
  amount: number; // in kobo
  recipient: string; // recipient code
  reference: string;
  reason?: string;
  source?: 'balance';
}

export interface InitiateTransferResponse {
  status: boolean;
  message: string;
  data: {
    transfer_code: string;
    reference: string;
    status: 'pending' | 'success' | 'failed';
    amount: number;
    recipient: string;
    reason: string;
  };
}

class PaystackClient {
  private client: AxiosInstance;
  private secretKey: string;

  constructor() {
    this.secretKey = PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey && process.env.NODE_ENV !== 'test') {
      console.warn('[Paystack] PAYSTACK_SECRET_KEY not configured. Using mock mode.');
    }
    this.client = axios.create({
      baseURL: PAYSTACK_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check if Paystack is properly configured
   */
  isConfigured(): boolean {
    return !!this.secretKey && this.secretKey.length > 0;
  }

  /**
   * Initialize a payment transaction
   * @param params Payment parameters
   * @returns Initialize payment response
   */
  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResponse> {
    if (!this.isConfigured()) {
      // Mock mode for development
      return this.mockInitializePayment(params);
    }

    try {
      const response = await this.client.post('/transaction/initialize', {
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        metadata: params.metadata,
        callback_url: params.callback_url,
        channels: params.channels || ['card', 'bank', 'ussd', 'bank_transfer'],
      });
      return response.data;
    } catch (error) {
      console.error('[Paystack] Initialize payment error:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  /**
   * Verify a payment transaction
   * @param reference Payment reference
   * @returns Verify payment response
   */
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) {
      // Mock mode for development
      return this.mockVerifyPayment(reference);
    }

    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('[Paystack] Verify payment error:', error);
      throw new Error('Failed to verify payment. Please try again.');
    }
  }

  // Legacy methods (backward compatibility)
  async initializeTransaction(data: {
    email: string;
    amount: number; // in kobo
    reference?: string;
    callback_url?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
  }) {
    const response = await this.client.post('/transaction/initialize', data);
    return response.data;
  }

  async verifyTransaction(reference: string) {
    const response = await this.client.get(`/transaction/verify/${reference}`);
    return response.data;
  }

  async createTransfer(data: {
    source: 'balance';
    amount: number; // in kobo
    recipient: string; // recipient code
    reason?: string;
    reference?: string;
  }) {
    const response = await this.client.post('/transfer', data);
    return response.data;
  }

  /**
   * Create a transfer recipient for escrow release
   * @param params Recipient parameters
   * @returns Transfer recipient response
   */
  async createTransferRecipient(params: TransferRecipientParams): Promise<TransferRecipientResponse> {
    if (!this.isConfigured()) {
      // Mock mode for development
      return this.mockCreateTransferRecipient(params);
    }

    try {
      const response = await this.client.post('/transferrecipient', {
        type: params.type || 'nuban',
        name: params.name,
        account_number: params.account_number,
        bank_code: params.bank_code,
        currency: params.currency || 'NGN',
      });
      return response.data;
    } catch (error) {
      console.error('[Paystack] Create transfer recipient error:', error);
      throw new Error('Failed to create transfer recipient. Please check bank details.');
    }
  }

  /**
   * Initiate a transfer (escrow release)
   * @param params Transfer parameters
   * @returns Transfer response
   */
  async initiateTransfer(params: InitiateTransferParams): Promise<InitiateTransferResponse> {
    if (!this.isConfigured()) {
      // Mock mode for development
      return this.mockInitiateTransfer(params);
    }

    try {
      const response = await this.client.post('/transfer', {
        source: params.source || 'balance',
        amount: params.amount,
        recipient: params.recipient,
        reason: params.reason || 'Escrow release',
        reference: params.reference,
      });
      return response.data;
    } catch (error) {
      console.error('[Paystack] Initiate transfer error:', error);
      throw new Error('Failed to initiate transfer. Please try again.');
    }
  }

  async listBanks(country = 'nigeria') {
    const response = await this.client.get('/bank', { params: { country } });
    return response.data;
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    const response = await this.client.get('/bank/resolve', {
      params: { account_number: accountNumber, bank_code: bankCode },
    });
    return response.data;
  }

  async createSubscription(data: {
    customer: string; // customer code or email
    plan: string; // plan code
    authorization?: string;
    start_date?: string;
  }) {
    const response = await this.client.post('/subscription', data);
    return response.data;
  }

  async listSubscriptions(customer?: string) {
    const response = await this.client.get('/subscription', { params: { customer } });
    return response.data;
  }

  async cancelSubscription(subscriptionCode: string, token: string) {
    const response = await this.client.post('/subscription/disable', {
      code: subscriptionCode,
      token,
    });
    return response.data;
  }

  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  }) {
    const response = await this.client.post('/customer', data);
    return response.data;
  }

  async getCustomer(customerCode: string) {
    const response = await this.client.get(`/customer/${customerCode}`);
    return response.data;
  }

  async createPlan(data: {
    name: string;
    amount: number; // in kobo
    interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
    description?: string;
  }) {
    const response = await this.client.post('/plan', data);
    return response.data;
  }

  // Webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  // ========================================================================
  // MOCK METHODS FOR DEVELOPMENT (when Paystack is not configured)
  // ========================================================================

  private mockInitializePayment(params: InitializePaymentParams): InitializePaymentResponse {
    console.log('[Paystack Mock] Initialize payment:', params);
    const mockReference = params.reference || this.generatePaymentReference();
    return {
      status: true,
      message: 'Authorization URL created (MOCK)',
      data: {
        authorization_url: `http://localhost:3000/mock-payment/${mockReference}`,
        access_code: `mock_access_${Date.now()}`,
        reference: mockReference,
      },
    };
  }

  private mockVerifyPayment(reference: string): VerifyPaymentResponse {
    console.log('[Paystack Mock] Verify payment:', reference);
    return {
      status: true,
      message: 'Verification successful (MOCK)',
      data: {
        id: Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference,
        amount: 1000000, // 10,000 NGN
        message: null,
        gateway_response: 'Successful (MOCK)',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        metadata: {},
        fees: 1500,
        customer: {
          id: 123,
          email: 'test@example.com',
          customer_code: 'CUS_mock123',
        },
        authorization: {
          authorization_code: 'AUTH_mock',
          bin: '408408',
          last4: '4081',
          exp_month: '12',
          exp_year: '2025',
          channel: 'card',
          card_type: 'visa',
          bank: 'TEST Bank',
          country_code: 'NG',
          brand: 'visa',
          reusable: true,
          signature: 'SIG_mock',
        },
      },
    };
  }

  private mockCreateTransferRecipient(params: TransferRecipientParams): TransferRecipientResponse {
    console.log('[Paystack Mock] Create transfer recipient:', params);
    return {
      status: true,
      message: 'Transfer recipient created (MOCK)',
      data: {
        recipient_code: `RCP_mock_${Date.now()}`,
        type: 'nuban',
        name: params.name,
        details: {
          account_number: params.account_number,
          account_name: params.name,
          bank_code: params.bank_code,
          bank_name: 'Test Bank',
        },
      },
    };
  }

  private mockInitiateTransfer(params: InitiateTransferParams): InitiateTransferResponse {
    console.log('[Paystack Mock] Initiate transfer:', params);
    return {
      status: true,
      message: 'Transfer initiated (MOCK)',
      data: {
        transfer_code: `TRF_mock_${Date.now()}`,
        reference: params.reference,
        status: 'success',
        amount: params.amount,
        recipient: params.recipient,
        reason: params.reason || 'Escrow release',
      },
    };
  }

  private generatePaymentReference(): string {
    return `PROP_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}

export const paystack = new PaystackClient();

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

/**
 * Calculate platform fee based on transaction type
 * @param amount Amount in kobo
 * @param transactionType Transaction type
 * @returns Platform fee in kobo
 */
export function calculatePlatformFee(amount: number, transactionType: string): number {
  const hasAgent = false; // Default, will be overridden in actual usage
  const fees = computeFees(transactionType as any, amount, hasAgent);
  return fees.platformFee;
}

/**
 * Generate a unique payment reference
 * Format: PROP_timestamp_random
 * @returns Payment reference string
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `PROP_${timestamp}_${random}`;
}

/**
 * Convert Naira to Kobo (multiply by 100)
 * @param naira Amount in Naira
 * @returns Amount in Kobo
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert Kobo to Naira (divide by 100)
 * @param kobo Amount in Kobo
 * @returns Amount in Naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

// Legacy type exports
export type PaystackInitializeResponse = Awaited<ReturnType<typeof paystack.initializeTransaction>>;
export type PaystackVerifyResponse = Awaited<ReturnType<typeof paystack.verifyTransaction>>;
export type PaystackWebhookEvent = {
  event: string;
  data: Record<string, unknown>;
};
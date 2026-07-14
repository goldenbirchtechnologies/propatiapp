
import axios, { AxiosInstance } from 'axios';
import { computeFees } from './fees';
import { createHmac } from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, unknown>;
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
  amount: number;
  recipient: string;
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

export interface CreateCustomerParams {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateCustomerResponse {
  status: boolean;
  message: string;
  data: {
    customer_code: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface DedicatedAccountResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    account_number: string;
    account_name: string;
    bank: {
      id: number;
      name: string;
      slug: string;
    };
    assigned: boolean;
    currency: string;
    active: boolean;
    customer: {
      id: number;
      customer_code: string;
    };
  };
}

class PaystackClient {
  private client: AxiosInstance;
  private secretKey: string;

  constructor() {
    this.secretKey = PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey && process.env.NODE_ENV !== 'test') {
      console.warn('[Paystack] PAYSTACK_SECRET_KEY not configured.');
    }
    this.client = axios.create({
      baseURL: PAYSTACK_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  isConfigured(): boolean {
    return !!this.secretKey && this.secretKey.length > 0;
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResponse> {
    if (!this.isConfigured()) return this.mockInitializePayment(params);
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

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    if (!this.isConfigured()) return this.mockVerifyPayment(reference);
    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('[Paystack] Verify payment error:', error);
      throw new Error('Failed to verify payment. Please try again.');
    }
  }

  async createCustomer(params: CreateCustomerParams): Promise<CreateCustomerResponse> {
    if (!this.isConfigured()) return this.mockCreateCustomer(params);
    try {
      const response = await this.client.post('/customer', params);
      return response.data;
    } catch (error) {
      console.error('[Paystack] Create customer error:', error);
      throw new Error('Failed to create Paystack customer. Please try again.');
    }
  }

  async createDedicatedAccount(customerCode: string): Promise<DedicatedAccountResponse> {
    if (!this.isConfigured()) return this.mockDedicatedAccount(customerCode);
    try {
      const response = await this.client.post('/dedicated_account', { customer: customerCode, currency: 'NGN' });
      return response.data;
    } catch (error) {
      console.error('[Paystack] Create dedicated account error:', error);
      throw new Error('Failed to create dedicated account.');
    }
  }

  async fetchDedicatedAccount(customerCode: string): Promise<DedicatedAccountResponse> {
    if (!this.isConfigured()) return this.mockDedicatedAccount(customerCode);
    try {
      const response = await this.client.get(`/dedicated_account/${encodeURIComponent(customerCode)}`);
      return response.data;
    } catch (error) {
      console.error('[Paystack] Fetch dedicated account error:', error);
      return this.mockDedicatedAccount(customerCode);
    }
  }

  // Legacy methods (backward compatibility)
  async initializeTransaction(data: {
    email: string;
    amount: number;
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

  async createTransfer(data: { source?: 'balance'; amount: number; recipient: string; reference?: string; reason?: string }) {
    const response = await this.client.post('/transfer', data);
    return response.data;
  }

  async createTransferRecipient(params: TransferRecipientParams): Promise<TransferRecipientResponse> {
    if (!this.isConfigured()) return this.mockCreateTransferRecipient(params);
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

  async initiateTransfer(params: InitiateTransferParams): Promise<InitiateTransferResponse> {
    if (!this.isConfigured()) return this.mockInitiateTransfer(params);
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

  async createSubscription(data: { customer: string; plan: string; authorization?: string; start_date?: string }) {
    const response = await this.client.post('/subscription', data);
    return response.data;
  }

  async listSubscriptions(customer?: string) {
    const response = await this.client.get('/subscription', { params: { customer } });
    return response.data;
  }

  async cancelSubscription(subscriptionCode: string, token: string) {
    const response = await this.client.post('/subscription/disable', { code: subscriptionCode, token });
    return response.data;
  }

  async getCustomer(customerCode: string) {
    const response = await this.client.get(`/customer/${customerCode}`);
    return response.data;
  }

  async createPlan(data: { name: string; amount: number; interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually'; description?: string }) {
    const response = await this.client.post('/plan', data);
    return response.data;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = createHmac('sha512', this.secretKey).update(payload).digest('hex');
    return hash === signature;
  }

  // ========================================================================
  // MOCK METHODS FOR LOCAL DEVELOPMENT
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
        amount: 1000000,
        message: null,
        gateway_response: 'Successful (MOCK)',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        metadata: {},
        fees: 1500,
        customer: { id: 123, email: 'test@example.com', customer_code: 'CUS_mock123' },
        authorization: ***
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

  private mockCreateCustomer(params: CreateCustomerParams): CreateCustomerResponse {
    const code = `CUS_mock_${Date.now()}`;
    console.log('[Paystack Mock] Create customer:', params.email, '=>', code);
    return { status: true, message: 'Customer created (MOCK)', data: { customer_code: code, email: params.email, first_name: params.first_name, last_name: params.last_name, phone: params.phone, metadata: params.metadata } };
  }

  private mockDedicatedAccount(customerCode: string): DedicatedAccountResponse {
    console.log('[Paystack Mock] Dedicated account for:', customerCode);
    return {
      status: true,
      message: 'Dedicated account created (MOCK)',
      data: {
        id: Math.floor(Math.random() * 100000),
        account_number: `98${Math.floor(Math.random() * 1000000000)}`,
        account_name: 'MOCK USER',
        bank: { id: 1, name: 'Test Bank', slug: 'test-bank' },
        assigned: true,
        currency: 'NGN',
        active: true,
        customer: { id: Math.floor(Math.random() * 1000), customer_code: customerCode },
      },
    };
  }

  private mockCreateTransferRecipient(params: TransferRecipientParams): TransferRecipientResponse {
    console.log('[Paystack Mock] Transfer recipient:', params.name, params.account_number);
    return {
      status: true,
      message: 'Transfer recipient created (MOCK)',
      data: { recipient_code: `RCP_mock_${Date.now()}`, type: 'nuban', name: params.name, details: { account_number: params.account_number, account_name: params.name, bank_code: params.bank_code, bank_name: 'Test Bank' } },
    };
  }

  private mockInitiateTransfer(params: InitiateTransferParams): InitiateTransferResponse {
    console.log('[Paystack Mock] Initiate transfer:', params.reference);
    return {
      status: true,
      message: 'Transfer initiated (MOCK)',
      data: { transfer_code: `TRF_mock_${Date.now()}`, reference: params.reference, status: 'success', amount: params.amount, recipient: params.recipient, reason: params.reason || 'Escrow release' },
    };
  }

  private generatePaymentReference(): string {
    return `PROP_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}

export const paystack = new PaystackClient();

export function calculatePlatformFee(amount: number, transactionType: string): number {
  const fees = computeFees(transactionType as any, amount, false);
  return fees.platformFee;
}

export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `PROP_${timestamp}_${random}`;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export type PaystackInitializeResponse = Awaited<ReturnType<typeof paystack.initializeTransaction>>;
export type PaystackVerifyResponse = Awaited<ReturnType<typeof paystack.verifyTransaction>>;
export type PaystackWebhookEvent = { event: string; data: Record<string, unknown>; };

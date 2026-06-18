import axios, { AxiosInstance } from 'axios';

class PaystackClient {
  private client: AxiosInstance;
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

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

  async createTransferRecipient(data: {
    type: 'nuban';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: 'NGN';
  }) {
    const response = await this.client.post('/transferrecipient', data);
    return response.data;
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
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }
}

export const paystack = new PaystackClient();

export type PaystackInitializeResponse = Awaited<ReturnType<typeof paystack.initializeTransaction>>;
export type PaystackVerifyResponse = Awaited<ReturnType<typeof paystack.verifyTransaction>>;
export type PaystackWebhookEvent = {
  event: string;
  data: Record<string, unknown>;
};
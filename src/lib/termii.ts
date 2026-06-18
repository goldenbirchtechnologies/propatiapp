import axios, { AxiosInstance } from 'axios';

class TermiiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.TERMII_API_KEY!;
    this.senderId = process.env.TERMII_SENDER_ID || 'PROPATI';
    this.client = axios.create({
      baseURL: 'https://api.ng.termii.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendSms(data: {
    to: string | string[];
    sms: string;
    type?: 'plain' | 'voice';
    channel?: 'dnd' | 'whatsapp' | 'generic';
    from?: string;
    api_key?: string;
  }) {
    const response = await this.client.post('/api/sms/send', {
      ...data,
      from: data.from || this.senderId,
      api_key: data.api_key || this.apiKey,
      type: data.type || 'plain',
      channel: data.channel || 'generic',
    });
    return response.data;
  }

  async sendOtp(data: {
    to: string;
    pin_attempts?: number;
    pin_time_to_live?: number;
    pin_length?: number;
    pin_placeholder?: string;
    message_text?: string;
    pin_type?: 'NUMERIC' | 'ALPHANUMERIC';
    api_key?: string;
  }) {
    const response = await this.client.post('/api/sms/otp/send', {
      ...data,
      api_key: data.api_key || this.apiKey,
      pin_attempts: data.pin_attempts || 3,
      pin_time_to_live: data.pin_time_to_live || 10,
      pin_length: data.pin_length || 6,
      pin_type: data.pin_type || 'NUMERIC',
    });
    return response.data;
  }

  async verifyOtp(data: {
    pin_id: string;
    pin: string;
    api_key?: string;
  }) {
    const response = await this.client.post('/api/sms/otp/verify', {
      ...data,
      api_key: data.api_key || this.apiKey,
    });
    return response.data;
  }

  async getBalance() {
    const response = await this.client.get('/api/check-balance', {
      params: { api_key: this.apiKey },
    });
    return response.data;
  }

  async getInbox(page = 1, limit = 20) {
    const response = await this.client.get('/api/sms/inbox', {
      params: { api_key: this.apiKey, page, limit },
    });
    return response.data;
  }
}

export const termii = new TermiiClient();

export type TermiiSmsResponse = Awaited<ReturnType<typeof termii.sendSms>>;
export type TermiiOtpResponse = Awaited<ReturnType<typeof termii.sendOtp>>;
export type TermiiVerifyResponse = Awaited<ReturnType<typeof termii.verifyOtp>>;
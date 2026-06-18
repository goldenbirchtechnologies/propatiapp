import axios, { AxiosInstance } from 'axios';

class PremblyClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PREMBLY_API_KEY!;
    this.client = axios.create({
      baseURL: 'https://api.prembly.com',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // NIN Verification
  async verifyNin(nin: string, firstName?: string, lastName?: string) {
    const response = await this.client.post('/identitypass/verification/nin', {
      nin,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  }

  // BVN Verification
  async verifyBvn(bvn: string, firstName?: string, lastName?: string) {
    const response = await this.client.post('/identitypass/verification/bvn', {
      bvn,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  }

  // Drivers License Verification
  async verifyDriversLicense(number: string, dob: string, firstName?: string, lastName?: string) {
    const response = await this.client.post('/identitypass/verification/drivers-license', {
      number,
      dob,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  }

  // Voters Card Verification
  async verifyVotersCard(number: string, firstName?: string, lastName?: string) {
    const response = await this.client.post('/identitypass/verification/voters-card', {
      number,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  }

  // International Passport Verification
  async verifyPassport(number: string, dob: string, firstName?: string, lastName?: string) {
    const response = await this.client.post('/identitypass/verification/international-passport', {
      number,
      dob,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  }

  // Face Match / Liveness
  async faceMatch(imageBase64: string, referenceImageBase64?: string) {
    const response = await this.client.post('/identitypass/verification/face-match', {
      image: imageBase64,
      reference_image: referenceImageBase64,
    });
    return response.data;
  }

  // Document Verification (CAC, etc.)
  async verifyDocument(type: 'cac' | 'tin' | 'rcc', number: string) {
    const response = await this.client.post('/identitypass/verification/document', {
      type,
      number,
    });
    return response.data;
  }

  // Bank Account Resolution
  async resolveBankAccount(accountNumber: string, bankCode: string) {
    const response = await this.client.post('/identitypass/verification/bank-account', {
      account_number: accountNumber,
      bank_code: bankCode,
    });
    return response.data;
  }

  // Get Supported Banks
  async getBanks() {
    const response = await this.client.get('/identitypass/banks');
    return response.data;
  }
}

export const prembly = new PremblyClient();

export type PremblyNinResponse = Awaited<ReturnType<typeof prembly.verifyNin>>;
export type PremblyBvnResponse = Awaited<ReturnType<typeof prembly.verifyBvn>>;
export type PremblyFaceMatchResponse = Awaited<ReturnType<typeof prembly.faceMatch>>;
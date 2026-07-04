import axios, { AxiosInstance, AxiosError } from 'axios';

// Prembly IdentityPass v2 API Base URL
const PREMBLY_BASE_URL = 'https://api.myidentitypass.com/v2';
const PREMBLY_API_KEY = process.env.PREMBLY_API_KEY || '';
const PREMBLY_APP_ID = process.env.PREMBLY_APP_ID || '';

// Mock mode for development (if credentials not configured)
const MOCK_MODE = !PREMBLY_API_KEY || !PREMBLY_APP_ID || PREMBLY_API_KEY === 'your_api_key_here';

// Response interfaces based on Prembly IdentityPass v2 API
export interface PremblyNinDetail {
  firstname: string;
  surname: string;
  middlename?: string;
  phone?: string;
  birthdate: string;
  nin: string;
  gender?: string;
  residence_state?: string;
}

export interface PremblyNinResponse {
  status: 'success' | 'failed';
  detail: PremblyNinDetail;
  verification_reference?: string;
}

export interface PremblyBvnDetail {
  firstname: string;
  surname: string;
  middlename?: string;
  phone?: string;
  birthdate: string;
  bvn: string;
  gender?: string;
}

export interface PremblyBvnResponse {
  status: 'success' | 'failed';
  detail: PremblyBvnDetail;
  verification_reference?: string;
}

export interface PremblyVerificationStatusResponse {
  status: 'success' | 'failed' | 'pending';
  detail: Record<string, unknown>;
  verification_reference: string;
}

export interface PremblyError {
  status: 'failed';
  message: string;
  error_code?: string;
}

class PremblyClient {
  private client: AxiosInstance;
  private mockMode: boolean;

  constructor() {
    this.mockMode = MOCK_MODE;

    if (this.mockMode) {
      console.warn('⚠️  Prembly running in MOCK MODE - credentials not configured');
    }

    this.client = axios.create({
      baseURL: PREMBLY_BASE_URL,
      headers: {
        'x-api-key': PREMBLY_API_KEY,
        'app-id': PREMBLY_APP_ID,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Verify NIN (National Identity Number)
   */
  async verifyNIN(nin: string, firstName: string, lastName: string): Promise<PremblyNinResponse> {
    if (this.mockMode) {
      return this.mockNinVerification(nin, firstName, lastName);
    }

    try {
      const response = await this.client.post<PremblyNinResponse>('/api/v1/verification/nin', {
        number: nin,
        firstname: firstName,
        lastname: lastName,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'NIN verification failed');
    }
  }

  /**
   * Verify BVN (Bank Verification Number)
   */
  async verifyBVN(bvn: string, firstName: string, lastName: string): Promise<PremblyBvnResponse> {
    if (this.mockMode) {
      return this.mockBvnVerification(bvn, firstName, lastName);
    }

    try {
      const response = await this.client.post<PremblyBvnResponse>('/api/v1/verification/bvn', {
        number: bvn,
        firstname: firstName,
        lastname: lastName,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'BVN verification failed');
    }
  }

  /**
   * Get verification status by reference
   */
  async getVerificationStatus(reference: string): Promise<PremblyVerificationStatusResponse> {
    if (this.mockMode) {
      return {
        status: 'success',
        detail: { verified: true },
        verification_reference: reference,
      };
    }

    try {
      const response = await this.client.get<PremblyVerificationStatusResponse>(
        `/api/v1/verification/${reference}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get verification status');
    }
  }

  /**
   * Handle Prembly API errors
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<PremblyError>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message;
      const errorCode = axiosError.response?.data?.error_code;

      // Common Prembly errors
      if (errorMessage?.includes('Invalid credentials') || axiosError.response?.status === 401) {
        return new Error('PREMBLY_INVALID_CREDENTIALS');
      }
      if (errorMessage?.includes('not found') || errorMessage?.includes('No record found')) {
        return new Error('PREMBLY_RECORD_NOT_FOUND');
      }
      if (errorMessage?.includes('Name mismatch') || errorMessage?.includes('does not match')) {
        return new Error('PREMBLY_NAME_MISMATCH');
      }
      if (axiosError.response?.status === 429) {
        return new Error('PREMBLY_RATE_LIMIT');
      }
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return new Error('PREMBLY_TIMEOUT');
      }

      return new Error(errorCode ? `PREMBLY_ERROR: ${errorCode}` : errorMessage || defaultMessage);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(defaultMessage);
  }

  /**
   * Mock NIN verification for development
   */
  private mockNinVerification(nin: string, firstName: string, lastName: string): PremblyNinResponse {
    console.log(`🔧 MOCK: Verifying NIN ${nin} for ${firstName} ${lastName}`);

    // Simulate successful verification
    if (nin.length === 11 && firstName.length > 1 && lastName.length > 1) {
      return {
        status: 'success',
        detail: {
          firstname: firstName.toUpperCase(),
          surname: lastName.toUpperCase(),
          middlename: 'OLUWASEUN',
          phone: '08012345678',
          birthdate: '1990-01-15',
          nin: nin,
          gender: 'M',
          residence_state: 'LAGOS',
        },
        verification_reference: `mock_nin_${Date.now()}`,
      };
    }

    // Simulate failure
    return {
      status: 'failed',
      detail: {
        firstname: '',
        surname: '',
        phone: '',
        birthdate: '',
        nin: '',
      },
    };
  }

  /**
   * Mock BVN verification for development
   */
  private mockBvnVerification(bvn: string, firstName: string, lastName: string): PremblyBvnResponse {
    console.log(`🔧 MOCK: Verifying BVN ${bvn} for ${firstName} ${lastName}`);

    // Simulate successful verification
    if (bvn.length === 11 && firstName.length > 1 && lastName.length > 1) {
      return {
        status: 'success',
        detail: {
          firstname: firstName.toUpperCase(),
          surname: lastName.toUpperCase(),
          middlename: 'OLUWASEUN',
          phone: '08012345678',
          birthdate: '1990-01-15',
          bvn: bvn,
          gender: 'M',
        },
        verification_reference: `mock_bvn_${Date.now()}`,
      };
    }

    // Simulate failure
    return {
      status: 'failed',
      detail: {
        firstname: '',
        surname: '',
        phone: '',
        birthdate: '',
        bvn: '',
      },
    };
  }

  /**
   * Check if client is in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
}

export const prembly = new PremblyClient();
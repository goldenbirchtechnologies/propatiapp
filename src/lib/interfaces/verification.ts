import type { verifyNIN, verifyBVN } from '../prembly';
import type { DojahVerifyBVNResponse, DojahVerifyNINResponse } from '../dojah';

export interface IdentityVerificationResult {
  verified: boolean;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  photo?: string;
  raw: Record<string, unknown>;
}

export interface BusinessVerificationResult {
  verified: boolean;
  companyName?: string;
  rcNumber?: string;
  incorporationDate?: string;
  raw: Record<string, unknown>;
}

export interface VerificationProvider {
  verifyIdentity(idType: 'nin' | 'bvn' | 'passport' | 'drivers_licence' | 'voters_card', idNumber: string, firstName?: string, lastName?: string): Promise<IdentityVerificationResult>;
  verifyBusiness(rcNumber: string): Promise<BusinessVerificationResult>;
  getSupportedIdTypes(): string[];
  isAvailable(): boolean;
}

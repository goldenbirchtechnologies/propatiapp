import type { VerificationProvider, IdentityVerificationResult, BusinessVerificationResult } from '../../interfaces';
import { prembly } from '../../prembly';

export const verificationProvider: VerificationProvider = {
  async verifyIdentity(idType, idNumber, firstName, lastName) {
    if (idType === 'nin') {
      const result = await prembly.verifyNIN(idNumber, firstName ?? '', lastName ?? '');
      return {
        verified: result.status === 'success',
        fullName: `${result.detail.firstname ?? ''} ${result.detail.surname ?? ''}`.trim() || undefined,
        raw: result as unknown as Record<string, unknown>,
      };
    }
    if (idType === 'bvn') {
      const result = await prembly.verifyBVN(idNumber, firstName ?? '', lastName ?? '');
      return {
        verified: result.status === 'success',
        fullName: `${result.detail.firstname ?? ''} ${result.detail.surname ?? ''}`.trim() || undefined,
        raw: result as unknown as Record<string, unknown>,
      };
    }
    return { verified: false, raw: {} };
  },
  async verifyBusiness(rcNumber) {
    return { verified: false, rcNumber, raw: {} };
  },
  getSupportedIdTypes() {
    return ['nin', 'bvn', 'passport', 'drivers_licence', 'voters_card'];
  },
  isAvailable() {
    return true;
  },
};

import type { VerificationProvider, IdentityVerificationResult, BusinessVerificationResult } from '../../interfaces';
import { verifyNIN, verifyBVN } from '../../prembly';

export const verificationProvider: VerificationProvider = {
  async verifyIdentity(idType, idNumber, firstName, lastName) {
    if (idType === 'nin') {
      const result = await verifyNIN(idNumber, firstName, lastName);
      return {
        verified: result.verified,
        fullName: result.fullName,
        raw: result as unknown as Record<string, unknown>,
      };
    }
    if (idType === 'bvn') {
      const result = await verifyBVN(idNumber);
      return {
        verified: result.verified,
        fullName: result.fullName,
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

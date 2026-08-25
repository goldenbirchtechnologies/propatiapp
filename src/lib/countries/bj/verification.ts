import type { VerificationProvider } from '../../interfaces';

export const verificationProvider: VerificationProvider = {
  async verifyIdentity(idType, idNumber, firstName, lastName) {
    console.log('[BJ Verification] Verifying identity (mock):', idType, idNumber);
    return { verified: false, raw: { idType, idNumber } };
  },
  async verifyBusiness(rcNumber) {
    return { verified: false, rcNumber, raw: {} };
  },
  getSupportedIdTypes() {
    return ['cni', 'passport', 'drivers_licence'];
  },
  isAvailable() {
    return false;
  },
};

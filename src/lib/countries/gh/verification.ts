import type { VerificationProvider, IdentityVerificationResult, BusinessVerificationResult } from '../../interfaces';

export const verificationProvider: VerificationProvider = {
  async verifyIdentity(idType, idNumber, firstName, lastName) {
    // TODO: Ghana Card API integration
    console.log('[GH Verification] Verifying identity (mock):', idType, idNumber);
    return { verified: false, raw: { idType, idNumber } };
  },
  async verifyBusiness(rcNumber) {
    // TODO: Ghana business verification
    return { verified: false, rcNumber, raw: {} };
  },
  getSupportedIdTypes() {
    return ['ghana_card', 'passport', 'drivers_licence'];
  },
  isAvailable() {
    return false; // TODO: Enable when API is integrated
  },
};

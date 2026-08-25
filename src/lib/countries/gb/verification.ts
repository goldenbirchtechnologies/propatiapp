import type { VerificationProvider } from '../../interfaces';

export const verificationProvider: VerificationProvider = {
  async verifyIdentity(idType, idNumber, firstName, lastName) {
    console.log('[GB Verification] Right-to-Rent check (mock):', idType, idNumber);
    return { verified: false, raw: { idType, idNumber } };
  },
  async verifyBusiness(companyNumber) {
    return { verified: false, companyName: '', raw: {} };
  },
  getSupportedIdTypes() {
    return ['passport', 'biometric_residence_permit', 'eea_passport', 'drivers_licence'];
  },
  isAvailable() {
    return false;
  },
};

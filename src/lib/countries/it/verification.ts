import type { VerificationProvider } from '../../interfaces';

export const verificationProvider: VerificationProvider = {
  async verifyIdentity(idType, idNumber, firstName, lastName) {
    // Italian fiscal code (codice fiscale) validation
    console.log('[IT Verification] Codice fiscale check (mock):', idType, idNumber);
    return { verified: false, raw: { idType, idNumber } };
  },
  async verifyBusiness(companyNumber) {
    // Italian business verification (REA number)
    return { verified: false, companyName: '', raw: {} };
  },
  getSupportedIdTypes() {
    return ['codice_fiscale', 'passport', 'drivers_licence', 'carta_identita'];
  },
  isAvailable() {
    return false;
  },
};

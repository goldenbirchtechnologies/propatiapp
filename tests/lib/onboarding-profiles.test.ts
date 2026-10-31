import { describe, it, expect } from 'vitest';
import {
  isAgentLicenseDone,
  isAgentProfileDone,
  isAgentSettlementDone,
  isAgentTerritoryDone,
  isEstateAuthorityDone,
  isEstateProfileDone,
  isEstateRemittanceDone,
  isLandlordProfileDone,
  isLandlordSettlementDone,
  nextStepFor,
} from '@/lib/onboarding/profiles';

describe('onboarding role steps', () => {
  it('walks the landlord steps in order', () => {
    expect(nextStepFor('landlord', 'location')).toBe('contact');
    expect(nextStepFor('landlord', 'identity')).toBe('landlordProfile');
    expect(nextStepFor('landlord', 'landlordProfile')).toBe('landlordSettlement');
    expect(nextStepFor('landlord', 'landlordSettlement')).toBe('complete');
  });

  it('walks the agent steps in order', () => {
    expect(nextStepFor('agent', 'identity')).toBe('agentProfile');
    expect(nextStepFor('agent', 'agentProfile')).toBe('agentLicense');
    expect(nextStepFor('agent', 'agentLicense')).toBe('agentTerritory');
    expect(nextStepFor('agent', 'agentTerritory')).toBe('agentSettlement');
    expect(nextStepFor('agent', 'agentSettlement')).toBe('complete');
  });

  it('walks the estate manager steps in order', () => {
    expect(nextStepFor('estate_manager', 'identity')).toBe('estateProfile');
    expect(nextStepFor('estate_manager', 'estateProfile')).toBe('estateAuthority');
    expect(nextStepFor('estate_manager', 'estateAuthority')).toBe('estateRemittance');
    expect(nextStepFor('estate_manager', 'estateRemittance')).toBe('complete');
  });

  it('walks the tenant steps in order', () => {
    expect(nextStepFor('tenant', 'employment')).toBe('guarantor');
    expect(nextStepFor('tenant', 'guarantor')).toBe('complete');
  });

  it('completes immediately for admins', () => {
    expect(nextStepFor('admin', 'location')).toBe('complete');
  });
});

describe('landlord step completion', () => {
  const profile = {
    legalEntityType: 'individual',
    legalName: 'Chukwuemeka Okafor',
    primaryPhone: '+2348012345678',
    contactEmail: 'owner@example.com',
    mailingAddress: '12 Adeola Odeku St, Lagos',
    taxIdType: 'tin',
    taxNumber: '12345678',
    accountName: 'Chukwuemeka Okafor',
    bankName: 'GTBank',
    accountNumberEnc: 'ciphertext',
    commissionConsent: true,
  };

  it('is complete when every required field is present', () => {
    expect(isLandlordProfileDone(profile)).toBe(true);
    expect(isLandlordSettlementDone(profile)).toBe(true);
  });

  it('is not complete without a saved row', () => {
    expect(isLandlordProfileDone(null)).toBe(false);
    expect(isLandlordSettlementDone(null)).toBe(false);
  });

  it('is not complete when a required field is missing', () => {
    expect(isLandlordProfileDone({ ...profile, taxNumber: null })).toBe(false);
    expect(isLandlordSettlementDone({ ...profile, accountNumberEnc: null })).toBe(false);
  });

  it('requires the commission consent acknowledgement', () => {
    expect(isLandlordSettlementDone({ ...profile, commissionConsent: false })).toBe(false);
  });
});

describe('agent step completion', () => {
  const profile = {
    legalName: 'Tunde Bakare',
    businessPhone: '+2348012345678',
    emergencyContactName: 'Adaeze Bakare',
    emergencyContactPhone: '+2348098765432',
    emergencyContactRelationship: 'Spouse',
    board: 'NIESV',
    licenseNumber: 'LIC-8891',
    codeOfConductConsent: true,
    operationalTerritories: ['Lagos', 'Abuja'],
    focusAreas: ['Residential'],
    bankName: 'Zenith',
    accountName: 'Tunde Bakare',
    accountNumberEnc: 'ciphertext',
  };

  it('is complete when every required field is present', () => {
    expect(isAgentProfileDone(profile)).toBe(true);
    expect(isAgentLicenseDone(profile)).toBe(true);
    expect(isAgentTerritoryDone(profile)).toBe(true);
    expect(isAgentSettlementDone(profile)).toBe(true);
  });

  it('is not complete without a saved row', () => {
    expect(isAgentProfileDone(null)).toBe(false);
    expect(isAgentLicenseDone(null)).toBe(false);
    expect(isAgentTerritoryDone(null)).toBe(false);
    expect(isAgentSettlementDone(null)).toBe(false);
  });

  it('requires the code of conduct assent', () => {
    expect(isAgentLicenseDone({ ...profile, codeOfConductConsent: false })).toBe(false);
  });

  it('requires at least one territory and one focus area', () => {
    expect(isAgentTerritoryDone({ ...profile, operationalTerritories: [] })).toBe(false);
    expect(isAgentTerritoryDone({ ...profile, focusAreas: [] })).toBe(false);
    expect(isAgentTerritoryDone({ ...profile, focusAreas: null })).toBe(false);
  });
});

describe('estate manager step completion', () => {
  const profile = {
    legalEntityName: 'Golden Birch Facilities Ltd.',
    officeAddress: '4 Bourdillon Rd, Ikoyi',
    authoritySubmittedAt: new Date('2026-01-05T10:00:00Z'),
    trustBankName: 'First Bank',
    trustAccountName: 'Golden Birch Client Trust',
    trustAccountNumberEnc: 'ciphertext',
    remittanceCycle: 'monthly',
  };

  it('is complete when every required field is present', () => {
    expect(isEstateProfileDone(profile)).toBe(true);
    expect(isEstateAuthorityDone(profile)).toBe(true);
    expect(isEstateRemittanceDone(profile)).toBe(true);
  });

  it('is not complete without a saved row', () => {
    expect(isEstateProfileDone(null)).toBe(false);
    expect(isEstateAuthorityDone(null)).toBe(false);
    expect(isEstateRemittanceDone(null)).toBe(false);
  });

  it('treats an unanswered authority section as incomplete', () => {
    // Both answers default to false, so only the stamp proves it was answered.
    expect(isEstateAuthorityDone({ ...profile, authoritySubmittedAt: null })).toBe(false);
  });

  it('requires a remittance cycle and trust account', () => {
    expect(isEstateRemittanceDone({ ...profile, remittanceCycle: null })).toBe(false);
    expect(isEstateRemittanceDone({ ...profile, trustAccountName: null })).toBe(false);
  });
});

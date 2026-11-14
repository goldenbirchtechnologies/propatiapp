import { describe, it, expect } from 'vitest';
import {
  TENANT_SECTIONS,
  tenantProfileSummary,
  type TenantDossierFacts,
} from '@/lib/tenant-profile/completion';

function blankDossier(overrides: Partial<TenantDossierFacts> = {}): TenantDossierFacts {
  return {
    dateOfBirth: null,
    gender: null,
    nationality: null,
    stateOfResidence: null,
    lga: null,
    maritalStatus: null,
    addressLine1: null,
    city: null,
    employmentStatus: null,
    employmentType: null,
    employerName: null,
    jobTitle: null,
    yearlyIncome: null,
    otherIncomeSources: null,
    guarantorName: null,
    guarantorPhone: null,
    guarantorRelationship: null,
    nokName: null,
    nokPhone: null,
    nokRelationship: null,
    preferredBedrooms: null,
    maxMonthlyBudget: null,
    preferredState: null,
    ...overrides,
  };
}

const emptyInput = {
  dossier: null,
  addresses: [],
  emergencyContacts: [],
  verification: { idVerified: false, phoneVerified: false },
};

describe('tenantProfileSummary', () => {
  it('reports every section as incomplete for an untouched profile', () => {
    const summary = tenantProfileSummary(emptyInput);

    expect(summary.percent).toBe(0);
    expect(summary.completedCount).toBe(0);
    expect(summary.sections).toHaveLength(TENANT_SECTIONS.length);
    expect(summary.sections.every((s) => !s.done && s.missing.length > 0)).toBe(true);
  });

  it('returns 100% when every section is satisfied', () => {
    const summary = tenantProfileSummary({
      dossier: blankDossier({
        dateOfBirth: new Date('1994-03-02'),
        gender: 'female',
        nationality: 'NG',
        stateOfResidence: 'Lagos',
        maritalStatus: 'single',
        employmentStatus: 'employed',
        employerName: 'Zenith',
        jobTitle: 'Analyst',
        yearlyIncome: BigInt(9_600_000),
        guarantorName: 'Bode A.',
        guarantorPhone: '+2348012345678',
        guarantorRelationship: 'Uncle',
        nokName: 'Ada Obi',
        nokPhone: '+2348098765432',
        nokRelationship: 'Sister',
        preferredState: 'Lagos',
        preferredBedrooms: 2,
        maxMonthlyBudget: BigInt(450_000),
      }),
      addresses: [{ addressLine1: '12 Bode Thomas', city: 'Surulere' }],
      emergencyContacts: [{ name: 'Ada Obi', phone: '+2348098765432' }],
      verification: { idVerified: true, phoneVerified: true },
    });

    expect(summary.percent).toBe(100);
    expect(summary.completedCount).toBe(TENANT_SECTIONS.length);
    expect(summary.sections.every((s) => s.done)).toBe(true);
  });

  it('names the specific fields still missing', () => {
    const summary = tenantProfileSummary({
      ...emptyInput,
      dossier: blankDossier({ dateOfBirth: new Date('1994-03-02'), gender: 'male' }),
    });

    const personal = summary.sections.find((s) => s.sectionId === 'personal')!;
    expect(personal.done).toBe(false);
    expect(personal.missing).toContain('Nationality');
    expect(personal.missing).not.toContain('Date of birth');
    expect(personal.missing).not.toContain('Gender');
  });

  it('treats whitespace-only text as empty', () => {
    const summary = tenantProfileSummary({
      ...emptyInput,
      dossier: blankDossier({ preferredState: '   ', maxMonthlyBudget: BigInt(1), preferredBedrooms: 1 }),
    });

    const prefs = summary.sections.find((s) => s.sectionId === 'preferences')!;
    expect(prefs.done).toBe(false);
    expect(prefs.missing).toContain('Preferred area');
  });

  it('accepts zero bedrooms as a real answer', () => {
    const summary = tenantProfileSummary({
      ...emptyInput,
      dossier: blankDossier({
        preferredState: 'Lagos',
        maxMonthlyBudget: BigInt(200_000),
        preferredBedrooms: 0,
      }),
    });

    expect(summary.sections.find((s) => s.sectionId === 'preferences')!.done).toBe(true);
  });

  it('treats financial as answered when only an income is on file', () => {
    const summary = tenantProfileSummary({
      ...emptyInput,
      dossier: blankDossier({ yearlyIncome: BigInt(5_000_000) }),
    });

    expect(summary.sections.find((s) => s.sectionId === 'financial')!.done).toBe(true);
  });

  it('ignores address and contact rows that are only partially filled', () => {
    const summary = tenantProfileSummary({
      ...emptyInput,
      addresses: [{ addressLine1: '12 Bode Thomas', city: null }],
      emergencyContacts: [{ name: 'Ada Obi', phone: '' }],
    });

    expect(summary.sections.find((s) => s.sectionId === 'addressHistory')!.done).toBe(false);
    expect(summary.sections.find((s) => s.sectionId === 'emergencyContacts')!.done).toBe(false);
  });

  it('rounds the percentage to a whole number', () => {
    const summary = tenantProfileSummary({
      ...emptyInput,
      verification: { idVerified: true, phoneVerified: true },
    });

    expect(summary.completedCount).toBe(2);
    expect(summary.percent).toBe(20);
    expect(Number.isInteger(summary.percent)).toBe(true);
  });
});

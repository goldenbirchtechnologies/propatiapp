import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAgreementPDF, savePDFToAgreement, deletePDF, generateAndSaveAgreementPDF } from '@/lib/pdf-generator';

// --- Mocks ---

var mockPrismaAgreementFindUnique: ReturnType<typeof vi.fn>;
var mockPrismaAgreementUpdate: ReturnType<typeof vi.fn>;

vi.mock('@/lib/prisma', () => {
  mockPrismaAgreementFindUnique = vi.fn();
  mockPrismaAgreementUpdate = vi.fn();

  return {
    prisma: {
      agreement: {
        findUnique: mockPrismaAgreementFindUnique,
        update: mockPrismaAgreementUpdate,
      },
    },
  };
});

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({
        secure_url: 'https://example.com/doc.pdf',
        public_id: 'propati/agreements/test-id',
      }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

vi.mock('@/lib/agreement-templates', () => ({
  renderAgreementTemplate: vi.fn().mockReturnValue('<html><body></body></html>'),
}));

// Mock pdfkit: call listeners on next tick after `end()`
vi.mock('pdfkit', () => {
  class MockPDFDocument {
    on(event: string, cb: (...args: unknown[]) => void) {
      if (event === 'end') {
        setTimeout(cb, 0);
      }
    }
    text() {}
    moveDown() {}
    fontSize() {}
    font() {}
    addPage() {}
    end() {}
  }

  return { default: MockPDFDocument };
});

// --- Tests ---

describe('pdf-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPrismaAgreementFindUnique as any).mockReset();
    (mockPrismaAgreementUpdate as any).mockReset();
  });

  describe('generateAgreementPDF', () => {
    it('throws when agreement is not found', async () => {
      (mockPrismaAgreementFindUnique as any).mockResolvedValue(null);

      await expect(generateAgreementPDF('missing-id')).rejects.toThrow('Agreement not found');
    });

    it('throws when agreement is not fully signed', async () => {
      (mockPrismaAgreementFindUnique as any).mockResolvedValue({
        id: 'agreement-1',
        status: 'pending',
      });

      await expect(generateAgreementPDF('agreement-1')).rejects.toThrow(
        'Agreement must be fully signed before generating PDF'
      );
    });

    it('returns url and publicId for a fully signed agreement', async () => {
      (mockPrismaAgreementFindUnique as any).mockResolvedValue({
        id: 'agreement-1',
        status: 'fully_signed',
        type: 'rent',
        listing: { id: '1', title: 'Unit', area: 'VI', state: 'Lagos', address: '123 Main St' },
        landlord: { id: 'l1', fullName: 'Landlord', email: 'landlord@test.com', phone: '08000000000' },
        tenant: { id: 't1', fullName: 'Tenant', email: 'tenant@test.com', phone: '07000000000' },
        agent: { id: 'a1', fullName: 'Agent', email: 'agent@test.com' },
        signatures: [
          { id: 'sig-1', role: 'landlord', signedAt: new Date('2025-06-01T10:00:00Z'), signer: { fullName: 'Landlord' } },
          { id: 'sig-2', role: 'tenant', signedAt: new Date('2025-06-01T11:00:00Z'), signer: { fullName: 'Tenant' } },
        ],
        startDate: new Date('2025-07-01'),
        endDate: new Date('2026-06-30'),
        rentAmount: '500000',
        rentPeriod: 'monthly',
        cautionDeposit: '500000',
        serviceCharge: '50000',
        noticePeriodDays: 30,
        specialClauses: '',
        stampDuty: null,
      });

      const result = await generateAgreementPDF('agreement-1');

      expect(result.url).toBe('https://example.com/doc.pdf');
      expect(result.publicId).toBe('propati/agreements/test-id');
    });
  });

  describe('savePDFToAgreement', () => {
    it('updates agreement with PDF url, publicId and generatedAt', async () => {
      (mockPrismaAgreementUpdate as any).mockResolvedValue({ id: 'agreement-1' });

      await savePDFToAgreement('agreement-1', 'https://example.com/doc.pdf', 'propati/agreements/test-id');

      expect(mockPrismaAgreementUpdate).toHaveBeenCalledWith({
        where: { id: 'agreement-1' },
        data: {
          templateVars: {
            pdfUrl: 'https://example.com/doc.pdf',
            pdfPublicId: 'propati/agreements/test-id',
            generatedAt: expect.any(String),
          },
        },
      });
    });
  });

  describe('deletePDF', () => {
    it('calls cloudinary destroy and does not throw on error', async () => {
      const { v2 } = await import('cloudinary');
      (v2.uploader.destroy as any).mockRejectedValueOnce(new Error('cloudinary down'));

      await expect(deletePDF('propati/agreements/test-id')).resolves.toBeUndefined();
      expect(v2.uploader.destroy).toHaveBeenCalledWith('propati/agreements/test-id', { resource_type: 'raw' });
    });
  });

  describe('generateAndSaveAgreementPDF', () => {
    it('orchestrates generation and save', async () => {
      (mockPrismaAgreementFindUnique as any).mockResolvedValue({
        id: 'agreement-1',
        status: 'fully_signed',
        type: 'rent',
        listing: { id: '1', title: 'Unit', area: 'VI', state: 'Lagos', address: '123 Main St' },
        landlord: { id: 'l1', fullName: 'Landlord', email: 'l@test.com', phone: '08000000000' },
        tenant: { id: 't1', fullName: 'Tenant', email: 't@test.com', phone: '07000000000' },
        agent: null,
        signatures: [],
        startDate: null,
        endDate: null,
        rentAmount: '500000',
        rentPeriod: 'monthly',
        cautionDeposit: '500000',
        serviceCharge: '50000',
        noticePeriodDays: 30,
        specialClauses: null,
        stampDuty: null,
      });

      const result = await generateAndSaveAgreementPDF('agreement-1');

      expect(result.url).toBe('https://example.com/doc.pdf');
      expect(result.publicId).toBe('propati/agreements/test-id');
      expect(mockPrismaAgreementUpdate).toHaveBeenCalled();
    });
  });
});

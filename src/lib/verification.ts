import { prisma } from './prisma';
import { VerificationLayerStatus, VerificationOverallStatus, VerificationTier, IdType } from '@prisma/client';
import { sendEmail, emailTemplates } from './email';
import { getVerificationTierFromProgress } from './verification-helpers';

export type VerificationLayer = 1 | 2 | 3 | 4 | 5;
export type LayerAction = 'submit' | 'approve' | 'reject' | 'confirm' | 'schedule' | 'complete';

interface LayerTransition {
  from: VerificationOverallStatus;
  layer: VerificationLayer;
  action: LayerAction;
  to: VerificationOverallStatus;
  nextLayer?: number;
}

const VALID_TRANSITIONS: LayerTransition[] = [
  // Layer 1: Documents
  { from: 'not_started', layer: 1, action: 'submit', to: 'in_progress', nextLayer: 1 },
  { from: 'in_progress', layer: 1, action: 'approve', to: 'in_progress', nextLayer: 2 },
  { from: 'in_progress', layer: 1, action: 'reject', to: 'rejected' },

  // Layer 2: Identity Match
  { from: 'in_progress', layer: 2, action: 'confirm', to: 'in_progress', nextLayer: 3 },

  // Layer 3: Live Video
  { from: 'in_progress', layer: 3, action: 'approve', to: 'in_progress', nextLayer: 4 },
  { from: 'in_progress', layer: 3, action: 'reject', to: 'rejected' },

  // Layer 4: Physical Inspection
  { from: 'in_progress', layer: 4, action: 'schedule', to: 'in_progress' },
  { from: 'in_progress', layer: 4, action: 'complete', to: 'in_progress', nextLayer: 5 },
  { from: 'in_progress', layer: 4, action: 'reject', to: 'rejected' },

  // Layer 5: Admin Certification
  { from: 'in_progress', layer: 5, action: 'approve', to: 'certified' },
  { from: 'in_progress', layer: 5, action: 'reject', to: 'rejected' },

  // Any layer can be rejected
  { from: 'rejected', layer: 1, action: 'submit', to: 'in_progress', nextLayer: 1 },
];

export class VerificationService {
  static isFrozen(status: VerificationOverallStatus): boolean {
    return status === 'frozen';
  }

  static getTransition(
    currentStatus: VerificationOverallStatus,
    currentLayer: number,
    action: LayerAction
  ): LayerTransition | null {
    if (currentStatus === 'frozen') {
      return null; // Frozen verifications cannot proceed without unfreezing
    }
    return (
      VALID_TRANSITIONS.find(
        (t) => t.from === currentStatus && t.layer === currentLayer && t.action === action
      ) ?? null
    );
  }

  static async submitLayer1(listingId: string, docUrl: string, userId: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true },
    });

    if (!verification) {
      throw new Error('Verification record not found');
    }

    const transition = this.getTransition(verification.overallStatus, 1, 'submit');
    if (!transition) {
      throw new Error('Invalid transition for Layer 1 submission');
    }

    const updated = await prisma.verification.update({
      where: { id: verification.id },
      data: {
        l1Status: 'pending',
        l1DocUrl: docUrl,
        l1SubmittedAt: new Date(),
        currentLayer: 1,
        overallStatus: 'in_progress',
        updatedAt: new Date(),
      },
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: { verificationTier: 'basic' },
    });

    // Notify admin for review
    await this.notifyAdmins('verification_submitted', {
      listingId,
      listingTitle: verification.listing.title,
      layer: 1,
    });

    return updated;
  }

  static async adminReviewLayer1(listingId: string, approve: boolean, notes?: string, reviewerId?: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true, owner: true },
    });

    if (!verification) throw new Error('Verification not found');

    const transition = this.getTransition(verification.overallStatus, 1, approve ? 'approve' : 'reject');
    if (!transition) throw new Error('Invalid transition');

    if (approve) {
      const updated = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l1Status: 'approved',
          currentLayer: 2,
          l2Status: 'pending',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          adminNotes: notes,
        },
      });

      await prisma.listing.update({
        where: { id: listingId },
        data: { verificationTier: 'verified' },
      });

      // Notify owner
      await sendEmail({
        to: verification.owner.email,
        subject: `Verification Update: ${verification.listing.title} - Layer 1 Approved`,
        html: emailTemplates.verificationUpdate(
          verification.owner.fullName,
          verification.listing.title,
          1,
          'approved',
          'Your documents have been approved. Please proceed to Layer 2: Identity Verification.'
        ).html,
      });

      return updated;
    } else {
      const updated = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l1Status: 'rejected',
          overallStatus: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          adminNotes: notes,
        },
      });

      await sendEmail({
        to: verification.owner.email,
        subject: `Verification Update: ${verification.listing.title} - Layer 1 Rejected`,
        html: emailTemplates.verificationUpdate(
          verification.owner.fullName,
          verification.listing.title,
          1,
          'rejected',
          `Reason: ${notes || 'Not specified'}. Please resubmit with corrected documents.`
        ).html,
      });

      return updated;
    }
  }

  static async submitLayer2(listingId: string, idType: IdType, userId: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
    });

    if (!verification) throw new Error('Verification not found');
    if (verification.currentLayer !== 2) throw new Error('Must complete Layer 1 first');

    // Identity verification happens via Prembly webhook
    // This just records the attempt
    return prisma.verification.update({
      where: { id: verification.id },
      data: {
        l2IdType: idType as IdType,
        l2Status: 'pending',
      },
    });
  }

  static async confirmLayer2(listingId: string, verified: boolean, reviewerId?: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true, owner: true },
    });

    if (!verification) throw new Error('Verification not found');

    if (verified) {
      const updated = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l2Status: 'approved',
          l2VerifiedAt: new Date(),
          currentLayer: 3,
          l3Status: 'pending',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      await prisma.listing.update({
        where: { id: listingId },
        data: { verificationTier: 'verified' },
      });

      return updated;
    } else {
      const updated = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l2Status: 'rejected',
          overallStatus: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      await sendEmail({
        to: verification.owner.email,
        subject: `Verification Update: ${verification.listing.title} - Layer 2 Rejected`,
        html: emailTemplates.verificationUpdate(
          verification.owner.fullName,
          verification.listing.title,
          2,
          'rejected',
          'Identity verification failed. Please ensure your NIN/BVN details match your account.'
        ).html,
      });

      return updated;
    }
  }

  static async uploadVideo(listingId: string, videoUrl: string, qrCode: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
    });

    if (!verification) throw new Error('Verification not found');
    if (verification.currentLayer !== 3) throw new Error('Must complete Layer 2 first');

    return prisma.verification.update({
      where: { id: verification.id },
      data: {
        l3VideoUrl: videoUrl,
        l3QrCode: qrCode,
        l3Status: 'pending',
      },
    });
  }

  static async adminReviewLayer3(listingId: string, approve: boolean, reviewerId?: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true, owner: true },
    });

    if (!verification) throw new Error('Verification not found');

    if (approve) {
      return prisma.verification.update({
        where: { id: verification.id },
        data: {
          l3Status: 'approved',
          currentLayer: 4,
          l4Status: 'pending',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });
    } else {
      return prisma.verification.update({
        where: { id: verification.id },
        data: {
          l3Status: 'rejected',
          overallStatus: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });
    }
  }

  static async requestInspection(listingId: string, preferredDate: Date) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
    });

    if (!verification) throw new Error('Verification not found');
    if (verification.currentLayer !== 4) throw new Error('Must complete Layer 3 first');

    return prisma.verification.update({
      where: { id: verification.id },
      data: {
        l4Status: 'pending',
        l4ScheduledAt: preferredDate,
      },
    });
  }

  static async completeInspection(listingId: string, reportUrl: string, agentId: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true, owner: true },
    });

    if (!verification) throw new Error('Verification not found');

    return prisma.verification.update({
      where: { id: verification.id },
      data: {
        l4Status: 'approved',
        l4ReportUrl: reportUrl,
        l4AgentId: agentId,
        l4CompletedAt: new Date(),
        currentLayer: 5,
        l5Status: 'pending',
      },
    });
  }

  static async adminCertify(listingId: string, approve: boolean, reviewerId?: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true, owner: true },
    });

    if (!verification) throw new Error('Verification not found');

    if (approve) {
      const updated = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l5Status: 'approved',
          overallStatus: 'certified',
          currentLayer: 5,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      await prisma.listing.update({
        where: { id: listingId },
        data: { verificationTier: 'certified' },
      });

      await sendEmail({
        to: verification.owner.email,
        subject: `🎉 Verification Certified: ${verification.listing.title}`,
        html: emailTemplates.verificationUpdate(
          verification.owner.fullName,
          verification.listing.title,
          5,
          'certified',
          'Your property is now fully certified! It will display the Certified badge and receive priority placement.'
        ).html,
      });

      return updated;
    } else {
      const updated = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l5Status: 'rejected',
          overallStatus: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      return updated;
    }
  }

  static async freezeVerification(listingId: string, reason: string, reviewerId?: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
      include: { listing: true, owner: true },
    });

    if (!verification) throw new Error('Verification not found');

    const updated = await prisma.verification.update({
      where: { id: verification.id },
      data: {
        overallStatus: 'frozen',
        frozenReason: reason,
        frozenAt: new Date(),
        frozenBy: reviewerId,
      },
    });

    await sendEmail({
      to: verification.owner.email,
      subject: `Verification Frozen: ${verification.listing.title}`,
      html: emailTemplates.verificationUpdate(
        verification.owner.fullName,
        verification.listing.title,
        0,
        'frozen',
        `Your verification has been temporarily frozen. Reason: ${reason}. Please contact support for further assistance.`
      ).html,
    });

    return updated;
  }

  static async unfreezeVerification(listingId: string, reviewerId?: string) {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
    });

    if (!verification) throw new Error('Verification not found');

    return prisma.verification.update({
      where: { id: verification.id },
      data: {
        overallStatus: 'in_progress',
        frozenReason: null,
        frozenAt: null,
        frozenBy: null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });
  }

  static async getVerificationStatus(listingId: string) {
    return prisma.verification.findUnique({
      where: { listingId },
      include: {
        listing: {
          select: { id: true, title: true, verificationTier: true, agentId: true },
        },
      },
    });
  }

  static async getAdminQueue(status?: VerificationOverallStatus) {
    return prisma.verification.findMany({
      where: status ? { overallStatus: status } : { overallStatus: 'in_progress' },
      include: {
        listing: { select: { id: true, title: true, area: true, ownerId: true, agentId: true } },
        owner: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { currentLayer: 'asc' },
    });
  }

  /**
   * Update listing verification tier based on verification status
   */
  static async updateListingTier(listingId: string): Promise<void> {
    const verification = await prisma.verification.findUnique({
      where: { listingId },
    });

    if (!verification) {
      throw new Error('Verification not found');
    }

    const tier = getVerificationTierFromProgress(verification);

    await prisma.listing.update({
      where: { id: listingId },
      data: { verificationTier: tier },
    });
  }

  /**
   * Create initial verification record for a listing
   */
  static async createVerification(listingId: string, ownerId: string) {
    // Check if verification already exists
    const existing = await prisma.verification.findUnique({
      where: { listingId },
    });

    if (existing) {
      return existing;
    }

    return prisma.verification.create({
      data: {
        listingId,
        ownerId,
        overallStatus: 'not_started',
        currentLayer: 1,
        l1Status: 'pending',
        l2Status: 'pending',
        l3Status: 'pending',
        l4Status: 'pending',
        l5Status: 'pending',
      },
    });
  }

  /**
   * Get verifications for a specific user
   */
  static async getUserVerifications(userId: string, status?: VerificationOverallStatus) {
    return prisma.verification.findMany({
      where: {
        ownerId: userId,
        ...(status && { overallStatus: status }),
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            verificationTier: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private static async notifyAdmins(event: string, data: Record<string, unknown>) {
    const admins = await prisma.user.findMany({
      where: { role: 'admin', isActive: true },
    });

    // Could send emails or create notifications
    console.log(`Admin notification: ${event}`, data);
  }
}

export const verificationService = VerificationService;
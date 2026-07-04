import type { Verification, VerificationLayerStatus, VerificationOverallStatus } from '@prisma/client';

/**
 * Calculate verification progress percentage based on completed layers
 */
export function calculateProgress(verification: Verification): number {
  const layerStatuses = [
    verification.l1Status,
    verification.l2Status,
    verification.l3Status,
    verification.l4Status,
    verification.l5Status,
  ];

  const approvedCount = layerStatuses.filter((status) => status === 'approved').length;
  const progress = Math.round((approvedCount / 5) * 100);

  return progress;
}

/**
 * Get requirements for the next layer
 */
export function getNextRequirements(verification: Verification): string[] {
  const currentLayer = verification.currentLayer;

  switch (currentLayer) {
    case 1:
      if (verification.l1Status === 'pending') {
        return [
          'Upload Certificate of Occupancy',
          'Upload Deed of Assignment',
          'Upload Building Plan',
          'Upload Tax Clearance or Receipt',
        ];
      }
      return ['Waiting for admin review of documents'];

    case 2:
      if (verification.l2Status === 'pending') {
        return [
          'Verify NIN or BVN',
          'Ensure name matches documents from Layer 1',
          'Identity will be verified via Prembly',
        ];
      }
      return ['Identity verification in progress'];

    case 3:
      if (verification.l3Status === 'pending') {
        return [
          'Record a video walkthrough of the property',
          'Show the QR code provided in the video',
          'Video must be clear and show all rooms',
        ];
      }
      return ['Waiting for admin review of video'];

    case 4:
      if (verification.l4Status === 'pending') {
        return [
          'Schedule physical inspection',
          'Agent will visit the property',
          'Ensure property is accessible on inspection date',
        ];
      }
      return ['Inspection scheduled or in progress'];

    case 5:
      if (verification.l5Status === 'pending') {
        return [
          'Admin is reviewing all verification layers',
          'Final certification will be granted upon approval',
          'Your property will receive the Certified badge',
        ];
      }
      return ['Certification complete'];

    default:
      return [];
  }
}

/**
 * Get current layer details
 */
export function getCurrentLayerDetails(verification: Verification) {
  const layer = verification.currentLayer;
  const layerNames = [
    'Not Started',
    'Document Verification',
    'Identity Verification',
    'Video Verification',
    'Physical Inspection',
    'Admin Certification',
  ];

  const layerStatuses = [
    null,
    verification.l1Status,
    verification.l2Status,
    verification.l3Status,
    verification.l4Status,
    verification.l5Status,
  ];

  return {
    layer,
    name: layerNames[layer],
    status: layerStatuses[layer],
    requirements: getNextRequirements(verification),
    completed: layerStatuses[layer] === 'approved',
  };
}

/**
 * Check if verification can be submitted for final review (all 4 layers complete)
 */
export function canSubmitForReview(verification: Verification): boolean {
  return (
    verification.l1Status === 'approved' &&
    verification.l2Status === 'approved' &&
    verification.l3Status === 'approved' &&
    verification.l4Status === 'approved' &&
    verification.currentLayer >= 4 &&
    verification.l5Status === 'pending' &&
    verification.overallStatus === 'in_progress'
  );
}

/**
 * Check if can progress to next layer
 */
export function canProgressToNextLayer(verification: Verification): boolean {
  const currentLayer = verification.currentLayer;

  switch (currentLayer) {
    case 1:
      return verification.l1Status === 'approved';
    case 2:
      return verification.l2Status === 'approved';
    case 3:
      return verification.l3Status === 'approved';
    case 4:
      return verification.l4Status === 'approved';
    case 5:
      return false; // Cannot progress beyond layer 5
    default:
      return false;
  }
}

/**
 * Check if verification is frozen
 */
export function isFrozen(verification: Verification): boolean {
  return verification.overallStatus === 'frozen';
}

/**
 * Get verification tier based on completed layers
 */
export function getVerificationTierFromProgress(verification: Verification): 'basic' | 'verified' | 'inspected' | 'certified' {
  if (verification.overallStatus === 'certified') {
    return 'certified';
  }

  if (verification.l4Status === 'approved') {
    return 'inspected';
  }

  if (verification.l1Status === 'approved' || verification.l2Status === 'approved') {
    return 'verified';
  }

  return 'basic';
}

/**
 * Get completed layers as array
 */
export function getCompletedLayers(verification: Verification): number[] {
  const completed: number[] = [];

  if (verification.l1Status === 'approved') completed.push(1);
  if (verification.l2Status === 'approved') completed.push(2);
  if (verification.l3Status === 'approved') completed.push(3);
  if (verification.l4Status === 'approved') completed.push(4);
  if (verification.l5Status === 'approved') completed.push(5);

  return completed;
}

/**
 * Get pending layers as array
 */
export function getPendingLayers(verification: Verification): number[] {
  const pending: number[] = [];

  if (verification.l1Status === 'pending') pending.push(1);
  if (verification.l2Status === 'pending') pending.push(2);
  if (verification.l3Status === 'pending') pending.push(3);
  if (verification.l4Status === 'pending') pending.push(4);
  if (verification.l5Status === 'pending') pending.push(5);

  return pending;
}

/**
 * Get rejected layers as array
 */
export function getRejectedLayers(verification: Verification): number[] {
  const rejected: number[] = [];

  if (verification.l1Status === 'rejected') rejected.push(1);
  if (verification.l2Status === 'rejected') rejected.push(2);
  if (verification.l3Status === 'rejected') rejected.push(3);
  if (verification.l4Status === 'rejected') rejected.push(4);
  if (verification.l5Status === 'rejected') rejected.push(5);

  return rejected;
}

/**
 * Check if any layer is rejected
 */
export function hasRejectedLayers(verification: Verification): boolean {
  return (
    verification.l1Status === 'rejected' ||
    verification.l2Status === 'rejected' ||
    verification.l3Status === 'rejected' ||
    verification.l4Status === 'rejected' ||
    verification.l5Status === 'rejected'
  );
}

/**
 * Get human-readable status message
 */
export function getStatusMessage(verification: Verification): string {
  if (verification.overallStatus === 'certified') {
    return 'Your property is fully certified!';
  }

  if (verification.overallStatus === 'frozen') {
    return `Verification is frozen. Reason: ${verification.frozenReason || 'Not specified'}. Please contact support.`;
  }

  if (verification.overallStatus === 'rejected') {
    const rejectedLayers = getRejectedLayers(verification);
    return `Verification rejected at Layer ${rejectedLayers[0]}. Please review admin notes and resubmit.`;
  }

  if (verification.overallStatus === 'not_started') {
    return 'Start verification by uploading required documents.';
  }

  const currentLayer = getCurrentLayerDetails(verification);
  return `Currently on Layer ${currentLayer.layer}: ${currentLayer.name}`;
}

/**
 * Notification triggers documentation
 */
export const NOTIFICATION_TRIGGERS = {
  layer1_submitted: 'User submits Layer 1 documents → Notify admin',
  layer1_approved: 'Admin approves Layer 1 → Notify user',
  layer1_rejected: 'Admin rejects Layer 1 → Notify user with reason',
  layer2_verified: 'Identity verified → Notify user',
  layer2_rejected: 'Identity failed → Notify user',
  layer3_submitted: 'Video uploaded → Notify admin',
  layer3_approved: 'Admin approves video → Notify user',
  layer3_rejected: 'Admin rejects video → Notify user',
  layer4_requested: 'Inspection requested → Notify admin + available agents',
  layer4_scheduled: 'Inspection scheduled → Notify user + agent',
  layer4_completed: 'Inspection completed → Notify user + admin',
  layer5_submitted: 'All layers complete → Notify admin for final review',
  certified: 'Verification certified → Notify user + update listing tier',
  rejected: 'Final rejection → Notify user with reason',
};

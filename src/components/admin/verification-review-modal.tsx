'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionConfirmationDialog } from './action-confirmation-dialog';
import { CheckCircle2, XCircle, ExternalLink, FileText, User, Building2 } from 'lucide-react';
import Image from 'next/image';

interface VerificationData {
  id: string;
  listingId: string;
  listing: {
    title: string;
    address: string;
    city: string;
    state: string;
    propertyType: string;
    price: number;
  };
  owner: {
    fullName: string;
    email: string;
    phone: string;
  };
  currentLayer: number;
  overallStatus: string;
  documents?: {
    id: string;
    documentType: string;
    fileUrl: string;
    status: string;
  }[];
  layer2Status?: string;
  layer3VideoUrl?: string;
  layer3Status?: string;
  layer4InspectionReport?: string;
  layer4Status?: string;
  adminNotes?: string;
}

interface VerificationReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verification: VerificationData | null;
  onApprove: (verificationId: string, notes: string) => Promise<void>;
  onReject: (verificationId: string, reason: string) => Promise<void>;
}

export function VerificationReviewModal({
  open,
  onOpenChange,
  verification,
  onApprove,
  onReject,
}: VerificationReviewModalProps) {
  const [notes, setNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!verification) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(verification.id, notes);
      setNotes('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setLoading(true);
    try {
      await onReject(verification.id, reason);
      setNotes('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'certified':
      case 'approved':
        return 'tag-green';
      case 'rejected':
        return 'tag-red';
      case 'in_progress':
      case 'pending':
        return 'tag-amber';
      default:
        return 'tag-gray';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Verification Review</DialogTitle>
            <DialogDescription>
              Review all verification layers and approve or reject this property listing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Property Information */}
            <div className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                <Building2 className="h-5 w-5 mt-1" style={{ color: 'var(--accent)' }} />
                <div className="flex-1">
                  <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>
                    Property Information
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {verification.listing.title}
                  </p>
                </div>
                <Badge className={getStatusColor(verification.overallStatus)}>
                  Layer {verification.currentLayer}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span style={{ color: 'var(--muted)' }}>Address:</span>
                  <p style={{ color: 'var(--text)' }}>{verification.listing.address}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>City/State:</span>
                  <p style={{ color: 'var(--text)' }}>
                    {verification.listing.city}, {verification.listing.state}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Property Type:</span>
                  <p style={{ color: 'var(--text)' }}>{verification.listing.propertyType}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Price:</span>
                  <p style={{ color: 'var(--text)' }}>
                    ₦{verification.listing.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <a
                href={`/listings/${verification.listingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium"
                style={{ color: 'var(--accent)' }}
              >
                View Full Listing <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Landlord Information */}
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-1" style={{ color: 'var(--accent)' }} />
                <div>
                  <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>
                    Landlord Information
                  </h3>
                  <div className="space-y-2 text-sm mt-3">
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Name: </span>
                      <span style={{ color: 'var(--text)' }}>{verification.owner.fullName}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Email: </span>
                      <span style={{ color: 'var(--text)' }}>{verification.owner.email}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Phone: </span>
                      <span style={{ color: 'var(--text)' }}>{verification.owner.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Layers */}
            <div className="card p-4">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
                Verification Layers
              </h3>

              <Tabs defaultValue="layer1" className="w-full">
                <TabsList className="w-full grid grid-cols-5">
                  <TabsTrigger value="layer1">Layer 1</TabsTrigger>
                  <TabsTrigger value="layer2">Layer 2</TabsTrigger>
                  <TabsTrigger value="layer3">Layer 3</TabsTrigger>
                  <TabsTrigger value="layer4">Layer 4</TabsTrigger>
                  <TabsTrigger value="layer5">Layer 5</TabsTrigger>
                </TabsList>

                <TabsContent value="layer1" className="space-y-4 mt-4">
                  <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                    Document Upload
                  </h4>
                  {verification.documents && verification.documents.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {verification.documents.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-3" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                                {doc.documentType.replace('_', ' ')}
                              </span>
                            </div>
                            <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1"
                            style={{ color: 'var(--accent)' }}
                          >
                            View Document <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      No documents uploaded yet.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="layer2" className="space-y-4 mt-4">
                  <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                    Identity Verification (Prembly)
                  </h4>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>Status:</span>
                      <Badge className={getStatusColor(verification.layer2Status || 'pending')}>
                        {verification.layer2Status || 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--text)' }}>
                      Identity verification is performed automatically via Prembly API.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="layer3" className="space-y-4 mt-4">
                  <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                    Video Verification
                  </h4>
                  {verification.layer3VideoUrl ? (
                    <div>
                      <video
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: '400px' }}
                      >
                        <source src={verification.layer3VideoUrl} />
                        Your browser does not support video playback.
                      </video>
                      <div className="mt-2">
                        <Badge className={getStatusColor(verification.layer3Status || 'pending')}>
                          {verification.layer3Status || 'Pending Review'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      No video uploaded yet.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="layer4" className="space-y-4 mt-4">
                  <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                    Physical Inspection
                  </h4>
                  {verification.layer4InspectionReport ? (
                    <div className="p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                        {verification.layer4InspectionReport}
                      </p>
                      <div className="mt-3">
                        <Badge className={getStatusColor(verification.layer4Status || 'pending')}>
                          {verification.layer4Status || 'Pending Review'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Physical inspection not completed yet.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="layer5" className="space-y-4 mt-4">
                  <h4 className="font-medium" style={{ color: 'var(--text)' }}>
                    Admin Final Review
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Final review and approval by PROPATI admin team.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Admin Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments about this verification..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <ActionConfirmationDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        title="Approve Verification"
        description="Are you sure you want to approve this verification? The listing will be marked as certified."
        confirmText="Approve"
        onConfirm={handleApprove}
        danger={false}
      />

      {/* Reject Confirmation Dialog */}
      <ActionConfirmationDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title="Reject Verification"
        description="Please provide a reason for rejecting this verification. The landlord will be notified."
        confirmText="Reject"
        onConfirm={handleReject}
        danger={true}
        requireReason={true}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Explain why this verification is being rejected..."
      />
    </>
  );
}

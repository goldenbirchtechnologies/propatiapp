'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationReviewModal } from '@/components/admin/verification-review-modal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Verification {
  id: string;
  listingId: string;
  currentLayer: number;
  overallStatus: string;
  createdAt: Date;
  listing: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    propertyType: string;
    price: number;
  };
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  documents?: {
    id: string;
    documentType: string;
    url: string;
  }[];
  layer2Status?: string | null;
  layer3VideoUrl?: string | null;
  layer3Status?: string | null;
  layer4InspectionReport?: string | null;
  layer4Status?: string | null;
  adminNotes?: string | null;
}

interface VerificationsClientProps {
  verifications: Verification[];
}

export default function VerificationsClient({ verifications: initialVerifications }: VerificationsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState(initialVerifications);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleReview = (verification: Verification) => {
    setSelectedVerification(verification);
    setModalOpen(true);
  };

  const handleApprove = async (verificationId: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/verifications/${verificationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve verification');
      }

      toast({ title: 'Success', description: 'Verification approved successfully' });
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve verification',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (verificationId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/verifications/${verificationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject verification');
      }

      toast({ title: 'Success', description: 'Verification rejected' });
      setVerifications((prev) => prev.filter((v) => v.id !== verificationId));
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject verification',
        variant: 'destructive',
      });
    }
  };

  const filterVerifications = (layer?: number) => {
    if (layer) {
      return verifications.filter((v) => v.currentLayer === layer);
    }
    return verifications;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'certified':
        return 'tag-green';
      case 'in_progress':
        return 'tag-amber';
      case 'rejected':
        return 'tag-red';
      default:
        return 'tag-gray';
    }
  };

  const renderVerificationTable = (filteredVerifications: Verification[]) => {
    if (filteredVerifications.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
            No verifications pending
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            All verifications have been reviewed
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Listing Title
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Landlord
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Submitted Date
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Current Status
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredVerifications.map((verification) => (
              <tr key={verification.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                <td className="p-4">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {verification.listing.title}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {verification.listing.city}, {verification.listing.state}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {verification.owner.fullName}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {verification.owner.email}
                    </p>
                  </div>
                </td>
                <td className="p-4" style={{ color: 'var(--text)' }}>
                  {new Date(verification.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <Badge className={getStatusBadge(verification.overallStatus)}>
                    Layer {verification.currentLayer} - {verification.overallStatus}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button onClick={() => handleReview(verification)} size="sm">
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
          Verification Queue
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Review pending property verifications across all layers.
        </p>
      </div>

      <div className="card">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-7">
            <TabsTrigger value="all">
              All ({verifications.length})
            </TabsTrigger>
            <TabsTrigger value="layer1">
              Layer 1 ({filterVerifications(1).length})
            </TabsTrigger>
            <TabsTrigger value="layer2">
              Layer 2 ({filterVerifications(2).length})
            </TabsTrigger>
            <TabsTrigger value="layer3">
              Layer 3 ({filterVerifications(3).length})
            </TabsTrigger>
            <TabsTrigger value="layer4">
              Layer 4 ({filterVerifications(4).length})
            </TabsTrigger>
            <TabsTrigger value="layer5">
              Layer 5 ({filterVerifications(5).length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderVerificationTable(filterVerifications())}
          </TabsContent>

          <TabsContent value="layer1" className="mt-6">
            {renderVerificationTable(filterVerifications(1))}
          </TabsContent>

          <TabsContent value="layer2" className="mt-6">
            {renderVerificationTable(filterVerifications(2))}
          </TabsContent>

          <TabsContent value="layer3" className="mt-6">
            {renderVerificationTable(filterVerifications(3))}
          </TabsContent>

          <TabsContent value="layer4" className="mt-6">
            {renderVerificationTable(filterVerifications(4))}
          </TabsContent>

          <TabsContent value="layer5" className="mt-6">
            {renderVerificationTable(filterVerifications(5))}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {renderVerificationTable(
              verifications.filter((v) => v.overallStatus === 'in_progress')
            )}
          </TabsContent>
        </Tabs>
      </div>

      <VerificationReviewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        verification={selectedVerification}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

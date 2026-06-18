'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionConfirmationDialog } from '@/components/admin/action-confirmation-dialog';
import { ExternalLink, XCircle, AlertTriangle, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface FlaggedListing {
  id: string;
  title: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
  flags: {
    id: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: Date;
    flagger: {
      id: string;
      fullName: string;
      email: string;
    };
  }[];
}

interface FlaggedListingsClientProps {
  flaggedListings: FlaggedListing[];
}

export default function FlaggedListingsClient({
  flaggedListings: initialListings,
}: FlaggedListingsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState(initialListings);
  const [activeTab, setActiveTab] = useState<'unresolved' | 'resolved'>('unresolved');
  const [selectedListing, setSelectedListing] = useState<FlaggedListing | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'dismiss' | 'suspend' | 'ban' | null;
  }>({ open: false, action: null });

  const handleDismissFlags = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/dismiss-flags`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to dismiss flags');

      toast({ title: 'Success', description: 'Flags dismissed successfully' });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to dismiss flags', variant: 'destructive' });
    }
  };

  const handleSuspendListing = async (listingId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend listing');

      toast({ title: 'Success', description: 'Listing suspended successfully' });
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to suspend listing', variant: 'destructive' });
    }
  };

  const handleBanUser = async (userId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to ban user');

      toast({ title: 'Success', description: 'User banned successfully' });
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to ban user', variant: 'destructive' });
    }
  };

  const openActionDialog = (listing: FlaggedListing, action: 'dismiss' | 'suspend' | 'ban') => {
    setSelectedListing(listing);
    setActionDialog({ open: true, action });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedListing || !actionDialog.action) return;

    switch (actionDialog.action) {
      case 'dismiss':
        await handleDismissFlags(selectedListing.id);
        break;
      case 'suspend':
        await handleSuspendListing(selectedListing.id, reason);
        break;
      case 'ban':
        await handleBanUser(selectedListing.owner.id, reason);
        break;
    }

    setActionDialog({ open: false, action: null });
    setSelectedListing(null);
  };

  const filteredListings = listings.filter((listing) => {
    const hasUnresolved = listing.flags.some((flag) => flag.status === 'open');
    return activeTab === 'unresolved' ? hasUnresolved : !hasUnresolved;
  });

  const unresolvedCount = listings.filter((l) =>
    l.flags.some((flag) => flag.status === 'open')
  ).length;
  const resolvedCount = listings.length - unresolvedCount;

  const renderTable = () => {
    if (filteredListings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
            No {activeTab} flagged listings
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
                Owner
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Flag Count
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Reasons
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Flagged Date
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map((listing) => {
              const openFlags = listing.flags.filter((f) => f.status === 'open');
              const reasons = [...new Set(openFlags.map((f) => f.reason))].join(', ');
              const latestFlag = listing.flags[0];

              return (
                <tr key={listing.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {listing.title}
                    </p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>
                        {listing.owner.fullName}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        {listing.owner.email}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className="tag-red">{openFlags.length}</Badge>
                  </td>
                  <td className="p-4">
                    <p className="text-sm max-w-xs truncate" style={{ color: 'var(--text)' }}>
                      {reasons || 'No reasons specified'}
                    </p>
                  </td>
                  <td className="p-4" style={{ color: 'var(--text)' }}>
                    {new Date(latestFlag.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/listings/${listing.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionDialog(listing, 'dismiss')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openActionDialog(listing, 'suspend')}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openActionDialog(listing, 'ban')}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Ban User
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            Flagged Listings
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Review and manage flagged property listings.
          </p>
        </div>

        <div className="card">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'unresolved' | 'resolved')}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="unresolved">Unresolved ({unresolvedCount})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="unresolved" className="mt-6">
              {renderTable()}
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              {renderTable()}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ActionConfirmationDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, action: null })}
        title={
          actionDialog.action === 'dismiss'
            ? 'Dismiss Flags'
            : actionDialog.action === 'suspend'
            ? 'Suspend Listing'
            : 'Ban User'
        }
        description={
          actionDialog.action === 'dismiss'
            ? 'Are you sure you want to dismiss all flags for this listing?'
            : actionDialog.action === 'suspend'
            ? 'This will hide the listing from public view. Provide a reason for suspension.'
            : 'This will permanently ban the user from the platform. Provide a reason for banning.'
        }
        confirmText={
          actionDialog.action === 'dismiss'
            ? 'Dismiss'
            : actionDialog.action === 'suspend'
            ? 'Suspend'
            : 'Ban User'
        }
        onConfirm={handleConfirmAction}
        danger={actionDialog.action !== 'dismiss'}
        requireReason={actionDialog.action !== 'dismiss'}
        reasonLabel="Reason"
        reasonPlaceholder={`Explain why you are ${actionDialog.action === 'ban' ? 'banning this user' : 'suspending this listing'}...`}
      />
    </>
  );
}

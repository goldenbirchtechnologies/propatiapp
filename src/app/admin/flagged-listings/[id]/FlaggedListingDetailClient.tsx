'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {

  ArrowLeft,
  AlertTriangle,
  XCircle,
  Ban,
  Eye,
  ExternalLink,
  Shield,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ActionConfirmationDialog } from '@/components/admin/action-confirmation-dialog';
import { toast } from '@/hooks/use-toast';

type Flag = {
  id: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  flaggedByUser: { id: string; fullName: string; email: string };
};

type Listing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  price: number;
  status: string;
  listingType: string;
  propertyType: string;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; fullName: string; email: string; phone: string | null };
  images: { id: string; url: string; isCover: boolean }[];
  flags: Flag[];
};

export default function FlaggedListingDetailClient({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'dismiss' | 'suspend' | 'ban' | null;
  }>({ open: false, action: null });

  const openFlags = listing.flags.filter((f) => f.status === 'open');
  const resolvedFlags = listing.flags.filter((f) => f.status !== 'open');

  const handleDismissFlags = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/listings/${listing.id}/dismiss-flags`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error();
        toast({ title: 'Success', description: 'Flags dismissed successfully' });
        setActionDialog({ open: false, action: null });
        router.push('/admin/flagged-listings');
      } catch {
        toast({ title: 'Error', description: 'Failed to dismiss flags', variant: 'destructive' });
      }
    });
  };

  const handleSuspendListing = async (reason?: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/listings/${listing.id}/suspend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error();
        toast({ title: 'Success', description: 'Listing suspended' });
        setActionDialog({ open: false, action: null });
        router.push('/admin/flagged-listings');
      } catch {
        toast({ title: 'Error', description: 'Failed to suspend', variant: 'destructive' });
      }
    });
  };

  const handleBanUser = async (reason?: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/users/${listing.owner.id}/ban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error();
        toast({ title: 'Success', description: 'User banned' });
        setActionDialog({ open: false, action: null });
        router.push('/admin/flagged-listings');
      } catch {
        toast({ title: 'Error', description: 'Failed to ban user', variant: 'destructive' });
      }
    });
  };

  const handleConfirm = async (reason?: string) => {
    switch (actionDialog.action) {
      case 'dismiss':
        await handleDismissFlags();
        break;
      case 'suspend':
        await handleSuspendListing(reason);
        break;
      case 'ban':
        await handleBanUser(reason);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
        <Link href="/admin" className="hover:underline">Admin</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <Link href="/admin/flagged-listings" className="hover:underline">Flagged Listings</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <span style={{ color: 'var(--text)' }} className="font-medium truncate">{listing.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/flagged-listings"
            className="p-2 rounded-lg hover:bg-gray-100"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="font-heading font-bold"
              style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
            >
              {listing.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              {listing.area}, {listing.state} · ₦{listing.price.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="tag-red">{openFlags.length} Open</Badge>
          <Badge className="tag-gray">{resolvedFlags.length} Resolved</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              <Building2 className="inline w-5 h-5 mr-2" style={{ color: 'var(--accent)' }} />
              Listing Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listing.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {listing.images.map((img) => (
                  <div key={img.id} className="aspect-video rounded-lg overflow-hidden" style={{ background: 'var(--surface)' }}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Price</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₦{listing.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Type</p>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text)' }}>{listing.listingType || '—'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Property Type</p>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text)' }}>{listing.propertyType || '—'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Listed</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {new Date(listing.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <Link
              href={`/listings/${listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View Public Listing
            </Link>
          </CardContent>
        </Card>

        {/* Owner */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              <Shield className="inline w-5 h-5 mr-2" style={{ color: 'var(--accent)' }} />
              Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-bold" style={{ color: 'var(--text)' }}>{listing.owner.fullName}</p>
            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--muted)' }}>
              <Mail className="w-3 h-3" /> {listing.owner.email}
            </p>
            {listing.owner.phone && (
              <p className="text-sm flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <Phone className="w-3 h-3" /> {listing.owner.phone}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Flags Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
            <AlertTriangle className="inline w-5 h-5 mr-2" style={{ color: 'var(--amber)' }} />
            Flags ({listing.flags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listing.flags.map((flag) => (
              <div
                key={flag.id}
                className="p-4 rounded-lg space-y-2"
                style={{
                  background: flag.status === 'open' ? 'var(--red-bg)' : 'var(--surface)',
                  border: `1px solid ${flag.status === 'open' ? 'var(--red)' : 'var(--border)'}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={flag.status === 'open' ? 'tag-red' : 'tag-gray'}>
                        {flag.status === 'open' ? 'Open' : 'Resolved'}
                      </Badge>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(flag.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{flag.reason}</p>
                    {flag.details && (
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{flag.details}</p>
                    )}
                    <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                      Flagged by {flag.flaggedByUser.fullName} ({flag.flaggedByUser.email})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {openFlags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActionDialog({ open: true, action: 'dismiss' })}
                disabled={isPending}
              >
                {isPending && actionDialog.action === 'dismiss' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Dismiss All Flags
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setActionDialog({ open: true, action: 'suspend' })}
                disabled={isPending}
              >
                {isPending && actionDialog.action === 'suspend' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Suspend Listing
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setActionDialog({ open: true, action: 'ban' })}
                disabled={isPending}
              >
                {isPending && actionDialog.action === 'ban' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                Ban Owner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ActionConfirmationDialog
        open={actionDialog.open}
        onOpenChange={(open) => !open && setActionDialog({ open: false, action: null })}
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
          actionDialog.action === 'dismiss' ? 'Dismiss' : actionDialog.action === 'suspend' ? 'Suspend' : 'Ban User'
        }
        onConfirm={handleConfirm}
        danger={actionDialog.action !== 'dismiss'}
        requireReason={actionDialog.action !== 'dismiss'}
        reasonLabel="Reason"
        reasonPlaceholder={`Explain why you are ${actionDialog.action === 'ban' ? 'banning this user' : 'suspending this listing'}...`}
      />
    </div>
  );
}

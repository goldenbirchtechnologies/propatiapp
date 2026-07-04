'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Heart,
  Share2,
  Home,
  Phone,
  MessageCircle,
  CheckCircle,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useState } from 'react';

import { useUser } from '@clerk/nextjs';

import { useListing, useToggleSaveListing } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ImageGallery,
  PropertySpecs,
  propertyTypeLabels,
  listingTypeLabels,
  verificationTierLabels,
  verificationTierColors,
  ListingDetailSkeleton,
} from '@/app/(public)/listings/[id]/listing-detail-components';

interface PageProps {
  params: Promise<{ id: string }>;
}

function PublicContactForm({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSending(false);
  };

  if (submitted) {
    return (
      <Card className="rounded-lg border-border shadow-1 bg-card">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-primary mb-3" />
          <h3 className="text-lg font-bold text-foreground">Message Sent</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you for your interest. The agent will get back to you shortly.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setSubmitted(false)}
          >
            Send Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border-border shadow-1 bg-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Enquire About This Property
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
            <Input id="name" name="name" placeholder="Your name" required className="h-10 mt-1" />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-10 mt-1" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+234 …" className="h-10 mt-1" />
          </div>
          <div>
            <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
            <Textarea id="message" name="message" placeholder="I'm interested in …" rows={3} required className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? 'Sending…' : 'Send Enquiry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PropertyAliasContent({ id }: { id: string }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: response, isLoading, error } = useListing(id);
  const { save, unsave, isSaving, isUnsaving } = useToggleSaveListing();

  const listing = response?.data;
  const isSaved = listing?.savedByCurrentUser || false;
  const currentUserId = user?.publicMetadata?.userId as string | undefined;
  const currentUserRole = user?.publicMetadata?.role as string | undefined;
  const isAuthenticated = isUserLoaded && !!user;

  const handleSaveToggle = () => {
    if (isSaved) unsave(id);
    else save(id);
  };

  if (isLoading) return <ListingDetailSkeleton />;

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-lg border-border shadow-1 bg-card p-8 text-center">
          <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Property Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This property may have been removed or the link is incorrect.
          </p>
          <Button asChild>
            <Link href="/listings">Browse Properties</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const displayPerson = listing.agent || listing.owner;
  const phone = displayPerson?.phone;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/listings"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant={isSaved ? 'default' : 'outline'}
              size="sm"
              onClick={handleSaveToggle}
              disabled={isSaving || isUnsaving}
            >
              <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current')} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={listing.images} title={listing.title} />

            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {listing.address && `${listing.address}, `}
                      {listing.area}, {listing.state}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold font-heading text-primary">
                    {listing.priceFormatted || `₦${Number(listing.price).toLocaleString()}`}
                  </div>
                  {listing.listingType === 'rent' && (
                    <div className="text-xs text-muted-foreground">per month</div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant={verificationTierColors[listing.verificationTier] || 'default'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {verificationTierLabels[listing.verificationTier] || listing.verificationTier}
                </Badge>
                <Badge variant="outline">{listingTypeLabels[listing.listingType] || listing.listingType}</Badge>
                {listing.propertyType && (
                  <Badge variant="outline" className="capitalize">
                    {propertyTypeLabels[listing.propertyType] || listing.propertyType}
                  </Badge>
                )}
                {listing.furnished && <Badge variant="secondary">Furnished</Badge>}
                {listing.verification?.overallStatus === 'certified' && (
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Property
                  </Badge>
                )}
              </div>
            </div>

            <Card className="rounded-lg border-border shadow-1 bg-card">
              <CardHeader>
                <CardTitle className="text-base">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertySpecs
                  bedrooms={listing.bedrooms}
                  bathrooms={listing.bathrooms}
                  toilets={listing.toilets}
                  sizeSqm={listing.sizeSqm}
                  parkingSpaces={listing.parkingSpaces}
                />
              </CardContent>
            </Card>

            {listing.description && (
              <Card className="rounded-lg border-border shadow-1 bg-card">
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {listing.amenities && listing.amenities.length > 0 && (
              <Card className="rounded-lg border-border shadow-1 bg-card">
                <CardHeader>
                  <CardTitle className="text-base">Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity: string) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Simplified contact card */}
            <PublicContactForm listingId={listing.id} listingTitle={listing.title} />

            {phone && (
              <Button variant="default" className="w-full" asChild>
                <a href={`tel:${phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call {displayPerson?.fullName?.split(' ')[0] || 'Agent'}
                </a>
              </Button>
            )}

            {displayPerson && (
              <Card className="rounded-lg border-border shadow-1 bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={displayPerson.profileImage || undefined} alt={displayPerson.fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {getInitials(displayPerson.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {displayPerson.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.agent ? 'Verified Agent' : 'Property Owner'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyAliasPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <PropertyAliasContent id={resolvedParams.id} />;
}

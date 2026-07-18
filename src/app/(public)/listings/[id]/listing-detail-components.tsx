'use client'

import AppIcon from '@/components/icons/app-icon';

import { use } from 'react';
import { useRouter } from 'next/navigation';

import { useUser } from '@clerk/nextjs';

import Image from 'next/image';
import Link from 'next/link';
import {

  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Heart,
  Share2,
  Flag,
  Edit,
  Phone,
  Mail,
  Calendar,
  Eye,
  CheckCircle,
  Shield,
  Home,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Send,
  Loader2,
  Search,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useListing, useToggleSaveListing } from '@/hooks/useListings';
import { ContactLandlordButton } from '@/components/listings/contact-landlord-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export interface PageProps {
  params: Promise<{ id: string }>;
}

export const propertyTypeLabels: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  duplex: 'Duplex',
  land: 'Land',
  office: 'Office',
  shop: 'Shop',
  warehouse: 'Warehouse',
};

export const listingTypeLabels: Record<string, string> = {
  rent: 'For Rent',
  sale: 'For Sale',
  short_let: 'Short Let',
  share: 'Shared',
  commercial: 'Commercial',
};

export const verificationTierLabels: Record<string, string> = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
};

export const verificationTierColors: Record<string, 'default' | 'secondary' | 'outline' | 'success'> = {
  basic: 'secondary',
  verified: 'default',
  inspected: 'outline',
  certified: 'success',
};

export function ImageGallery({ images, title }: { images: unknown[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <Home className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev + 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden group">
        <Image
          src={currentImage.url}
          alt={`${title} - Image ${currentIndex + 1}`}
          width={1280}
          height={720}
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface-elevated/90 hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface-elevated/90 hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative aspect-video rounded-md overflow-hidden border-2 transition-all',
                currentIndex === index
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertySpecs({
  bedrooms,
  bathrooms,
  toilets,
  sizeSqm,
  parkingSpaces,
}: {
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  sizeSqm?: number | null;
  parkingSpaces?: number | null;
}) {
  const specs = [
    { icon: Bed, label: 'Bedrooms', value: bedrooms },
    { icon: Bath, label: 'Bathrooms', value: bathrooms },
    { icon: Bath, label: 'Toilets', value: toilets },
    { icon: Square, label: 'Area', value: sizeSqm ? `${sizeSqm.toLocaleString()} sqm` : null },
    { icon: Car, label: 'Parking', value: parkingSpaces },
  ].filter((spec) => spec.value !== null && spec.value !== undefined);

  if (specs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {specs.map((spec, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-4 bg-muted/50 rounded-lg"
        >
          <spec.icon className="h-6 w-6 mb-2 text-muted-foreground" />
          <span className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {spec.value}
          </span>
          <span className="text-xs text-muted-foreground">{spec.label}</span>
        </div>
      ))}
    </div>
  );
}

export function OwnerCard({
  owner,
  agent,
  isOwnerView,
  listingId,
  listingTitle,
  currentUserId,
  currentUserRole,
  isAuthenticated,
}: {
  owner?: unknown;
  agent?: unknown;
  isOwnerView?: boolean;
  listingId?: string;
  listingTitle?: string;
  currentUserId?: string;
  currentUserRole?: string;
  isAuthenticated?: boolean;
}) {
  const displayPerson = agent || owner;
  if (!displayPerson) return null;

  const name = displayPerson.fullName;
  const avatar = displayPerson.profileImage;
  const phone = displayPerson.phone;
  const email = displayPerson.email;
  const isVerified = owner?.phoneVerified || false;
  const isAgent = !!agent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isAgent ? 'Listed by Agent' : 'Property Owner'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar || undefined} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-accent to-accent2 text-white font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>
              {name}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isAgent && <AppIcon name="Verified Agent" className="lucide" />}
              {!isAgent && <AppIcon name="Property Owner" className="lucide" />}
              {isVerified && (
                <CheckCircle className="h-3 w-3 text-green-500 ml-1" />
              )}
            </div>
          </div>
        </div>

        {!isOwnerView && (
          <div className="space-y-2">
            {phone && (
              <Button variant="default" className="w-full" asChild>
                <a href={`tel:${phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Owner
                </a>
              </Button>
            )}

            {/* Contact Landlord Button - Only show if authenticated and not the owner */}
            {isAuthenticated && currentUserId && listingId && listingTitle && (
              <ContactLandlordButton
                listingId={listingId}
                listingTitle={listingTitle}
                participantId={currentUserId as unknown}
                userRole={currentUserRole || 'tenant'}
                variant="outline"
                className="w-full"
              />
            )}

            {/* Show sign-in prompt if not authenticated */}
            {!isAuthenticated && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">
                  <Mail className="h-4 w-4 mr-2" />
                  Sign in to Message
                </Link>
              </Button>
            )}

            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Viewing
            </Button>
          </div>
        )}

        {isOwnerView && (
          <div className="text-sm text-muted-foreground">
            This is your listing
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ListingDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: response, isLoading, error } = useListing(id);
  const { save, unsave, isSaving, isUnsaving } = useToggleSaveListing();

  const listing = response?.data;
  const isSaved = listing?.savedByCurrentUser || false;

  // Get current user info from custom metadata
  const currentUserId = user?.publicMetadata?.userId as string | undefined;
  const currentUserRole = user?.publicMetadata?.role as string | undefined;
  const isAuthenticated = isUserLoaded && !!user;

  // Check if user is owner
  const isOwnerView = !!(isAuthenticated && currentUserId && listing?.owner?.id === currentUserId);

  const handleSaveToggle = () => {
    if (isSaved) {
      unsave(id);
    } else {
      save(id);
    }
  };

  if (isLoading) {
    return <ListingDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/listings')}>
            Back to Listings
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg)' }}>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Title and Price */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-heading mb-2" style={{ color: 'var(--text)' }}>
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>
                      {listing.address && `${listing.address}, `}
                      {listing.area}, {listing.state}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold font-heading" style={{ color: 'var(--accent)' }}>
                    {listing.priceFormatted || `₦${Number(listing.price).toLocaleString()}`}
                  </div>
                  {listing.listingType === 'rent' && (
                    <div className="text-sm text-muted-foreground">per month</div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={verificationTierColors[listing.verificationTier] || 'default'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {verificationTierLabels[listing.verificationTier] || listing.verificationTier}
                </Badge>
                <Badge variant="outline">
                  {listingTypeLabels[listing.listingType] || listing.listingType}
                </Badge>
                {listing.propertyType && (
                  <Badge variant="outline" className="capitalize">
                    {propertyTypeLabels[listing.propertyType] || listing.propertyType}
                  </Badge>
                )}
                {listing.furnished && (
                  <Badge variant="secondary">Furnished</Badge>
                )}
                {listing.verification?.overallStatus === 'certified' && (
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Property
                  </Badge>
                )}
              </div>
            </div>

            {/* Property Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
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

            {/* Description */}
            {listing.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity: string) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: 'var(--text)' }}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability Info */}
            {listing.availableFrom && (
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span style={{ color: 'var(--text)' }}>
                      Available from: {new Date(listing.availableFrom).toLocaleDateString()}
                    </span>
                  </div>
                  {listing.minimumStay && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span style={{ color: 'var(--text)' }}>
                        Minimum stay: {listing.minimumStay} months
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Action Buttons - Mobile/Tablet */}
            <div className="lg:hidden flex flex-wrap gap-2">
              <Button
                variant={isSaved ? 'default' : 'outline'}
                onClick={handleSaveToggle}
                disabled={isSaving || isUnsaving}
                className="flex-1"
              >
                <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current')} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {isOwnerView && (
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>

            {/* Owner/Agent Card */}
            <OwnerCard
              owner={listing.owner}
              agent={listing.agent}
              isOwnerView={isOwnerView}
              listingId={listing.id}
              listingTitle={listing.title}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isAuthenticated={isAuthenticated}
            />

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:block space-y-2">
              <Button
                variant={isSaved ? 'default' : 'outline'}
                onClick={handleSaveToggle}
                disabled={isSaving || isUnsaving}
                className="w-full"
              >
                <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current')} />
                {isSaved ? 'Save Listing' : 'Save Listing'}
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Listing
              </Button>
              {isOwnerView && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Listing
                  </Link>
                </Button>
              )}
              <Separator />
              <Button variant="ghost" className="w-full text-red-500 hover:text-red-600">
                <Flag className="h-4 w-4 mr-2" />
                Report Listing
              </Button>
            </div>

            {/* Listing Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Listing Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Views
                  </span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    {listing.viewsCount || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {listing.updatedAt !== listing.createdAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        {new Date(listing.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

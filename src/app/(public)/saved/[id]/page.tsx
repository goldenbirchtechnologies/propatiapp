'use client'

import AppIcon from '@/components/icons/app-icon';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {

  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Heart,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Shield,
  Home,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  X,
  Search,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useListing, useToggleSaveListing } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  duplex: 'Duplex',
  land: 'Land',
  office: 'Office',
  shop: 'Shop',
  warehouse: 'Warehouse',
};

const listingTypeLabels: Record<string, string> = {
  rent: 'For Rent',
  sale: 'For Sale',
  short_let: 'Short Let',
  share: 'Shared',
  commercial: 'Commercial',
};

const verificationTierLabels: Record<string, string> = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
};

const verificationTierColors: Record<string, 'default' | 'secondary' | 'outline' | 'success'> = {
  basic: 'secondary',
  verified: 'default',
  inspected: 'outline',
  certified: 'success',
};

function ImageGallery({ images, title }: { images: unknown[]; title: string }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
        <Home className="h-16 w-16 text-zinc-400" />
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const currentSrc =
    typeof currentImage === 'string'
      ? currentImage
      : currentImage.url;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden group">
        <Image
          src={currentSrc}
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
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface-elevated/90 hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {images.map((image: unknown, index: number) => {
            const src = typeof image === 'string' ? image : image.url;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative aspect-video rounded-md overflow-hidden border-2 transition-all',
                  currentIndex === index
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12vw"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PropertySpecs({
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
          className="flex flex-col items-center p-4 bg-zinc-900/50 rounded-lg"
        >
          <spec.icon className="h-6 w-6 mb-2 text-zinc-400" />
          <span className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {spec.value}
          </span>
          <span className="text-xs text-zinc-400">{spec.label}</span>
        </div>
      ))}
    </div>
  );
}

function ContactInquiryForm({ listingTitle }: { listingTitle: string }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      listingTitle,
    };

    try {
      // Simulate API call for public contact form
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Send className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Inquiry Sent</h3>
          <p className="text-sm text-white-variant">
            Thank you! A representative will get back to you shortly regarding &ldquo;{listingTitle}&rdquo;.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSubmitted(false);
            }}
          >
            Send Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Make an Inquiry</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input name="name" placeholder="Your full name" required className="h-11" />
          </div>
          <div>
            <Input name="email" type="email" placeholder="Email address" required className="h-11" />
          </div>
          <div>
            <Input name="phone" type="tel" placeholder="Phone number" className="h-11" />
          </div>
          <div>
            <Textarea
              name="message"
              placeholder={`I'm interested in "${listingTitle}". Please contact me with more details.`}
              rows={4}
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Inquiry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SavedListingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);
  const { save, unsave, isSaving, isUnsaving } = useToggleSaveListing();

  React.useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  const id = resolvedParams?.id || '';

  const { data, isLoading, error } = useListing(id, !!id);
  const listing = data?.data || data;

  const isSaved = listing?.savedByCurrentUser || false;

  const handleSaveToggle = () => {
    if (!id) return;
    if (isSaved) {
      unsave(id);
    } else {
      save(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
          <p className="text-zinc-400 mb-6">
            The listing you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/listings')}>Back to Listings</Button>
        </Card>
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const isResidential = 'bedrooms' in (listing || {});
  const ownerContact = listing.owner || listing.agent || {};

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg)' }}>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/saved')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Saved
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={images} title={listing.title} />

            {/* Title and Price */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-heading mb-2" style={{ color: 'var(--text)' }}>
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-zinc-400">
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
                    <div className="text-sm text-zinc-400">per month</div>
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
                  toilets={(listing as unknown).toilets}
                  sizeSqm={listing.sizeSqm}
                  parkingSpaces={(listing as unknown).parkingSpaces}
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
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
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
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span style={{ color: 'var(--text)' }}>
                      Available from: {new Date(listing.availableFrom).toLocaleDateString()}
                    </span>
                  </div>
                  {(listing as unknown).minimumStay && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span style={{ color: 'var(--text)' }}>
                        Minimum stay: {(listing as unknown).minimumStay} months
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
              <Button variant="outline" asChild>
                <Link href="/listings">Browse More</Link>
              </Button>
            </div>

            {/* Contact / Inquiry Form */}
            <ContactInquiryForm listingTitle={listing.title} />

            {/* Contact Info */}
            {ownerContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {ownerContact.fullName || 'Property Contact'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ownerContact.profileImage || undefined} alt={ownerContact.fullName || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-emerald-4002 text-white font-bold">
                        {getInitials(ownerContact.fullName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text)' }}>
                        {ownerContact.fullName || 'Agent / Owner'}
                      </p>
                      <p className="text-xs text-zinc-400">Contact via inquiry form</p>
                    </div>
                  </div>
                  {ownerContact.phone && (
                    <div className="flex items-center gap-2 text-white-variant">
                      <Phone className="h-4 w-4" />
                      <AppIcon name={ownerContact.phone} className="lucide" />
                    </div>
                  )}
                  {ownerContact.email && (
                    <div className="flex items-center gap-2 text-white-variant">
                      <Mail className="h-4 w-4" />
                      <AppIcon name={ownerContact.email} className="lucide" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:block space-y-2">
              <Button
                variant={isSaved ? 'default' : 'outline'}
                onClick={handleSaveToggle}
                disabled={isSaving || isUnsaving}
                className="w-full"
              >
                <Heart className={cn('h-4 w-4 mr-2', isSaved && 'fill-current')} />
                {isSaved ? 'Saved' : 'Save Listing'}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/listings">
                  <Search className="h-4 w-4 mr-2" />
                  Browse More
                </Link>
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full text-red-500 hover:text-red-600">
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
                  <span className="text-zinc-400 flex items-center gap-2">
                    List ID
                  </span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    #{listing.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Listed</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {listing.updatedAt !== listing.createdAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Updated</span>
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

'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Building,
  Calendar,
  Shield,
  TrendingUp,
  Navigation,
  Phone,
  Mail,
  Share2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { ListingData } from '@/components/listings/listing-card';

interface PropertyComparisonProps {
  properties: ListingData[];
  maxProperties?: number;
  onRemoveProperty?: (propertyId: string) => void;
  onAddProperty?: () => void;
  className?: string;
}

interface ComparisonFeature {
  label: string;
  icon: React.ReactNode;
  getValue: (property: ListingData) => React.ReactNode;
  category: 'basic' | 'details' | 'verification' | 'amenities';
}

const listingTypeLabels: Record<ListingData['listingType'], string> = {
  rent: 'For Rent',
  sale: 'For Sale',
  short_let: 'Short Let',
  share: 'Shared',
  commercial: 'Commercial',
};

const verificationTierLabels: Record<ListingData['verificationTier'], string> = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
};

const verificationTierColors: Record<ListingData['verificationTier'], string> = {
  basic: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inspected: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  certified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

function PropertyImage({
  property,
  onRemove,
}: {
  property: ListingData;
  onRemove?: (id: string) => void;
}) {
  const getPrimaryImage = () => {
    if (property.coverImage) return property.coverImage;

    if (Array.isArray(property.images) && property.images.length > 0) {
      const firstImage = property.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      const cover = property.images.find((img) => typeof img === 'object' && img.isCover);
      return cover
        ? (cover as { url: string }).url
        : (firstImage as { url: string }).url;
    }

    return null;
  };

  const primaryImage = getPrimaryImage() || '/placeholder-property.jpg';
  const isResidential = property.listingType !== 'commercial';

  return (
    <div className="relative">
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-muted">
        {primaryImage && primaryImage !== '/placeholder-property.jpg' ? (
          <Image
            src={primaryImage}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Home className="h-12 w-12" />
          </div>
        )}
        {onRemove && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemove(property.id)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
            aria-label="Remove from comparison"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
        <Badge
          className={cn(
            'text-xs font-semibold',
            isResidential
              ? 'bg-residential-teal text-white'
              : 'bg-commercial-gold text-white'
          )}
        >
          {listingTypeLabels[property.listingType]}
        </Badge>
        <Badge className={verificationTierColors[property.verificationTier]}>
          <Shield className="h-3 w-3 mr-1" />
          {verificationTierLabels[property.verificationTier]}
        </Badge>
      </div>
    </div>
  );
}

function PropertyHeader({ property }: { property: ListingData }) {
  const displayPrice = property.priceFormatted || formatCurrency(property.price);
  const isResidential = property.listingType !== 'commercial';

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-heading font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
        {property.title}
      </h3>
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span className="line-clamp-2 min-h-[2.5rem]">
          {property.address}, {property.area}, {property.state}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-heading font-bold text-2xl',
            isResidential ? 'text-residential-teal' : 'text-commercial-gold'
          )}
        >
          {displayPrice}
        </span>
        {property.listingType === 'rent' && (
          <span className="text-sm text-muted-foreground">/month</span>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  icon,
  values,
  isHeader = false,
}: {
  label: string;
  icon?: React.ReactNode;
  values: React.ReactNode[];
  isHeader?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        isHeader && 'bg-muted/50 font-semibold'
      )}
      style={{ gridTemplateColumns: `minmax(150px, 1fr) repeat(${values.length}, 1fr)` }}
    >
      <div
        className={cn(
          'flex items-center gap-2 p-3 text-sm',
          isHeader ? 'font-semibold' : 'font-medium text-muted-foreground'
        )}
      >
        {icon}
        <MaterialIcon name="{label}" className="material-symbols-outlined" />
      </div>
      {values.map((value, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center justify-center p-3 text-sm text-center border-l border-border',
            isHeader && 'font-semibold'
          )}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function MobileComparisonCard({
  property,
  features,
  onRemove,
  isResidential,
}: {
  property: ListingData;
  features: ComparisonFeature[];
  onRemove?: (id: string) => void;
  isResidential: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <PropertyImage property={property} onRemove={onRemove} />
      <PropertyHeader property={property} />
      <Separator />
      <CardContent className="p-4 space-y-3">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {feature.icon}
              <MaterialIcon name="{feature.label}" className="material-symbols-outlined" />
            </div>
            <div className="text-sm font-medium text-right flex-1">
              {feature.getValue(property)}
            </div>
          </div>
        ))}
        <Separator className="my-3" />
        <Link href={`/listings/${property.id}`} className="block">
          <Button
            className={cn(
              'w-full',
              isResidential
                ? 'bg-residential-teal hover:bg-residential-teal/90'
                : 'bg-commercial-gold hover:bg-commercial-gold/90'
            )}
          >
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function DesktopComparisonTable({
  properties,
  features,
  onRemove,
}: {
  properties: ListingData[];
  features: ComparisonFeature[];
  onRemove?: (id: string) => void;
}) {
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, ComparisonFeature[]>);

  const categoryLabels = {
    basic: 'Basic Information',
    details: 'Property Details',
    verification: 'Verification & Status',
    amenities: 'Amenities',
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Property Headers */}
        <div
          className="grid gap-4 mb-4"
          style={{
            gridTemplateColumns: `minmax(150px, 1fr) repeat(${properties.length}, 1fr)`,
          }}
        >
          <div className="p-3" />
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <PropertyImage property={property} onRemove={onRemove} />
              <PropertyHeader property={property} />
              <CardContent className="p-3">
                <Link href={`/listings/${property.id}`}>
                  <Button
                    className={cn(
                      'w-full',
                      property.listingType !== 'commercial'
                        ? 'bg-residential-teal hover:bg-residential-teal/90'
                        : 'bg-commercial-gold hover:bg-commercial-gold/90'
                    )}
                  >
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Features */}
        <Card>
          {Object.entries(groupedFeatures).map(([category, categoryFeatures], catIdx) => (
            <div key={category}>
              {catIdx > 0 && <Separator />}
              <ComparisonRow
                label={categoryLabels[category as keyof typeof categoryLabels]}
                values={properties.map(() => '')}
                isHeader
              />
              {categoryFeatures.map((feature, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Separator />}
                  <ComparisonRow
                    label={feature.label}
                    icon={feature.icon}
                    values={properties.map((property) => feature.getValue(property))}
                  />
                </React.Fragment>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function PropertyComparison({
  properties,
  maxProperties = 4,
  onRemoveProperty,
  onAddProperty,
  className,
}: PropertyComparisonProps) {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayedProperties = properties.slice(0, maxProperties);

  const comparisonFeatures: ComparisonFeature[] = [
    {
      label: 'Property Type',
      icon: <Building className="h-4 w-4" />,
      getValue: (property) => (
        <span className="capitalize">{property.propertyType || 'N/A'}</span>
      ),
      category: 'basic',
    },
    {
      label: 'Listing Type',
      icon: <TrendingUp className="h-4 w-4" />,
      getValue: (property) => listingTypeLabels[property.listingType],
      category: 'basic',
    },
    {
      label: 'Bedrooms',
      icon: <Bed className="h-4 w-4" />,
      getValue: (property) =>
        property.bedrooms != null ? `${property.bedrooms} Beds` : 'N/A',
      category: 'details',
    },
    {
      label: 'Bathrooms',
      icon: <Bath className="h-4 w-4" />,
      getValue: (property) =>
        property.bathrooms != null ? `${property.bathrooms} Baths` : 'N/A',
      category: 'details',
    },
    {
      label: 'Size',
      icon: <Square className="h-4 w-4" />,
      getValue: (property) =>
        property.sizeSqm != null
          ? `${property.sizeSqm.toLocaleString()} sqm`
          : 'N/A',
      category: 'details',
    },
    {
      label: 'Location',
      icon: <MapPin className="h-4 w-4" />,
      getValue: (property) => `${property.area}, ${property.state}`,
      category: 'basic',
    },
    {
      label: 'Verification Status',
      icon: <Shield className="h-4 w-4" />,
      getValue: (property) => (
        <Badge className={verificationTierColors[property.verificationTier]}>
          {verificationTierLabels[property.verificationTier]}
        </Badge>
      ),
      category: 'verification',
    },
    {
      label: 'Verification Tier',
      icon: <CheckCircle className="h-4 w-4" />,
      getValue: (property) => {
        const tier = property.verification?.currentLayer;
        if (tier != null && tier >= 3) {
          return (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Tier {tier}
            </Badge>
          );
        }
        return tier != null ? `Tier ${tier}` : 'N/A';
      },
      category: 'verification',
    },
    {
      label: 'Status',
      icon: <Calendar className="h-4 w-4" />,
      getValue: (property) => (
        <span className="capitalize">{property.status || 'Active'}</span>
      ),
      category: 'verification',
    },
    {
      label: 'Listed Date',
      icon: <Calendar className="h-4 w-4" />,
      getValue: (property) =>
        new Date(property.createdAt).toLocaleDateString('en-NG', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      category: 'basic',
    },
    {
      label: 'Amenities',
      icon: <Home className="h-4 w-4" />,
      getValue: (property) => {
        if (!property.amenities || property.amenities.length === 0) {
          return 'None listed';
        }
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs capitalize">
                {amenity.replace(/_/g, ' ')}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3}
              </Badge>
            )}
          </div>
        );
      },
      category: 'amenities',
    },
  ];

  if (displayedProperties.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-xl mb-2">
            No Properties to Compare
          </h3>
          <p className="text-muted-foreground mb-6">
            Add properties to start comparing their features and prices.
          </p>
          {onAddProperty && (
            <Button onClick={onAddProperty} className="bg-residential-teal">
              Add Properties
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl">
            Property Comparison
          </h2>
          <p className="text-muted-foreground mt-1">
            Comparing {displayedProperties.length} of {maxProperties} properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          {onAddProperty && displayedProperties.length < maxProperties && (
            <Button
              onClick={onAddProperty}
              size="sm"
              className="bg-residential-teal hover:bg-residential-teal/90"
            >
              Add Property
            </Button>
          )}
        </div>
      </div>

      {/* Comparison View */}
      {isMobile ? (
        <div className="space-y-4">
          {displayedProperties.map((property) => (
            <MobileComparisonCard
              key={property.id}
              property={property}
              features={comparisonFeatures}
              onRemove={onRemoveProperty}
              isResidential={property.listingType !== 'commercial'}
            />
          ))}
        </div>
      ) : (
        <DesktopComparisonTable
          properties={displayedProperties}
          features={comparisonFeatures}
          onRemove={onRemoveProperty}
        />
      )}

      {/* Footer Actions */}
      {displayedProperties.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {displayedProperties.length < maxProperties ? (
                <span>
                  You can add up to {maxProperties - displayedProperties.length}{' '}
                  more {displayedProperties.length < maxProperties - 1 ? 'properties' : 'property'}
                </span>
              ) : (
                <MaterialIcon name="Maximum number of properties reached" className="material-symbols-outlined" />
              )}
            </div>
            <div className="flex gap-2">
              {onAddProperty && displayedProperties.length < maxProperties && (
                <Button
                  onClick={onAddProperty}
                  variant="outline"
                  size="sm"
                >
                  Add Another Property
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                className="bg-residential-teal hover:bg-residential-teal/90"
                asChild
              >
                <Link href="/listings">Browse More Properties</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export function PropertyComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="space-y-2 pt-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

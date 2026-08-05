'use client';

/**
 * Local interfaces mirroring the Shortlet Listing Engine spec payload.
 * Defined standalone to avoid touching prisma/schema or validators directly.
 */

export type PropertyStructure =
  | 'house'
  | 'apartment'
  | 'barn'
  | 'bed_and_breakfast'
  | 'hotel'
  | 'tent';

export type PrivacyType = 'entire_place' | 'private_room' | 'shared_room';

export type BookingModel = 'review_first_3_then_instant' | 'instant_book';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  formatted_address: string;
  coordinates: Coordinates;
  show_precise_location?: boolean;
}

export interface FloorPlan {
  guests_count: number;
  bedrooms_count: number;
  beds_count: number;
  bathrooms_count: number;
}

export interface Pricing {
  currency: string;
  base_price: number;
  weekend_pricing?: number;
}

export interface Discounts {
  new_listing_promotion?: boolean;
  last_minute_percentage?: number;
  weekly_percentage?: number;
  monthly_percentage?: number;
}

export interface SafetyDisclosures {
  exterior_security_camera_present?: boolean;
  noise_decibel_monitor_present?: boolean;
  weapons_on_property?: boolean;
}

export interface KycAddress {
  country_code: string;
  street_address: string;
  apt_unit?: string;
  city: string;
  state_province: string;
  postal_code: string;
}

export interface KycCompliance {
  address: KycAddress;
  is_business_entity: boolean;
  attestation_accepted: boolean;
}

export interface PhotoItem {
  photo_id: string;
  url: string;
  is_cover?: boolean;
  order?: number;
}

export interface ShortletListingPayload {
  listingType?: 'short_let';
  property_structure?: PropertyStructure;
  privacy_type: PrivacyType;
  location: Location;
  floor_plan: FloorPlan;
  amenities?: string[];
  bedroom_furnishings?: string[];
  space_images?: PhotoItem[];
  photos: PhotoItem[];
  house_rules?: string[];
  unit_description?: string;
  title: string;
  highlights?: string[];
  booking_model?: BookingModel;
  pricing: Pricing;
  discounts?: Discounts;
  safety_disclosures?: SafetyDisclosures;
  kyc_compliance?: {
    address: {
      country_code: string;
      street_address: string;
      apt_unit?: string;
      city: string;
      state_province: string;
      postal_code?: string;
    };
    is_business_entity: boolean;
    attestation_accepted: boolean;
  };
}

import type { ListingType } from '@prisma/client';

export type PublicListingAction = 'rental-application' | 'shortlet-booking' | 'inspection' | 'chat' | 'purchase-enquiry';
export interface ListingActionSet {
  primary: { label: string; action: PublicListingAction };
  secondary: { label: string; action: PublicListingAction }[];
}

export function getPublicListingActions(listingType: ListingType | string): ListingActionSet {
  if (listingType === 'short_let') return { primary: { label: 'Book This Shortlet', action: 'shortlet-booking' }, secondary: [{ label: 'Chat with Host/Broker', action: 'chat' }] };
  if (listingType === 'sale') return { primary: { label: 'Make an Offer', action: 'purchase-enquiry' }, secondary: [{ label: 'Schedule Inspection', action: 'inspection' }, { label: 'Chat with Agent', action: 'chat' }] };
  return { primary: { label: 'Apply for Property', action: 'rental-application' }, secondary: [{ label: 'Schedule Inspection', action: 'inspection' }, { label: 'Chat with Broker', action: 'chat' }] };
}

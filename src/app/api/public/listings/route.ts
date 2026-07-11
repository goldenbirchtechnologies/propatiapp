import { NextResponse } from 'next/server';

export async function GET() {
  const listings = [
    {
      id: '1',
      title: 'The Emerald Heights Penthouse',
      price: '₦125,000,000',
      location: 'Ikoyi, Lagos State',
      beds: 4,
      baths: 5,
      area: '450',
      type: 'Residential',
      listingType: 'FOR SALE',
      tier: 'Verified',
      image: '',
      listingAgent: 'PROPATI Verified Agent',
      description: 'Premium penthouse with panoramic views.',
    },
    {
      id: '2',
      title: 'Apex Tower Corporate Hub',
      price: '₦8,500,000/yr',
      location: 'Victoria Island, Lagos',
      beds: 12,
      baths: 8,
      area: '1200',
      type: 'Commercial',
      listingType: 'FOR LEASE',
      tier: 'Verified',
      image: '',
      listingAgent: 'PROPATI Verified Agent',
      description: 'Premium office space in the heart of VI.',
    },
    {
      id: '3',
      title: 'Oakwood Garden Duplex',
      price: '₦4,200,000/yr',
      location: 'Lekki Phase 1, Lagos',
      beds: 3,
      baths: 4,
      area: '350',
      type: 'Residential',
      listingType: 'FOR RENT',
      tier: 'Verified',
      image: '',
      listingAgent: 'PROPATI Verified Agent',
      description: 'Beautiful duplex with garden.',
    },
  ];

  return NextResponse.json({ data: listings, total: listings.length });
}

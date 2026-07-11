import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({
    status: 'operational',
    services: {
      database: 'healthy',
      search: 'healthy',
      storage: 'healthy',
    },
    featured: [
      { id: '1', title: 'The Emerald Heights Penthouse', location: 'Ikoyi, Lagos', price: '₦125,000,000' },
      { id: '2', title: 'Apex Tower Corporate Hub', location: 'Victoria Island, Lagos', price: '₦8,500,000/yr' },
    ],
    stats: {
      totalListings: 1248,
      verifiedAgents: 340,
      totalUsers: 850000,
    },
  });

  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return response;
}

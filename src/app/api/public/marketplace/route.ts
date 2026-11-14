import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { countVerifiedPublicAgents } from '@/lib/agents/public-directory';

export async function GET() {
  const [activeListings, totalUsers, verifiedAgents, featuredListings] = await Promise.all([
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.user.count(),
    countVerifiedPublicAgents(),
    prisma.listing.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: { id: true, title: true, city: true, price: true },
    }),
  ]);

  const response = NextResponse.json({
    status: 'operational',
    services: {
      database: 'healthy',
      search: 'healthy',
      storage: 'healthy',
    },
    featured: featuredListings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      location: listing.city,
      price: listing.price.toString(),
    })),
    stats: {
      totalListings: activeListings,
      verifiedAgents,
      totalUsers,
    },
  });

  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return response;
}

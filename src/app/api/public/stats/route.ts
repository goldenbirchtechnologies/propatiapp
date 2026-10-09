import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

export async function GET() {
  try {
    const [totalListings, activeListings, verifiedListings, totalUsers, certifiedVerifications] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.listing.count({ where: { verificationTier: { in: ['verified', 'inspected', 'certified'] } } }),
      prisma.user.count(),
      prisma.verification.count({ where: { overallStatus: 'certified' } }),
    ]);

    return NextResponse.json(
      {
        listings: { total: totalListings, active: activeListings, verified: verifiedListings },
        users: { total: totalUsers },
        verifications: { certified: certifiedVerifications },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (e) {
    console.error('[public/stats] error:', e);
    return NextResponse.json({ listings: { total: 0, active: 0, verified: 0 }, users: { total: 0 }, verifications: { certified: 0 } });
  }
}

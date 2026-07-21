import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Move-In Coordination – Landlord',
  description: 'Coordinate commercial move-in appointments.',
};

export default async function CommercialMoveInPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const recentBookings = await prisma.booking.findMany({
    where: {
      listing: { ownerId: user.id, listingType: 'commercial' },
    },
    include: {
      guest: { select: { fullName: true } },
      listing: { select: { title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-foreground">Move-In Coordination — Commercial</h1>
          <p className="text-muted-foreground mt-1">
            Welcoming new tenants for commercial grade-A serviced offices.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Move-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No commercial move-ins scheduled yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="py-3 font-medium">Property</th>
                      <th className="py-3 font-medium">Tenant</th>
                      <th className="py-3 font-medium">Check-in</th>
                      <th className="py-3 font-medium">Check-out</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{b.listing.title}</td>
                        <td className="py-3">{b.guest.fullName}</td>
                        <td className="py-3">{b.checkIn}</td>
                        <td className="py-3">{b.checkOut}</td>
                        <td className="py-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

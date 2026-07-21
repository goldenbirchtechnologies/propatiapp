import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';

export default async function LandlordListingDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/listings/${params.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) redirect('/dashboard/landlord/properties');

  const json = await res.json();
  const listing = json.data;
  const isOwner = user.id === listing.ownerId;
  if (!isOwner) redirect('/dashboard/landlord/properties');

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
          <p className="text-muted-foreground">{listing.address || `${listing.area}, ${listing.state}`}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="text-sm text-muted-foreground mb-1">Status</h2>
            <p className="text-lg font-medium text-foreground capitalize">{listing.status}</p>
          </div>
          <div className="card p-5">
            <h2 className="text-sm text-muted-foreground mb-1">Price</h2>
            <p className="text-lg font-medium text-foreground">₦{Number(listing.price).toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <h2 className="text-sm text-muted-foreground mb-1">Listing Type</h2>
            <p className="text-lg font-medium text-foreground capitalize">{listing.listingType}</p>
          </div>
          <div className="card p-5">
            <h2 className="text-sm text-muted-foreground mb-1">Property Type</h2>
            <p className="text-lg font-medium text-foreground capitalize">{listing.propertyType}</p>
          </div>
        </div>
        {listing.images?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {listing.images.map((img: { url: string; isCover: boolean }) => (
              <img key={img.url} src={img.url} alt={listing.title} className="w-full h-32 object-cover rounded-lg border border-border" />
            ))}
          </div>
        )}
        {listing.description && <p className="text-sm text-foreground whitespace-pre-wrap">{listing.description}</p>}
      </div>
    </DashboardShell>
  );
}

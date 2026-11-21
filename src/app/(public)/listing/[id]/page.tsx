import { redirect } from 'next/navigation';

export default function LegacyListingDetailPage({ params }: { params: { id: string } }) {
  redirect(`/listings/${params.id}`);
}

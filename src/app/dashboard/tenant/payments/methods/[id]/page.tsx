import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

/** Keep legacy /methods/card and /methods/bank links on the redesigned page. */
export default async function AddPaymentMethodPage({ params }: Props) {
  const { id } = await params;
  const method = id === 'bank' ? 'bank' : 'card';
  redirect(`/dashboard/tenant/payments/methods/new?method=${method}`);
}

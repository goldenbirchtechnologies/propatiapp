'use client';

import { use } from 'react';
import { ListingDetailContent, PageProps } from '@/app/(public)/listings/[id]/listing-detail-components';

export default function ListingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <ListingDetailContent id={resolvedParams.id} />;
}

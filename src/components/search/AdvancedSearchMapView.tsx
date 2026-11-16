'use client';

import dynamic from 'next/dynamic';
import type { ClientMapProps } from './ClientMap';

const ClientMap = dynamic(() => import('./ClientMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] lg:h-[600px] w-full rounded-2xl bg-[#E5E9E7] animate-pulse" />
  ),
});

export function AdvancedSearchMapView(props: ClientMapProps) {
  return <ClientMap {...props} />;
}

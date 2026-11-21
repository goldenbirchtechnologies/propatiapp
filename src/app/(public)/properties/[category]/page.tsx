import MarketplacePage from '@/components/properties/MarketplacePage';
import { notFound } from 'next/navigation';

const categories = ['buy', 'rent', 'short-let', 'commercial', 'land', 'featured'] as const;
export function generateMetadata({ params }: { params: { category: string } }) { const label = params.category.replace('-', ' '); return { title: `${label.replace(/\b\w/g, (c) => c.toUpperCase())} properties | Propatibox`, description: `Browse ${label} properties across Nigeria.` }; }
export default function PropertyCategoryPage({ params }: { params: { category: string } }) { if (!categories.includes(params.category as (typeof categories)[number])) notFound(); return <MarketplacePage initialCategory={params.category as any} />; }

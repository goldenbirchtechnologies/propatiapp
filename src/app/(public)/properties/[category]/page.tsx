import MarketplacePage from '@/components/properties/MarketplacePage';
import { notFound } from 'next/navigation';

const categories = ['buy', 'rent', 'short-let', 'commercial', 'land', 'featured'] as const;
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) { const { category } = await params; const label = category.replace('-', ' '); return { title: `${label.replace(/\b\w/g, (c) => c.toUpperCase())} properties | Propatibox`, description: `Browse ${label} properties across Nigeria.` }; }
export default async function PropertyCategoryPage({ params }: { params: Promise<{ category: string }> }) { const { category } = await params; if (!categories.includes(category as (typeof categories)[number])) notFound(); return <MarketplacePage initialCategory={category as any} />; }

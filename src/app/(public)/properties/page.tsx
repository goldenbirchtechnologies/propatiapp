import MarketplacePage from '@/components/properties/MarketplacePage';

export const metadata = { title: 'Properties in Nigeria | Propatibox', description: 'Discover verified properties for sale, rent and short-let across Nigeria.' };
export default function PropertiesPage() { return <MarketplacePage initialCategory="all" />; }

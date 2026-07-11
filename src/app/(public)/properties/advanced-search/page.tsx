import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Verified Properties In Nigeria Advanced Search',
  description: 'Verified Properties In Nigeria Advanced Search page',
};

export default function verifiedpropertiesinnigeriapropatiadvancedsearchPage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Verified Properties In Nigeria Advanced Search</h1>
          <p className="text-muted-foreground mt-1">PROPATI | Advanced Search PROPATI search Browse Listings Insights Valuation Agency notifications favorite List Property Category Residential Commercia...</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ported from reference: <strong>verified_properties_in_nigeria_propati_advanced_search.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

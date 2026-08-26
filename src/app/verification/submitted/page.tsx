import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Property Verification Submitted',
  description: 'Property Verification Submitted page',
};

export default function propertyverificationsubmittedpropatiPage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.08] bg-card p-6 shadow-none">
          <h1 className="text-2xl font-bold text-foreground">Property Verification Submitted</h1>
          <p className="text-zinc-500 mt-1">Verification Submitted | EstateVerify EstateVerify Rent Buy Short-let notifications check Identity check Ownership check Site Visit check Documents ve...</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-500">Ported from reference: <strong>property_verification_submitted_propati.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Property Verification Step 2 Identity',
  description: 'Property Verification Step 2 Identity page',
};

export default function propertyverificationstepidentitypropatiPage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Property Verification Step 2 Identity</h1>
          <p className="text-muted-foreground mt-1">Identity Verification | EstateVerify EstateVerify Verify Your Property - The Obsidian Penthouse notifications person check L1 Assets 02 L2 Identity 03...</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ported from reference: <strong>property_verification_step_2_identity_propati.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

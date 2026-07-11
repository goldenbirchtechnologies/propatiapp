import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Property Verification Step 1 Documents',
  description: 'Property Verification Step 1 Documents page',
};

export default function propertyverificationstepdocumentspropatiPage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Property Verification Step 1 Documents</h1>
          <p className="text-muted-foreground mt-1">EstateVerify - Verification Wizard EstateVerify Landlord Verification help Support notifications Verify Your Property - The Obsidian Penthouse Complet...</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Document Verification</h2>
          <p className="text-muted-foreground">L1 Documents</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ported from reference: <strong>property_verification_step_1_documents_propati.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

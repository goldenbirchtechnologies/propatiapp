import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Property Verification Step 4 Inspection',
  description: 'Property Verification Step 4 Inspection page',
};

export default function propertyverificationstepinspectionpropatiPage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Property Verification Step 4 Inspection</h1>
          <p className="text-muted-foreground mt-1">EstateVerify - Verification Wizard EstateVerify Rent Buy Short-let notifications check Identity check Ownership check L3 Virtual 04 L4 Physical Verify...</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Level 4: Schedule Physical Inspection</h2>
          <p className="text-muted-foreground">Final Verification Step</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ported from reference: <strong>property_verification_step_4_inspection_propati.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

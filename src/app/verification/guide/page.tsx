import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Verification Guide Marketplace',
  description: 'Verification Guide Marketplace page',
};

export default function verificationguidepropatimarketplacePage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Verification Guide Marketplace</h1>
          <p className="text-muted-foreground mt-1">Verification Guide | VeriProp Nigeria VeriProp Nigeria Marketplace Verification Guide Pricing About Us Get Started menu shield_person Verification Ste...</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 1: Document Review</h2>
          <p className="text-muted-foreground">Phase 1: Due Diligence</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 2: Identity Verification</h2>
          <p className="text-muted-foreground">Master the 5-layer process that secures your investment and eliminates fraud. Navigating Nigeria's real estate market requires more than just capital—it requires verified certainty.</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 3: Site Inspection</h2>
          <p className="text-muted-foreground">Cross-referencing unique file numbers with state records.</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 4: Legal &amp; Title Search</h2>
          <p className="text-muted-foreground">Confirming the validity of previous transfers.</p>
        </section>
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 5: Final Clearance</h2>
          <p className="text-muted-foreground">Real-time NIN verification to confirm the identity of the titleholder.</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ported from reference: <strong>verification_guide_propati_marketplace.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

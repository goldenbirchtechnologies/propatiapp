import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Verification Checklist Marketplace',
  description: 'Verification Checklist Marketplace page',
};

export default function verificationchecklistpropatimarketplacePage() {
  return (
    <section className="container mx-auto py-12">
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.08] bg-card p-6 shadow-none">
          <h1 className="text-2xl font-bold text-foreground">Verification Checklist Marketplace</h1>
          <p className="text-zinc-500 mt-1">PROPATI | Verification Checklist VeriLand Nigeria Dashboard Verify Listings Reports New Verification print Print Document download Download PDF share ...</p>
        </section>
        <section className="rounded-xl border border-white/[0.08] bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 1: Document Review</h2>
          <p className="text-zinc-500">Nigerian Land Registry & Legal Compliance Standard</p>
        </section>
        <section className="rounded-xl border border-white/[0.08] bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 2: Identity Verification</h2>
          <p className="text-zinc-500">Confirming onsite beacons match official survey plan coordinates.</p>
        </section>
        <section className="rounded-xl border border-white/[0.08] bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Phase 3: Site Inspection</h2>
          <p className="text-zinc-500">Community lineage claim assessment.</p>
        </section>
        <section className="rounded-xl border border-white/[0.08] bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Legal Search</h2>
          <p className="text-zinc-500">Visual inspection of foundation and load-bearing walls.</p>
        </section>
        <section className="rounded-xl border border-white/[0.08] bg-background p-5">
          <h2 className="text-xl font-semibold mb-2">Final Clearance</h2>
          <p className="text-zinc-500">"This document serves as a preliminary verification guide and does not replace professional legal advice or formal title searches conducted by qualified legal practitioners."</p>
        </section>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-500">Ported from reference: <strong>verification_checklist_propati_marketplace.html</strong></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

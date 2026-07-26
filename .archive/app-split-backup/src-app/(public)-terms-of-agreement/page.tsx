'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* ================================================================
   TERMS OF AGREEMENT PAGE — sections: legalHeader, legalBody
   ================================================================ */

const lastUpdated = '1 June 2026';

export default function TermsOfAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Legal Header */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Legal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Terms of Agreement
            </h1>
            <p className="mt-4 text-primary-foreground/80">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Legal Body */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8 text-foreground leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-foreground">1. Digital Agreement Framework</h2>
              <p className="mt-2 text-muted-foreground">
                PROPATI Digital Agreements (&quot;Agreements&quot;) are legally binding contracts created, executed, and stored electronically. By signing a PROPATI Agreement, parties consent to electronic execution and acknowledge enforceability under the Nigerian Evidence Act and NDPA 2023.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">2. Parties</h2>
              <p className="mt-2 text-muted-foreground">
                Each Agreement identifies the landlord, tenant, agent (if applicable), and PROPATI as the facilitating platform. All parties must be verified before an Agreement may be finalized.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">3. Obligations</h2>
              <p className="mt-2 text-muted-foreground">
                Landlords warrant quiet enjoyment, habitable premises, and full disclosure of material defects. Tenants warrant timely payment of rent and adherence to agreed house rules. Agents warrant accurate representation and disclosure of fees.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">4. Dispute Resolution</h2>
              <p className="mt-2 text-muted-foreground">
                PROPATI provides an in-platform dispute resolution service. If resolution fails, parties agree to arbitration under the Arbitration and Conciliation Act, Cap A18, Laws of the Federation of Nigeria 2004, with Lagos as the seat.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">5. Escrow &amp; Payment Terms</h2>
              <p className="mt-2 text-muted-foreground">
                Security deposits and advance rent are held in escrow via licensed partners. Release triggers include: (a) confirmation of possession by tenant; or (b) resolution of a dispute in favor of the releasing party.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">6. Termination</h2>
              <p className="mt-2 text-muted-foreground">
                Agreements may be terminated by mutual consent, by notice as specified in the Agreement, or by PROPATI in cases of verified fraud, non-payment, or breach of platform terms. Termination does not relieve parties of accrued obligations.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">7. Signatures</h2>
              <p className="mt-2 text-muted-foreground">
                PROPATI accepts biometric, OTP, and digital certificate signatures. Each signature is timestamped and stored as evidence under applicable Nigerian law.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

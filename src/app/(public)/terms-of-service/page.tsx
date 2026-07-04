'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* ================================================================
   TERMS OF SERVICE PAGE — sections: legalHeader, legalBody
   ================================================================ */

const lastUpdated = '1 June 2026';

export default function TermsOfServicePage() {
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
              Terms of Service
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
              <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
              <p className="mt-2 text-muted-foreground">
                By accessing or using the PROPATI platform, you agree to be bound by these Terms of Service and all applicable laws and regulations of the Federal Republic of Nigeria. If you do not agree, please discontinue use.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">2. User Accounts</h2>
              <p className="mt-2 text-muted-foreground">
                You must complete identity verification before accessing certain features. You are responsible for maintaining the confidentiality of your account and for all activities under your account. Notify us immediately of any unauthorized use.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">3. Listing Rules</h2>
              <p className="mt-2 text-muted-foreground">
                All listings must be truthful, accurate, and not misleading. Landlords and agents warrant they have the legal right to lease or sell the property and that all documents are valid and current. False listings may result in suspension and legal action.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">4. Payments &amp; Escrow</h2>
              <p className="mt-2 text-muted-foreground">
                PROPATI facilitates escrow payments through licensed financial partners. Payment release is triggered by mutual confirmation or dispute resolution outcome. Refunds, where applicable, are processed per the signed tenancy agreement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">5. Prohibited Conduct</h2>
              <p className="mt-2 text-muted-foreground">
                Users may not use the platform for fraud, money laundering, solicitation, or any unlawful purpose. Harassment, false reporting, and system manipulation are strictly prohibited and will be referred to law enforcement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">6. Limitation of Liability</h2>
              <p className="mt-2 text-muted-foreground">
                PROPATI is a technology platform and does not guarantee the condition of properties or the behavior of users. We shall not be liable for indirect, incidental, or consequential damages arising from use of the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">7. Governing Law</h2>
              <p className="mt-2 text-muted-foreground">
                These terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved in the courts of Lagos State, Nigeria, unless otherwise agreed by the parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">8. Changes</h2>
              <p className="mt-2 text-muted-foreground">
                We may update these terms from time to time. Material changes will be communicated via email and in-app notification at least 14 days before taking effect.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

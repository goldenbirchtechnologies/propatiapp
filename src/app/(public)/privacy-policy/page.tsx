'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* ================================================================
   PRIVACY POLICY PAGE — sections: legalHeader, legalBody
   ================================================================ */

const lastUpdated = '1 June 2026';

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <div className="space-y-8 text-foreground leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
                <p className="mt-2 text-zinc-500">
                  PROPATI Technologies Limited (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is committed to protecting your personal data in accordance with the Nigerian Data Protection Act (NDPA) 2023. This policy describes how we collect, use, and safeguard your information when you use our platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">2. Data We Collect</h2>
                <p className="mt-2 text-zinc-500">
                  We collect personal information such as your full name, email address, phone number, residential address, government-issued identification, and payment details. We also collect usage data including device identifiers, IP address, and browsing activity for security and analytics purposes.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">3. How We Use Your Data</h2>
                <p className="mt-2 text-zinc-500">
                  Your data is used to create and manage your account, verify your identity, process transactions, deliver customer support, send transactional communications, improve platform safety, and comply with legal obligations.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">4. Data Sharing</h2>
                <p className="mt-2 text-zinc-500">
                  We do not sell your personal data. We share information with trusted service providers including payment processors, identity verification partners, escrow managers, and law enforcement when required by Nigerian law.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">5. Data Security</h2>
                <p className="mt-2 text-zinc-500">
                  We implement role-based access controls, encryption at rest and in transit, audit logging, and regular penetration testing to protect your personal information from unauthorized access, alteration, or disclosure.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">6. Your Rights</h2>
                <p className="mt-2 text-zinc-500">
                  Under NDPA 2023, you have the right to access, correct, delete, or port your data. You may also object to processing or withdraw consent at unknown time by contacting our Data Protection Officer at dpo@propati.ng.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">7. Cookies</h2>
                <p className="mt-2 text-zinc-500">
                  We use essential cookies for authentication and security. Analytics cookies are used with your consent. You may disable non-essential cookies via your browser settings.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">8. Contact</h2>
                <p className="mt-2 text-zinc-500">
                  For privacy inquiries, contact our Data Protection Officer at dpo@propati.ng or by post to 15 Akin Adesola Street, Victoria Island, Lagos, Nigeria.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/[0.08]">
              <Button variant="secondary" className="gap-2">
                Request Data Export
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

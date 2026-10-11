'use client';

import * as React from 'react';

/* ================================================================
   TERMS OF AGREEMENT PAGE — PropatiBox Platform
   Comprehensive legal terms governing use of the platform
   ================================================================ */

const lastUpdated = '10 October 2026';

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
              Terms &amp; Conditions
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
                <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p className="mt-2 text-zinc-500">
                  These Terms and Conditions ("Terms") constitute a legally binding agreement between PropatiBox Technologies Limited ("we", "our", "us", "PropatiBox") and you ("you", "your", "user", or "party") governing your access to and use of the PropatiBox platform, including all related websites, mobile applications, APIs, and services (collectively, the "Platform"). By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">2. About PropatiBox</h2>
                <p className="mt-2 text-zinc-500">
                  PropatiBox is Nigeria's first verified property marketplace. We provide a technology platform that enables property owners (landlords), prospective tenants, real estate agents, and estate managers to list, search, manage, and transact on residential and commercial properties. PropatiBox acts as an intermediary technology platform and is not a party to any transaction between users. We do not own, manage, or physically inspect properties listed on the Platform, except where we conduct verification on behalf of listing owners through our Verification Partners.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">3. Eligibility</h2>
                <p className="mt-2 text-zinc-500">
                  To use the Platform, you must be at least 18 years old and capable of forming a legally binding contract. You must be a resident of Nigeria or accessing properties located in Nigeria. By using the Platform, you represent and warrant that you meet these eligibility requirements. We reserve the right to suspend or terminate your account if you are found to be ineligible.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">4. Account Registration</h2>
                <p className="mt-2 text-zinc-500">
                  To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it current. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. PropatiBox shall not be liable for any loss resulting from your failure to protect your password.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">5. User Roles and Responsibilities</h2>
                <p className="mt-2 text-zinc-500">
                  The Platform assigns roles based on your interaction: <strong>Landlord</strong> (property owners listing properties), <strong>Tenant</strong> (individuals seeking to rent), <strong>Agent</strong> (licensed real estate practitioners), <strong>Estate Manager</strong> (property management professionals), and <strong>Admin</strong> (platform administrators). Each role has distinct permissions and responsibilities as outlined in the role-specific features of the Platform. Users must accurately represent their role and provide supporting documentation when requested.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">6. Property Listings and Accuracy</h2>
                <p className="mt-2 text-zinc-500">
                  Landlords and agents are responsible for providing accurate, truthful, and complete information in their property listings. This includes but is not limited to property location, dimensions, pricing, availability, photographs, amenities, and legal status. PropatiBox reserves the right to verify listing information through third-party verification services and to remove or flag listings that are found to be inaccurate or misleading. We do not guarantee the accuracy of any listing information provided by users.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">7. Five-Layer Verification System</h2>
                <p className="mt-2 text-zinc-500">
                  All properties listed on PropatiBox undergo a mandatory five-layer verification process:
                </p>
                <ol className="mt-2 text-zinc-500 list-decimal list-inside space-y-1">
                  <li><strong>Layer 1 — Registered Ownership:</strong> Confirmation of legal ownership documents (Certificate of Occupancy, Deed of Assignment, etc.)</li>
                  <li><strong>Layer 2 — Physical Address Verification:</strong> Confirmation of property existence and address accuracy</li>
                  <li><strong>Layer 3 — Government Records Check:</strong> Verification against state and federal land registries</li>
                  <li><strong>Layer 4 — Document Verification:</strong> Authentication of physical documents through issuing authorities</li>
                  <li><strong>Layer 5 — NIPOST Address Cross-reference:</strong> Postal address validation through Nigeria Postal Service</li>
                </ol>
                <p className="mt-2 text-zinc-500">
                  While we employ industry-leading verification processes and partner with third-party verification services, PropatiBox does not guarantee that any verified property is free from legal encumbrances, disputes, or defects. Verification confirms the accuracy of information provided, not the absence of latent issues. Users should conduct their own due diligence and obtain independent legal advice before entering any transaction.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">8. Transactions and Payments</h2>
                <p className="mt-2 text-zinc-500">
                  All monetary transactions on the Platform are conducted through our escrow partner, Paystack, in accordance with escrow principles. Funds are held by the payment provider until the completion of the agreed-upon conditions (rental agreement signing, property handover, etc.) before being released to the landlord. PropatiBox charges a service fee for facilitating transactions and managing verification, the amount of which is disclosed prior to completing a transaction.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">9. Stamp Duty and Taxes</h2>
                <p className="mt-2 text-zinc-500">
                  Tenancy agreements governed by PropatiBox are subject to Nigerian Stamp Duties Act (CAP S8, LFN 2004). The applicable rate is 0.78% of the annual rent, with a minimum of ₦500 and zero charge for amounts ≤ ₦10,000. Stamp duty is processed through Remita (SystemSpecs), the official FIRS/GIFMIS gateway. The e-certificate generated by Remita is embedded directly in tenancy agreements signed on the Platform. Tenants are responsible for any taxes, levies, or duties imposed by relevant authorities.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">10. Prohibited Activities</h2>
                <p className="mt-2 text-zinc-500">
                  You agree not to:
                </p>
                <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                  <li>Post fraudulent, false, misleading, or defamatory content</li>
                  <li>Impersonate any person or entity or falsely state your affiliation</li>
                  <li>Use the Platform for any unlawful purpose or in violation of applicable law</li>
                  <li>Sell, resell, or commercialize any Platform content without authorization</li>
                  <li>Attempt to circumvent security features or platform controls</li>
                  <li>Interfere with or disrupt the Platform's functionality</li>
                  <li>Collect or harvest user information without consent</li>
                  <li>Upload malicious software or engage in unauthorized data scraping</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">11. Intellectual Property</h2>
                <p className="mt-2 text-zinc-500">
                  All content, logos, graphics, and intellectual property displayed on the Platform ("Content") are the property of PropatiBox or its licensors and are protected by Nigerian and international copyright, trademark, and other intellectual property laws. You may view and download Content solely for your personal, non-commercial use. Unauthorized use, reproduction, modification, or distribution is prohibited. PropatiBox reserves all rights not expressly granted to you.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">12. Electronic Signatures and Agreements</h2>
                <p className="mt-2 text-zinc-500">
                  The Platform utilizes electronic signature technology for tenancy agreements, offer letters, and other legal documents. By using the electronic signature feature, you consent to conduct transactions electronically and agree that your electronic signature has the same legal effect as a handwritten signature. All signed documents are stored securely and are admissible as evidence under the Nigerian Evidence Act 2011 and the Electronic Transactions Bill (where applicable).
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">13. Dispute Resolution and Governing Law</h2>
                <p className="mt-2 text-zinc-500">
                  These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute, controversy, or claim arising from or in connection with these Terms or the Platform shall first be subject to mediation through PropatiBox's internal dispute resolution process. If mediation is unsuccessful within 14 days, the matter shall be resolved by final and binding arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act (Cap A1, LFN 2004). The arbitration shall be conducted by a single arbitrator and the language of the arbitration shall be English.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">14. Termination</h2>
                <p className="mt-2 text-zinc-500">
                  Either you or PropatiBox may terminate your account and these Terms at any time. Upon termination, we will cease providing the Platform services and will delete your personal information in accordance with our Privacy Policy, subject to retention for legal, regulatory, or accounting purposes. Sections 1, 2, 4, 11 (Intellectual Property), 13 (Governing Law), 14 (Termination), and 15 (Miscellaneous) shall survive termination.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">15. Indemnification</h2>
                <p className="mt-2 text-zinc-500">
                  You agree to indemnify, defend, and hold harmless PropatiBox, its affiliates, officers, directors, employees, agents, partners, and licensors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in any way connected with your access to or use of the Platform, your violation of these Terms, your breach of applicable laws, or your violation of any third-party right.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">16. Limitation of Liability</h2>
                <p className="mt-2 text-zinc-500">
                  To the fullest extent permitted by applicable law, in no event shall PropatiBox, its affiliates, or their respective directors, officers, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, data, or use, arising out of or related to these Terms or your use of the Platform, whether in contract, tort (including negligence), strict liability, or otherwise, even if PropatiBox has been advised of the possibility of such damages. PropatiBox's total cumulative liability for any claim arising from or related to the Platform shall not exceed the amount you paid to PropatiBox in the twelve (12) months immediately preceding the event giving rise to the claim, or ₦10,000 (Ten Thousand Naira), whichever is greater.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">17. Disclaimer of Warranties</h2>
                <p className="mt-2 text-zinc-500">
                  THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. PropatiBox DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND THOSE ARISING BY COURSE OF DEALING OR COURSE OF PERFORMANCE. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED. PropatiBox MAKES NO WARRANTIES OR REPRESENTATIONS REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY LISTING, CONTENT, OR THIRD-PARTY SERVICE.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">18. Third-Party Services and Links</h2>
                <p className="mt-2 text-zinc-500">
                  The Platform may contain links to third-party websites, services, or applications (including but not limited to Paystack, Remita, Cloudinary, Clerk, Supabase, Prembly, Termii, and NIPOST). We do not own, control, or assume responsibility for third-party services. Your interactions with third-party services are solely between you and the third party. We encourage you to read the terms and privacy policies of any third-party services you engage with through the Platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">19. Changes to Terms</h2>
                <p className="mt-2 text-zinc-500">
                  PropatiBox reserves the right, at its sole discretion, to modify or replace these Terms at any time. If we make material changes, we will notify you by posting the updated Terms on the Platform and updating the "Last updated" date. Your continued access to or use of the Platform after those changes constitutes acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">20. Miscellaneous</h2>
                <p className="mt-2 text-zinc-500">
                  <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                    <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and PropatiBox regarding the Platform and supersede all prior agreements.</li>
                    <li><strong>Severability:</strong> If any provision is deemed invalid, the remaining provisions remain in full force.</li>
                    <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver of future enforcement.</li>
                    <li><strong>Assignment:</strong> You may not assign these Terms without our prior written consent. We may assign these Terms without notice to any affiliate or successor.</li>
                    <li><strong>Contact:</strong> For questions about these Terms, contact us at legal@propati.ng or by post to PropatiBox Technologies Limited, 15 Akin Adesola Street, Victoria Island, Lagos, Nigeria.</li>
                  </ul>
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

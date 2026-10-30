'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

/* ================================================================
   COOKIES POLICY PAGE — PropatiBox Platform
   Outlines cookie usage, types, and user controls
   ================================================================ */

const lastUpdated = '10 October 2026';

export default function CookiesPage() {
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
              Cookies Policy
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
                <h2 className="text-xl font-bold text-foreground">1. What Are Cookies</h2>
                <p className="mt-2 text-zinc-500">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help websites remember information about your visit, such as your language preference or login status. Cookies are widely used to make websites function more effectively and to provide information to site owners.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">2. How We Use Cookies</h2>
                <p className="mt-2 text-zinc-500">
                  PropatiBox uses cookies and similar tracking technologies (including web beacons, tags, and scripts) to:
                </p>
                <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                  <li><strong>Authenticate your account</strong> and maintain your login session as you navigate the Platform</li>
                  <li><strong>Remember your preferences</strong> (such as language, theme, and region)</li>
                  <li><strong>Secure the Platform</strong> by detecting suspicious activity and protecting against fraud</li>
                  <li><strong>Analyze Platform performance</strong> and user behavior through analytics services</li>
                  <li><strong>Enable social media features</strong> and sharing functionality</li>
                  <li><strong>Deliver targeted advertising</strong> based on your interests and usage patterns</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">3. Types of Cookies We Use</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Essential Cookies</h3>
                    <p className="mt-1 text-zinc-500">
                      These cookies are strictly necessary for the proper functioning of the Platform. Without them, core features such as login, account security, and transaction processing cannot operate. These cookies cannot be disabled. Examples include session IDs, authentication tokens, and CSRF protection tokens.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Performance Cookies</h3>
                    <p className="mt-1 text-zinc-500">
                      These cookies help us understand how visitors interact with the Platform by collecting anonymous information about page visits, load times, and error messages. We use this data to improve Platform performance and user experience. These cookies are set by our analytics partners (such as Google Analytics and Vercel Analytics).
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Functionality Cookies</h3>
                    <p className="mt-1 text-zinc-500">
                      These cookies remember choices you make to provide enhanced, personalized features. For example, we may use cookies to remember your preferred language, region, or currency.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Targeting / Advertising Cookies</h3>
                    <p className="mt-1 text-zinc-500">
                      These cookies are used by our advertising partners to deliver advertisements that are more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and to measure the effectiveness of advertising campaigns. These cookies are only placed with your consent.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">4. Third-Party Cookies</h2>
                <p className="mt-2 text-zinc-500">
                  The Platform uses services from various third parties that may set their own cookies. These include:
                </p>
                <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                  <li><strong>Clerk</strong> — authentication and user session management</li>
                  <li><strong>Supabase</strong> — database and real-time connectivity</li>
                  <li><strong>Paystack</strong> — payment processing</li>
                  <li><strong>Cloudinary</strong> — image and file optimization</li>
                  <li><strong>Google Analytics / Vercel Analytics</strong> — platform analytics</li>
                  <li><strong>Social media platforms (Meta, X/Twitter, LinkedIn)</strong> — social sharing features</li>
                </ul>
                <p className="mt-2 text-zinc-500">
                  We have no control over cookies placed by third parties. You should review the privacy and cookie policies of these third parties.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">5. Managing Your Cookie Preferences</h2>
                <p className="mt-2 text-zinc-500">
                  You have the right to decide whether to accept or reject cookies. You can set your browser to refuse all or some cookies, or to alert you when cookies are being set. The methods for doing this vary from browser to browser. Please note that if you disable or refuse cookies, you may not be able to access certain features of the Platform, including login, account creation, and transaction processing.
                </p>
                <p className="mt-2 text-zinc-500">
                  For more information on how to manage cookies in your browser, visit:
                </p>
                <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                  <li><a href="https://support.google.com/chrome/answer/9564484" className="underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li><a href="https://help.apple.com/workflow/mac/2.11.8/mac-help/HWME258b1b54d/mac-help-15537/HT201265" className="underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c631-35da-2434e4702f34" className="underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">6. Your Rights Under Nigerian Law</h2>
                <p className="mt-2 text-zinc-500">
                  Under the Nigerian Data Protection Act (NDPA) 2023 and the Nigeria Data Protection Regulation (NDPR), you have the right to:
                </p>
                <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                  <li>Access and obtain a copy of your personal data</li>
                  <li>Request correction of inaccurate personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Withdraw consent at any time (where processing is based on consent)</li>
                  <li>Lodge a complaint with the Nigeria Data Protection Bureau (NDPB)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">7. Cookie Retention</h2>
                <p className="mt-2 text-zinc-500">
                  Cookies are stored on your device for different periods depending on their type:
                </p>
                <ul className="mt-2 text-zinc-500 list-disc list-inside space-y-1">
                  <li><strong>Session cookies</strong> — deleted automatically when you close your browser</li>
                  <li><strong>Persistent cookies</strong> — remain on your device for a set period (ranging from a few days to 2 years)</li>
                  <li><strong>Essential cookies</strong> — retained as long as necessary to provide the Platform's core functionality</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">8. Updates to This Cookies Policy</h2>
                <p className="mt-2 text-zinc-500">
                  We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we do, we will revise the "Last updated" date at the top of this page. We encourage you to review this page periodically for the latest information.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">9. Contact Us</h2>
                <p className="mt-2 text-zinc-500">
                  If you have any questions about this Cookies Policy or how we use cookies, please contact our Data Protection Officer:
                </p>
                <p className="mt-2 text-zinc-500">
                  Email: <a href="mailto:dpo@propati.ng" className="underline">dpo@propati.ng</a>
                  <br />
                  Post: PropatiBox Technologies Limited, 15 Akin Adesola Street, Victoria Island, Lagos, Nigeria
                </p>
              </div>

            </div>

            <div className="mt-10 pt-8 border-t border-border">
              <Button variant="secondary" className="gap-2" onClick={() => window.location.assign('/privacy-policy')}>
                Read Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

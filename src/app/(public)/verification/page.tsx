'use client';

import Link from 'next/link';

export default function VerificationPage() {
  const phases = [
    {
      num: '01',
      title: 'Document Review',
      id: 'docs',
      desc: 'The foundation of unknown safe transaction starts with paper. We verify the Certificate of Occupancy (C of O) and Governor\'s Consent to ensure the seller has the legal right to transfer ownership.',
      checks: [
        { icon: 'check_circle', title: 'C of O Authenticity', desc: 'Cross-referencing unique file numbers with state records.' },
        { icon: 'check_circle', title: "Governor's Consent Validation", desc: 'Confirming the validity of previous transfers.' },
      ],
      visual: (
        <div className="bg-surface-container-high p-6 rounded-xl shadow-sm border border-outline-variant relative overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4 hover:translate-x-2 transition-transform">
              <MaterialIcon name="article" className="material-symbols-outlined" />
              <div>
                <div className="font-medium text-primary">Deed of Assignment</div>
                <div className="text-xs text-muted-foreground">STATUS: PENDING REVIEW</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4 hover:translate-x-4 transition-transform">
              <MaterialIcon name="receipt_long" className="material-symbols-outlined" />
              <div>
                <div className="font-medium text-primary">Survey Plan</div>
                <div className="text-xs text-muted-foreground">STATUS: MATCHED</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-on-tertiary-container flex items-center gap-4 hover:translate-x-6 transition-transform">
              <MaterialIcon name="verified" className="material-symbols-outlined" />
              <div>
                <div className="font-medium text-primary">Certificate of Occupancy</div>
                <div className="text-xs text-on-tertiary-container font-bold">VERIFIED AUTHENTIC</div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 opacity-10">
            <MaterialIcon name="description" className="material-symbols-outlined" />
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Identity Verification',
      desc: 'Fraud often hides behind a smile. We verify the legal status of landlords and agents through NIMC biometric checks and Corporate Affairs Commission (CAC) registry lookups.',
      subs: [
        { label: 'NIMC CONNECTED', text: 'Real-time NIN verification to confirm the identity of the titleholder.' },
        { label: 'CAC INTEGRATED', text: 'Validating company registration for corporate-owned developments.' },
      ],
      visual: (
        <div className="w-full max-w-sm mx-auto">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-muted" />
        </div>
      ),
    },
    {
      num: '03',
      title: 'Site Inspection',
      id: 'inspection',
      desc: 'What is on paper must exist on the ground. Our physical verification experts visit the site to check boundaries, assess structural integrity, and conduct discreet inquiries regarding local \'Omonile\' (community) status.',
      checks: [
        { icon: 'location_on', title: 'GPS Coordinate Validation' },
        { icon: 'apartment', title: 'Structural Integrity Audit' },
        { icon: 'groups', title: 'Local Community Liaison' },
      ],
      visual: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl bg-muted" />
            <div className="p-4 bg-surface-container rounded-xl border border-outline-variant">
              <MaterialIcon name="explore" className="material-symbols-outlined" />
              <p className="font-medium text-primary mt-2 text-sm">Boundary Matching</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-secondary text-on-secondary rounded-xl">
              <MaterialIcon name="warning" className="material-symbols-outlined" />
              <p className="font-medium mt-2 text-sm">Omonile Risk Check</p>
            </div>
            <div className="aspect-[3/4] rounded-2xl bg-muted" />
          </div>
        </div>
      ),
    },
    {
      num: '04',
      title: 'Legal & Title Search',
      id: 'legal',
      desc: 'Our legal team performs a deep-dive search at the Land Registry (e.g., Alausa, Lagos). We verify if the property is under government acquisition or subject to existing litigation.',
      visual: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-highest rounded-2xl p-6 flex flex-col justify-between border border-outline-variant">
            <div>
              <h3 className="font-heading font-bold text-primary mb-2">Land Registry Search</h3>
              <p className="text-sm text-muted-foreground">We manually verify the status of the title in state records.</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <MaterialIcon name="gavel" className="material-symbols-outlined" />
              <div className="px-4 py-2 bg-white rounded-full text-xs font-medium shadow-sm">SEARCHING: ALAUSA REGISTRY</div>
            </div>
          </div>
          <div className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col justify-center text-center border border-outline-variant">
            <MaterialIcon name="policy" className="material-symbols-outlined" />
            <h3 className="font-heading font-bold mb-2">Government Acquisition Check</h3>
            <p className="text-sm opacity-70">Ensuring the land isn\'t designated for public projects.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 flex items-center gap-4 border border-outline-variant">
            <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center shrink-0">
              <MaterialIcon name="report_problem" className="material-symbols-outlined" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-primary text-sm">Litigation Audit</h4>
              <p className="text-xs text-muted-foreground">Checking for court cases or probate disputes.</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-2xl p-6 flex items-center gap-4 border border-outline-variant">
            <div className="hidden sm:block w-24 h-16 rounded-lg bg-muted" />
            <div>
              <h4 className="font-heading font-bold text-primary text-sm">Zoning Verification</h4>
              <p className="text-xs text-muted-foreground">Confirming the plot is zoned for your intended use.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background shadow-sm border-b border-outline-variant h-[72px] flex justify-between items-center px-4 md:px-8">
        <div className="font-heading font-extrabold text-xl text-primary">VeriProp Nigeria</div>
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Marketplace</Link>
          <Link href="#" className="text-sm font-bold text-secondary border-b-2 border-secondary">Verification Guide</Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">About Us</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center justify-center px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="md:hidden text-primary">
            <MaterialIcon name="menu" className="material-symbols-outlined" />
          </button>
        </div>
      </header>

      <div className="pt-[72px] flex flex-col lg:flex-row max-w-[1440px] mx-auto min-h-screen">
        {/* Side Nav - Desktop */}
        <aside className="hidden lg:flex flex-col border-r border-outline-variant w-64 sticky top-[72px] h-[calc(100vh-72px)] bg-surface-container-low p-6 overflow-y-auto">
          <div className="mb-8 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <MaterialIcon name="shield_person" className="material-symbols-outlined" />
              <h3 className="font-heading font-bold text-primary">Verification Steps</h3>
            </div>
            <p className="text-sm text-muted-foreground">Phase 1: Due Diligence</p>
          </div>
          <nav className="flex flex-col gap-1 mb-8">
            {phases.map((phase) => (
              <Link
                key={phase.id || phase.num}
                href={`#${phase.id || phase.num}`}
                className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-surface-container-highest"
              >
                {phase.num === '01' ? <MaterialIcon name="info" className="material-symbols-outlined text-[20px]" /> : phase.num === '02' ? <MaterialIcon name="description" className="material-symbols-outlined text-[20px]" /> : phase.num === '03' ? <MaterialIcon name="visibility" className="material-symbols-outlined text-[20px]" /> : phase.num === '04' ? <MaterialIcon name="gavel" className="material-symbols-outlined text-[20px]" /> : null}
                <span className="text-sm font-medium">{phase.title}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <button className="w-full py-3 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center gap-2 hover:brightness-95 transition-all">
              <MaterialIcon name="download" className="material-symbols-outlined" />
              Download Checklist
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full bg-surface">
          {/* Hero Header */}
          <section className="relative bg-primary text-on-primary overflow-hidden px-4 md:px-8 py-16 md:py-24" id="intro">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full mb-6">
                <MaterialIcon name="verified_user" className="material-symbols-outlined" />
                <span className="text-xs font-medium uppercase tracking-widest text-on-primary">Trusted Authority</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-6 leading-tight">
                The Definitive Guide to Property Verification in Nigeria
              </h1>
              <p className="text-lg text-on-primary-container max-w-2xl leading-relaxed">
                Master the 5-layer process that secures your investment and eliminates fraud. Navigating Nigeria's real estate market requires more than just capital—it requires verified certainty.
              </p>
            </div>
          </section>

          {/* Guide Phases */}
          <div className="px-4 md:px-8 py-16 space-y-24">
            {phases.map((phase) => (
              <section key={phase.num} id={phase.id || phase.num} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-12 h-12 flex items-center justify-center bg-surface-container-high rounded-full font-heading font-bold text-primary text-lg">
                      {phase.num}
                    </span>
                    <h2 className="font-heading font-bold text-2xl text-primary">{phase.title}</h2>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">{phase.desc}</p>
                  {phase.checks && (
                    <ul className="space-y-4">
                      {phase.checks.map((check, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <MaterialIcon name={check.icon} className="material-symbols-outlined" />
                          <div>
                            <h4 className="font-heading font-bold text-primary text-base">{check.title}</h4>
                            {check.desc && <p className="text-sm text-muted-foreground">{check.desc}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {phase.subs && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {phase.subs.map((sub, i) => (
                        <div key={i} className="p-4 bg-primary-container/5 rounded-xl border border-outline-variant">
                          <span className="text-xs font-bold text-secondary-fixed uppercase tracking-wider">{sub.label}</span>
                          <p className="text-sm text-muted-foreground mt-2">{sub.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>{phase.visual}</div>
              </section>
            ))}
          </div>

          {/* Final Clearance CTA */}
          <section className="relative px-4 md:px-8 pb-24">
            <div className="max-w-4xl mx-auto text-center glass-card rounded-[40px] border-2 border-on-tertiary-container shadow-2xl relative p-8 md:p-16">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 bg-on-tertiary-container rounded-full flex items-center justify-center shadow-lg border-8 border-surface">
                  <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <div className="mt-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-container-high rounded-full font-heading font-bold text-primary mb-4">04</div>
                <h2 className="font-heading font-bold text-2xl text-primary mb-4">Final Clearance</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Only properties that pass every single checkpoint receive the VeriProp \'Verified\' Seal. This seal is our guarantee of a safe, legal, and hassle-free transaction.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/verification/start" className="px-8 py-3 bg-primary text-on-primary rounded-xl font-medium hover:brightness-110 transition-all shadow-md active:scale-95">
                    Start Your Verification Now
                  </Link>
                  <Link href="#" className="px-8 py-3 bg-white text-primary border border-primary rounded-xl font-medium hover:bg-surface-container-low transition-all">
                    View Sample Report
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-16 px-4 md:px-8 bg-primary text-on-primary mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-heading font-bold text-xl text-on-primary mb-4">VeriProp Nigeria</div>
            <p className="text-sm text-on-primary-container/80 mb-6">The most trusted digital layer for Nigeria's real estate marketplace. Eliminating fraud, one property at a time.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">About Us</Link>
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Pricing</Link>
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Marketplace</Link>
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Help Center</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Terms of Service</Link>
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Legal Disclaimer</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Verify an Agent</Link>
              <Link href="#" className="text-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors">Contact Support</Link>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-primary-container/60">&copy; {new Date().getFullYear()} VeriProp Nigeria. All rights reserved.</p>
          <div className="flex gap-4">
            <MaterialIcon name="public" className="material-symbols-outlined" />
            <MaterialIcon name="chat" className="material-symbols-outlined" />
            <MaterialIcon name="language" className="material-symbols-outlined" />
          </div>
        </div>
      </footer>
    </div>
  );
}

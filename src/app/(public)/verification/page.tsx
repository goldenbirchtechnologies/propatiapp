'use client';

import Link from 'next/link';

export default function VerificationPage() {
  const phases = [
    {
      num: '01',
      title: 'Document Review',
      id: 'docs',
      desc: 'The foundation of any safe transaction starts with paper. We verify the Certificate of Occupancy (C of O) and Governor\'s Consent to ensure the seller has the legal right to transfer ownership.',
      checks: [
        { icon: 'check_circle', title: 'C of O Authenticity', desc: 'Cross-referencing unique file numbers with state records.' },
        { icon: 'check_circle', title: "Governor's Consent Validation", desc: 'Confirming the validity of previous transfers.' },
      ],
      visual: (
        <div className="bg-surface-container-high p-6 rounded-xl shadow-sm border border-outline-variant relative overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4 hover:translate-x-2 transition-transform">
              <span className="material-symbols-outlined text-primary text-[32px]">article</span>
              <div>
                <div className="font-medium text-primary">Deed of Assignment</div>
                <div className="text-xs text-muted-foreground">STATUS: PENDING REVIEW</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4 hover:translate-x-4 transition-transform">
              <span className="material-symbols-outlined text-primary text-[32px]">receipt_long</span>
              <div>
                <div className="font-medium text-primary">Survey Plan</div>
                <div className="text-xs text-muted-foreground">STATUS: MATCHED</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-on-tertiary-container flex items-center gap-4 hover:translate-x-6 transition-transform">
              <span className="material-symbols-outlined text-on-tertiary-container text-[32px]">verified</span>
              <div>
                <div className="font-medium text-primary">Certificate of Occupancy</div>
                <div className="text-xs text-on-tertiary-container font-bold">VERIFIED AUTHENTIC</div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 opacity-10">
            <span className="material-symbols-outlined text-[160px] text-primary">description</span>
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
              <span className="material-symbols-outlined text-secondary">explore</span>
              <p className="font-medium text-primary mt-2 text-sm">Boundary Matching</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-secondary text-on-secondary rounded-xl">
              <span className="material-symbols-outlined">warning</span>
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
              <span className="material-symbols-outlined text-primary text-[48px] opacity-40">gavel</span>
              <div className="px-4 py-2 bg-white rounded-full text-xs font-medium shadow-sm">SEARCHING: ALAUSA REGISTRY</div>
            </div>
          </div>
          <div className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col justify-center text-center border border-outline-variant">
            <span className="material-symbols-outlined text-[64px] text-on-tertiary-container mb-4">policy</span>
            <h3 className="font-heading font-bold mb-2">Government Acquisition Check</h3>
            <p className="text-sm opacity-70">Ensuring the land isn\'t designated for public projects.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 flex items-center gap-4 border border-outline-variant">
            <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">report_problem</span>
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
          {/* Top Navigation */}
      <div className="pt-[72px] flex flex-col lg:flex-row max-w-[1440px] mx-auto min-h-screen">
        {/* Side Nav - Desktop */}
        <aside className="hidden lg:flex flex-col border-r border-outline-variant w-64 sticky top-[72px] h-[calc(100vh-72px)] bg-surface-container-low p-6 overflow-y-auto">
          <div className="mb-8 pt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[32px]">shield_person</span>
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
                <span className="material-symbols-outlined text-[20px]">
                  {phase.num === '01' && 'info'}
                  {phase.num === '02' && 'description'}
                  {phase.num === '03' && 'visibility'}
                  {phase.num === '04' && 'gavel'}
                </span>
                <span className="text-sm font-medium">{phase.title}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <button className="w-full py-3 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center gap-2 hover:brightness-95 transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
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
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
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
                          <span className="material-symbols-outlined text-on-tertiary-container mt-1">{check.icon}</span>
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
  );
}

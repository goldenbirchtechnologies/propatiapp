'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Star, MapPin, ShieldCheck, Building2, Landmark,
  Shield, DollarSign, FileCheck, Users, Heart, Award,
  MessageCircle, Phone, Mail, ChevronDown, ArrowRight, CheckCircle2, Lock,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';

// ---------------------------------------------------------------------------
// Types + mock data (Nigerian context, 6 cards matching Stitch inventory)
// ---------------------------------------------------------------------------
interface AgentResult {
  id: string;
  name: string;
  title: string;
  company: string;
  area: string;
  photo: string;
  rating: number;
  reviewCount: number;
  teamPriceRange: string;
  salesLabel: string;
  salesCount: number;
  teamSales: number;
  badges: string[];
  isTopAgent?: boolean;
}

const mockAgents: AgentResult[] = [
  {
    id: '1',
    name: 'Matt Laricy & Associates',
    title: 'Principal Broker & NIESV Fellow',
    company: 'Eko Prestige Realty Ltd.',
    area: 'Victoria Island & Ikoyi, Lagos',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    rating: 5.0, reviewCount: 2022,
    teamPriceRange: '₦45M – ₦850M', salesLabel: '572 verified leases & closings', salesCount: 572, teamSales: 5920,
    badges: ['LASRERA Licensed'], isTopAgent: true,
  },
  {
    id: '2',
    name: 'Patrick Shino Partners',
    title: 'Senior Commercial Surveyor',
    company: 'Horizon Crest Properties & Co.',
    area: 'Lekki Phase 1 & Ikate, Lagos',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    rating: 5.0, reviewCount: 1323,
    teamPriceRange: '₦120M – ₦2.7B', salesLabel: '142 corporate lease transactions', salesCount: 142, teamSales: 659,
    badges: ['CAC Corporate Vetted', 'FIRS Stamp Duty CAP S8'], isTopAgent: true,
  },
  {
    id: '3',
    name: 'Sam B. Shaffer & Co.',
    title: 'Managing Partner & AGIS Specialist',
    company: 'Capital Meridian Advisory Group',
    area: 'Maitama & Asokoro, Abuja FCT',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    rating: 5.0, reviewCount: 895,
    teamPriceRange: '₦150M – ₦5.5B', salesLabel: '142 statutory title conveyances', salesCount: 142, teamSales: 2040,
    badges: ['AGIS Title Verified', 'FCT Cadastral Clearance'], isTopAgent: true,
  },
  {
    id: '4',
    name: 'Vesta Preferred Realty',
    title: 'Corporate Leasing Syndicate',
    company: 'Prime Heritage Estates Consortium',
    area: 'Ikeja GRA & Maryland, Lagos',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    rating: 5.0, reviewCount: 908,
    teamPriceRange: '₦75M – ₦3.1B', salesLabel: '747 verified estate closures', salesCount: 747, teamSales: 3362,
    badges: ['LASRERA Licensed', 'NDPA 2023 Compliant'], isTopAgent: true,
  },
  {
    id: '5',
    name: 'Bari Levine Bruszer',
    title: 'Executive Industrial Broker',
    company: 'Westland Maritime Properties Ltd.',
    area: 'GRA Phase 2 & Trans-Amadi, Port Harcourt',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    rating: 5.0, reviewCount: 576,
    teamPriceRange: '₦115M – ₦4.2B', salesLabel: '114 verified industrial transactions', salesCount: 114, teamSales: 2059,
    badges: ['Industrial Title Audit'], isTopAgent: true,
  },
  {
    id: '6',
    name: 'Concierge Match',
    title: 'PropatiBox Advisory Desk — Bespoke',
    company: 'Institutional Placement',
    area: 'All jurisdictions',
    photo: '',
    rating: 5.0, reviewCount: 0,
    teamPriceRange: 'Portfolio — bespoke', salesLabel: 'Concierge placement', salesCount: 0, teamSales: 0,
    badges: [], isTopAgent: false,
  },
];

const faqs = [
  {
    q: 'How does PropatiBox verify real estate agents and surveyors?',
    a: 'Every agent and brokerage undergoes multi-tiered verification: confirmation of registration with the Nigerian Institution of Estate Surveyors and Valuers (NIESV) or statutory state bodies such as LASRERA. We audit CAC incorporation records, execute physical office audits, and confirm biometric director credentials to eradicate fraudulent ghost agencies.',
  },
  {
    q: 'Why is escrow protection mandatory when dealing with agents?',
    a: 'Escrow protection eliminates the systemic risk of cautionary deposit diversion and unauthorized subletting syndicates. Cautionary deposits, initial rents, and legal fees are held by CBN-licensed trustee partner banks and disbursed only after physical handover, key issuance, and digital lease execution on PropatiBox.',
  },
  {
    q: 'How do I inspect a property safely with an accredited agent?',
    a: 'All viewings are scheduled via PropatiBox with unique QR access verification. Accredited agents must accompany prospects with validated ID badges. PropatiBox prohibits informal registration or mobilization fees before viewings — any demand for unofficial cash fees results in automatic broker sanction.',
  },
  {
    q: 'How are client reviews and closing track records audited?',
    a: 'Unlike informal social channels where testimonials are easily falsified, reviews on PropatiBox can only be generated by tenants, corporate lessees, or property purchasers who completed verified transactions through our escrow clearing engine.',
  },
];

const filterOptions = ['All Verified', 'NIESV Certified', 'Lagos State (LASRERA)', 'Abuja FCT (AGIS)'] as const;

export default function FindAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState('');
  const [filter, setFilter] = useState<typeof filterOptions[number]>('All Verified');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'location' | 'name'>('location');

  useEffect(() => {
    const loc = searchParams.get('location') || searchParams.get('q');
    if (loc) setLocation(loc);
  }, [searchParams]);

  const results = (() => {
    const q = location.toLowerCase().trim();
    let list = q
      ? mockAgents.filter(a => `${a.name} ${a.company} ${a.area} ${a.title}`.toLowerCase().includes(q))
      : mockAgents;
    if (filter !== 'All Verified' && filter !== 'NIESV Certified') {
      const needle = filter.includes('Lagos') ? 'lagos' : filter.includes('Abuja') ? 'abuja' : '';
      if (needle) list = list.filter(a => a.area.toLowerCase().includes(needle));
    }
    return list;
  })();

  const handleSearch = () => {
    if (location) router.push(`?location=${encodeURIComponent(location)}`, { scroll: false });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero — Stitch layout, bichrome */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002113] via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0, 108, 73,0.10),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10 md:pt-14 md:pb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-[#4edea3]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Certified NIESV &amp; ERCAHN Network
            <span className="text-white/20">•</span>
            <span className="text-white/70">LASRERA Regulated</span>
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground tracking-tight max-w-3xl">
            A great agent makes{' '}
            <span className="text-[#4edea3]">all the difference</span>.
          </h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Connect with vetted, licensed estate surveyors and corporate property brokers across Nigeria. Backed by C&nbsp;of&nbsp;O verification audits, biometric identity vetting, and bank-held escrow custody.
          </p>

          {/* Search console — glass-card */}
          <div className="mt-6 max-w-4xl glass-card p-4 md:p-5">
            <div className="flex items-center gap-6 pb-3 border-b border-border text-xs font-semibold">
              <button
                onClick={() => setActiveTab('location')}
                className={`inline-flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${activeTab === 'location' ? 'text-[#4edea3] border-primary' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                Location / Jurisdiction
              </button>
              <button
                onClick={() => setActiveTab('name')}
                className={`inline-flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${activeTab === 'name' ? 'text-[#4edea3] border-primary' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                Agent / Firm Name
              </button>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-2 bg-card/40 rounded-xl p-1.5 border border-border">
              <div className="flex items-center flex-1 gap-2 px-3 py-2 rounded-lg bg-card/40">
                <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-zinc-600 focus:outline-none"
                  placeholder={activeTab === 'location' ? 'City, neighborhood, or jurisdiction (e.g., Victoria Island, Ikoyi, Maitama)' : 'Agent or firm name'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="shrink-0 gap-2">
                <Search className="h-4 w-4" /> Search Agents
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Quick Filters:</span>
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                    filter === f ? 'bg-primary text-black border-primary' : 'bg-card text-zinc-400 border-border hover:text-foreground hover:border-border'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, label: 'Escrow Volume Protected', value: '₦12.4B+', badge: 'CBN Trustee' },
              { icon: Shield, label: 'Zero Arrears', value: '0', badge: 'Zero Arrears' },
              { icon: Landmark, label: 'Verified Jurisdictions', value: '18 States+', badge: 'NIESV Cadre' },
              { icon: Award, label: 'Caution Disputes', value: '0', badge: 'Escrow Protected' },
            ].map((m) => (
              <div key={m.label} className="glass-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[#4edea3] shrink-0">
                  <m.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-foreground">{m.value}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-[#4edea3] border border-primary/20">{m.badge}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
            <div>
              <SectionLabel>Accredited network</SectionLabel>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">Verified Estate Surveyors &amp; Brokers</h2>
              <p className="mt-1 text-sm text-zinc-500">Showing {results.length} accredited partners — filtered from your search.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 hidden sm:inline">Sort: Consideration</span>
              <span className="text-zinc-600"><ChevronDown className="h-4 w-4" /></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {results.map((agent) => (
              agent.id === '6' ? (
                <div key={agent.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002113] via-[var(--sovereign-hover)]/40 to-black border border-primary/20 p-6 flex flex-col justify-between min-h-[280px]">
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-border flex items-center justify-center text-foreground shrink-0">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">PropatiBox Concierge Desk</p>
                      <h3 className="text-lg font-bold text-foreground">Get institutional agent placement</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                    Need bespoke representation for commercial portfolios, diplomatic leasing, or multi-hectare acquisitions? Our Senior Advisory Desk pairs you with a Premier Accredited Broker.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/10 border border-border px-3 py-2 text-xs text-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#4edea3]" /> Zero illegal fees</div>
                    <div className="rounded-lg bg-white/10 border border-border px-3 py-2 text-xs text-foreground flex items-center gap-2"><Lock className="h-4 w-4 text-[#4edea3]" /> Trustee Escrow</div>
                  </div>
                  <Button className="mt-5 w-full gap-2" asChild>
                    <Link href="/contact-us">Connect with a local agent <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              ) : (
                <div key={agent.id} className="glass-card p-5 hover:border-primary/20 transition-colors flex flex-col">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img src={agent.photo} alt={agent.name} className="w-20 h-20 rounded-xl object-cover border border-border" />
                      {agent.isTopAgent && (
                        <span className="absolute -bottom-1.5 -right-1.5 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                          <ShieldCheck className="h-3 w-3" /> Top
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{agent.title}</p>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-foreground">{agent.rating.toFixed(1)}</span>
                          <span className="text-zinc-500">({agent.reviewCount.toLocaleString()})</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground truncate mt-0.5">{agent.name}</h3>
                      <p className="text-xs text-zinc-400">{agent.company}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3 w-3 shrink-0" />{agent.area}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-card border border-border px-3 py-2.5 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500">Transaction Consideration</p>
                      <p className="text-sm font-bold text-foreground">{agent.teamPriceRange} range</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500">12-Mo. Proven</p>
                      <p className="text-xs font-semibold text-[#4edea3]">{agent.salesLabel}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {agent.badges.map((b) => (
                      <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-xs text-zinc-300">
                        <FileCheck className="h-3 w-3 text-[#4edea3]" /> {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-border">
                    <p className="text-xs text-zinc-500">{agent.teamSales.toLocaleString()} lifetime closings</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-border text-white hover:bg-white/10" asChild>
                        <Link href="/contact-us">Inquire</Link>
                      </Button>
                      <Button size="sm" asChild><Link href="/listings">View Profile</Link></Button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page editorial callout */}
      <section className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-xs font-semibold text-[#4edea3] w-fit">
                <ShieldCheck className="h-3.5 w-3.5" /> Direct Broker Pairing
              </span>
              <h2 className="mt-3 text-2xl font-bold text-foreground">Get help finding an accredited agent</h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                We will pair you with a PropatiBox Premier Agent who has the verified inside track on prime inventory, title validity, and institutional lease structures.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild className="gap-2">
                  <Link href="/contact-us">Connect with a local agent <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <span className="text-xs text-zinc-500">No advance inspection surcharges</span>
              </div>
            </div>
            <div className="w-full lg:w-5/12 min-h-[260px] bg-gradient-to-br from-[var(--sovereign-hover)]/30 via-zinc-900 to-black relative overflow-hidden flex items-center justify-center border-t lg:border-t-0 lg:border-l border-border">
              <Building2 className="h-24 w-24 text-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <SectionLabel>Due Diligence &amp; Safety</SectionLabel>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">Frequently asked questions</h2>
            <p className="mt-2 text-sm text-zinc-500">Understanding agency accreditation, escrow custody, and legal fiduciary representation under Nigerian tenancy laws.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={f.q} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-border pt-3">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Broker Enterprise Network */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-[var(--sovereign-hover)] to-primary p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-foreground text-xs font-semibold">
                Broker Enterprise Network
              </span>
              <h2 className="mt-3 text-xl md:text-2xl font-bold text-foreground">Are you a licensed estate surveyor or verified broker?</h2>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Join Nigeria&apos;s premier institutional property network. Access corporate lease mandates, automated FIRS Stamp Duty electronic remittances, and escrow-guaranteed agency fee disbursement on closing.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
              <Button variant="secondary" className="bg-white text-[var(--sovereign-hover)] hover:bg-zinc-100" asChild>
                <Link href="/contact-us">Apply for Accreditation</Link>
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-border" asChild>
                <Link href="/verification">Download Broker Playbook</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Jurisdiction ledger */}
      <section className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Verified Lagos Surveyors</h4>
              <ul className="space-y-1.5 text-zinc-400">
                <li><Link href="/find-agent?location=Victoria+Island" className="hover:text-[#4edea3]">Victoria Island Real Estate Brokers</Link></li>
                <li><Link href="/find-agent?location=Ikoyi" className="hover:text-[#4edea3]">Ikoyi Prime Property Consultants</Link></li>
                <li><Link href="/find-agent?location=Lekki" className="hover:text-[#4edea3]">Lekki Phase 1 Commercial Surveyors</Link></li>
                <li><Link href="/find-agent?location=Ikeja" className="hover:text-[#4edea3]">Ikeja GRA Corporate Leasing Agents</Link></li>
                <li><Link href="/find-agent" className="text-[#4edea3] font-semibold">+ Explore 28 Lagos Districts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Verified Abuja FCT Brokers</h4>
              <ul className="space-y-1.5 text-zinc-400">
                <li><Link href="/find-agent?location=Maitama" className="hover:text-[#4edea3]">Maitama Diplomatic Property Desk</Link></li>
                <li><Link href="/find-agent?location=Asokoro" className="hover:text-[#4edea3]">Asokoro Estate Advisors</Link></li>
                <li><Link href="/find-agent?location=Wuse" className="hover:text-[#4edea3]">Wuse II Commercial Agency Group</Link></li>
                <li><Link href="/find-agent?location=Guzape" className="hover:text-[#4edea3]">Guzape Cadastral Zone Specialists</Link></li>
                <li><Link href="/find-agent" className="text-[#4edea3] font-semibold">+ Explore 16 FCT Zones</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Regional Hubs &amp; Industrial</h4>
              <ul className="space-y-1.5 text-zinc-400">
                <li><Link href="/find-agent?location=Port+Harcourt" className="hover:text-[#4edea3]">Port Harcourt GRA Phase 2 Brokers</Link></li>
                <li><Link href="/find-agent?location=Trans-Amadi" className="hover:text-[#4edea3]">Trans-Amadi Industrial Surveyors</Link></li>
                <li><Link href="/find-agent?location=Ibadan" className="hover:text-[#4edea3]">Ibadan Bodija Residential Advisors</Link></li>
                <li><Link href="/find-agent?location=Enugu" className="hover:text-[#4edea3]">Enugu Independence Layout Partners</Link></li>
                <li><Link href="/find-agent" className="text-[#4edea3] font-semibold">+ View Nationwide Cadre</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

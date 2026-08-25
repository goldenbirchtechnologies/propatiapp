import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle, ArrowRight, Shield, Star, TrendingUp, Users, Building2, Zap } from "lucide-react";
import { listings, stats, testimonials } from "../../data/mock";
import { PropertyCard, SectionLabel, StarRating } from "../../components/ui";

const howItWorks = [
  {
    step: "01",
    title: "Browse Verified Listings",
    description: "Every listing on PROPATI is verified by our team. View real photos, confirmed locations, and authenticated ownership.",
    icon: Shield,
  },
  {
    step: "02",
    title: "Apply & Screen Instantly",
    description: "Submit your application with a verified profile. Landlords can screen tenants using credit, identity, and employment checks.",
    icon: Users,
  },
  {
    step: "03",
    title: "Sign & Move In",
    description: "Digital agreements, escrow-protected payments, and a dedicated support team guide you through closing day.",
    icon: CheckCircle,
  },
];

const trustItems = [
  { icon: Shield, label: "Document Verification", desc: "Every property and landlord verified by our compliance team" },
  { icon: Zap, label: "Instant Matching", desc: "AI-powered matching connects tenants with the right properties" },
  { icon: TrendingUp, label: "Market Intelligence", desc: "Real-time pricing data for 12 Nigerian cities" },
  { icon: Building2, label: "50,000+ Properties", desc: "The largest verified property database in Nigeria" },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("rent");

  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&h=900&fit=crop&auto=format"
            alt="Lagos skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-6">
              <SectionLabel>
                <CheckCircle size={11} className="text-emerald-400" />
                Nigeria's First Verified Property Marketplace
              </SectionLabel>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
              Find your{" "}
              <span className="text-emerald-400">verified</span>{" "}
              home in Lagos.
            </h1>

            <p className="text-lg sm:text-xl text-zinc-300 mb-10 max-w-2xl leading-relaxed">
              Every listing verified. Every landlord authenticated. Every payment protected.
              Stop viewing fake listings and start finding real homes.
            </p>

            {/* Search widget */}
            <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              {/* Type tabs */}
              <div className="flex gap-1 p-1 mb-3">
                {["rent", "buy", "shortlet", "commercial"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-lg capitalize transition-colors ${
                      activeType === t ? "bg-emerald-500 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by location, property type, or keyword…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-emerald-500"
                />
                <Link
                  to="/listings"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span>Search</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="text-emerald-400 font-bold text-lg">{s.value}</span>
                  <span className="text-zinc-500 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/[0.06] bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{item.label}</div>
                  <div className="text-zinc-600 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-4xl lg:text-5xl font-black text-white mt-4 tracking-tight">
              Renting reimagined
            </h2>
            <p className="text-zinc-500 mt-3 max-w-xl mx-auto">
              From search to keys in hand — a seamless, transparent process built for Nigeria.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="glass-card p-8 relative overflow-hidden hover:border-white/15 transition-colors">
                <div className="text-[80px] font-black text-white/[0.04] absolute -top-4 -right-2 leading-none select-none">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <item.icon size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-24 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel>Featured Properties</SectionLabel>
              <h2 className="text-3xl lg:text-4xl font-black text-white mt-3 tracking-tight">
                Premium verified listings
              </h2>
            </div>
            <Link
              to="/listings"
              className="hidden sm:flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all listings <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.slice(0, 6).map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`}>
                <PropertyCard listing={listing} />
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/10 text-white text-sm font-medium rounded-xl hover:border-white/20 transition-colors"
            >
              Browse all 50,000+ listings <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Roles CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <SectionLabel>Built for everyone</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-black text-white mt-3 tracking-tight">
              Your role, your dashboard
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: "Landlord", desc: "Manage properties, collect rent, screen tenants", path: "/dashboard/landlord", color: "#10b981" },
              { role: "Tenant", desc: "Find verified homes, pay rent, submit maintenance", path: "/dashboard/tenant", color: "#3b82f6" },
              { role: "Agent", desc: "List properties, close deals, track commissions", path: "/dashboard/agent", color: "#8b5cf6" },
              { role: "Estate Manager", desc: "Portfolio analytics, unit management, team ops", path: "/dashboard/estate-manager", color: "#f59e0b" },
            ].map((card) => (
              <Link
                key={card.role}
                to={card.path}
                className="glass-card p-6 hover:border-white/20 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: `${card.color}18` }}
                >
                  <Building2 size={18} style={{ color: card.color }} />
                </div>
                <h3 className="text-white font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                  {card.role}
                </h3>
                <p className="text-zinc-600 text-xs leading-relaxed">{card.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: card.color }}>
                  Open dashboard <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-black text-white mt-3 tracking-tight">
              Trusted by 120,000+ Nigerians
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card p-7 flex flex-col gap-4">
                <StarRating count={t.rating} />
                <p className="text-zinc-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border-2 border-zinc-800" />
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-zinc-600 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-5">
            Ready to find your <span className="text-emerald-400">next home?</span>
          </h2>
          <p className="text-zinc-500 text-lg mb-8">
            Join 120,000+ Nigerians who found verified homes on PROPATI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/listings"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-base transition-colors inline-flex items-center gap-2 justify-center"
            >
              Browse Listings <ArrowRight size={16} />
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl text-base transition-colors inline-flex items-center gap-2 justify-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

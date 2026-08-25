import { Link } from "react-router";
import { Heart, ArrowRight, Search as SearchIcon, Home, Clock, Shield } from "lucide-react";
import { listings } from "../../data/mock";
import { PropertyCard, SectionLabel } from "../../components/ui";

export function Saved() {
  return (
    <div className="bg-black min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Saved Properties</h1>
            <p className="text-zinc-500 text-sm mt-1">{listings.length} saved listings</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Link key={l.id} to={`/listings/${l.id}`}>
              <PropertyCard listing={l} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Search() {
  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <SectionLabel>Search</SectionLabel>
          <h1 className="text-4xl font-black text-white mt-4 mb-3">Find your property</h1>
          <p className="text-zinc-500">Search across 50,000+ verified properties in Nigeria</p>
        </div>

        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Try 'Ikoyi 3 bedroom' or 'Lekki shortlet'…"
            className="w-full pl-12 pr-4 py-4 text-base bg-zinc-950 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {["Ikoyi", "Victoria Island", "Lekki", "Ajah", "Gbagada", "Ikeja"].map((loc) => (
            <button key={loc} className="px-3 py-1.5 text-sm text-zinc-400 border border-zinc-800 rounded-full hover:border-zinc-600 hover:text-white transition-colors">
              {loc}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {listings.slice(0, 4).map((l) => (
            <Link key={l.id} to={`/listings/${l.id}`}>
              <PropertyCard listing={l} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="bg-black min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-10">Last updated: August 1, 2026</p>

        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          {[
            {
              title: "1. Information We Collect",
              body: "We collect information you provide directly, including when you create an account, list a property, submit an application, or make a payment. This includes name, email address, phone number, National Identification Number (NIN), Bank Verification Number (BVN), and property documents.",
            },
            {
              title: "2. How We Use Your Information",
              body: "We use collected information to provide our verification services, facilitate transactions, improve our platform, comply with legal obligations under Nigerian law including the Nigeria Data Protection Regulation (NDPR), and send relevant communications about your account and listings.",
            },
            {
              title: "3. Data Sharing",
              body: "We do not sell your personal information. We share data only with verified service partners (payment processors, KYC providers, cloud storage) necessary to deliver our service, and with regulatory authorities as required by law.",
            },
            {
              title: "4. Data Security",
              body: "PROPATI employs industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, and multi-factor authentication for all accounts. We undergo regular third-party security audits.",
            },
            {
              title: "5. Your Rights (NDPR)",
              body: "Under the Nigeria Data Protection Regulation, you have the right to access your personal data, request correction, request deletion, object to processing, and lodge complaints with the National Information Technology Development Agency (NITDA).",
            },
            {
              title: "6. Cookies",
              body: "We use essential cookies for authentication and preferences, and analytics cookies to improve the platform. You may disable non-essential cookies via your browser settings without affecting core functionality.",
            },
            {
              title: "7. Contact Us",
              body: "For privacy-related inquiries, contact our Data Protection Officer at privacy@propati.ng or by post at PROPATI Technologies Ltd, 14 Bourdillon Road, Ikoyi, Lagos, Nigeria.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-semibold text-white mb-3">{section.title}</h2>
              <p className="text-zinc-400">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComingSoon() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock size={28} className="text-emerald-400" />
        </div>
        <SectionLabel>Coming Soon</SectionLabel>
        <h1 className="text-4xl lg:text-6xl font-black text-white mt-4 mb-4">We're building something.</h1>
        <p className="text-zinc-500 text-lg max-w-md mx-auto mb-8">
          This feature is under construction. Join our waitlist to be the first to know when it launches.
        </p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 dark-input px-4 py-2.5 text-sm focus:outline-none"
          />
          <button className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            Notify me
          </button>
        </div>
        <div className="mt-8">
          <Link to="/" className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 justify-center">
            <ArrowRight size={13} className="rotate-180" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <svg className="text-emerald-400" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful</h1>
        <p className="text-zinc-500 mb-2">Your transaction has been processed successfully.</p>
        <p className="text-xs text-zinc-600 font-mono mb-8">Ref: TXN-{Math.floor(Math.random() * 99999 + 10000)}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/tenant/payments" className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
            View Receipt
          </Link>
          <Link to="/dashboard/tenant" className="px-5 py-2.5 border border-zinc-800 text-zinc-300 text-sm rounded-lg hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentDeclined() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <svg className="text-red-400" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Declined</h1>
        <p className="text-zinc-500 mb-1">Your payment could not be processed.</p>
        <p className="text-xs text-zinc-600 mb-8">Please check your card details or try a different payment method.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/tenant/payments/new" className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
            Try Again
          </Link>
          <Link to="/dashboard/tenant" className="px-5 py-2.5 border border-zinc-800 text-zinc-300 text-sm rounded-lg hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AccountSuspended() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Shield size={28} className="text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Suspended</h1>
        <p className="text-zinc-500 mb-6">
          Your account has been temporarily suspended. This may be due to a policy violation or pending verification.
        </p>
        <div className="glass-card p-5 text-left mb-6">
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">What to do next</p>
          {["Check your email for details", "Contact support at support@propati.ng", "Complete identity verification if requested"].map((step) => (
            <div key={step} className="flex items-center gap-2.5 text-sm text-zinc-400 py-1.5">
              <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />
              {step}
            </div>
          ))}
        </div>
        <a href="mailto:support@propati.ng" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-lg hover:bg-white/10 transition-colors">
          Contact Support
        </a>
      </div>
    </div>
  );
}

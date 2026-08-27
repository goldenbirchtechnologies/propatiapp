"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { getCountryByCode, type CountryCode } from "@/lib/countries";
import { SectionLabel, InteractiveHoverButton } from "@/components/ui";

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const countryCode = searchParams.get("country") as CountryCode | null;
  const country = countryCode ? getCountryByCode(countryCode) : null;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Waitlist signup:", email, "for country:", countryCode);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="text-3xl font-bold tracking-tight text-emerald-400">PROPATI</span>
        </Link>
        <div className="glass-card p-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Globe className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <SectionLabel>
            <Globe size={11} className="text-emerald-400" />
            Coming Soon
          </SectionLabel>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mt-4 mb-4">
            {country ? country.name : "We're building something."}
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto mb-8">
            This feature is under construction. Join our waitlist to be the first to know when it launches.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="dark-input w-full px-4 py-3 text-sm focus:outline-none"
              />
              <InteractiveHoverButton
                type="submit"
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition-colors"
              >
                Notify me
              </InteractiveHoverButton>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re on the list!</span>
            </div>
          )}
        </div>
        <button onClick={() => router.back()} className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ComingSoonContent />
    </Suspense>
  );
}

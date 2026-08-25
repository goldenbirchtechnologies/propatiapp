"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { getCountryByCode, type CountryCode } from "@/lib/countries";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="text-3xl font-bold tracking-tight text-emerald-400">PROPATI</span>
        </Link>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Globe className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {country ? country.name : "Coming Soon"}
          </h1>
          <p className="text-zinc-400 mb-6">
            PROPATI is currently available in Nigeria. We&apos;re working to bring our verified property marketplace to your region.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-white">
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re on the list!</span>
            </div>
          )}
        </div>
        <button onClick={() => router.back()} className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-400">
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

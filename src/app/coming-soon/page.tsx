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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="text-3xl font-bold tracking-tight text-primary">PROPATI</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {country ?  : "Coming Soon"}
          </h1>
          <p className="text-muted-foreground mb-6">
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
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground">
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re on the list!</span>
            </div>
          )}
        </div>
        <button onClick={() => router.back()} className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
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

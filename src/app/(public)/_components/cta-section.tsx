import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden bg-[#101513] border border-emerald-500/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full blur-[100px] bg-emerald-500/15 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Get Started</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white max-w-2xl">
              Start Your Verified Property Journey
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl">
              Join thousands of landlords, tenants, and agents who trust PropalBox to manage, discover, and secure Nigeria&apos;s most verified real estate portfolio.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/listings" className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-sm bg-emerald-400 text-[#0a0a0a] hover:bg-emerald-300 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Explore Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/sign-up" className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-sm text-white border border-white/20 hover:bg-white/5 transition-colors">
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 flex flex-col gap-5">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">About PropatiBox</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Making property search and management easier in Nigeria.
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            PropatiBox brings property search, applications, agreements, payments, and maintenance into one place. People can make decisions with clearer information, while property owners can manage their work from one account.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-3">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">One place</span>
              <span className="text-xs text-gray-400">For your property tasks</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-white">Clearer</span>
              <span className="text-xs text-gray-400">Property information</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-white">Your pace</span>
              <span className="text-xs text-gray-400">From search to move-in</span>
            </div>
          </div>
          <div className="pt-3">
            <Link
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold transition-colors text-white hover:bg-[#171E1B] border border-emerald-400/40"
              href="/about-us"
            >
              Learn more about PropatiBox
              <span className="text-emerald-400">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[380px] w-full bg-[#171E1B] border border-white/[0.07]">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
              alt="Modern office building"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl backdrop-blur-md bg-[#171E1B]/85 border border-white/[0.08]">
              <p className="text-xs font-semibold text-white">Property made easier</p>
              <p className="text-[11px] text-gray-400">Tools for finding, renting, and managing property in Nigeria.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

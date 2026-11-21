import React from 'react';
import { CheckCircle, Shield, FileCheck, Fingerprint } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
      title: 'Registered businesses',
    description:
      "Business details can be checked where they are available. Review the information before you proceed.",
  },
  {
    icon: Shield,
      title: 'Secure payments',
    description:
      'Payments use the supported payment provider and are recorded in your account.',
  },
  {
    icon: FileCheck,
      title: 'Property documents',
    description:
      'Look for the documents and verification details attached to each listing. Ask questions before making a commitment.',
  },
  {
    icon: Fingerprint,
      title: 'Identity checks',
    description:
      'Some applications may require identity or reference checks to help keep the marketplace safe.',
  },
];

export default function TrustSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#101513]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-8 sm:p-12 relative overflow-hidden bg-[#171E1B] border border-emerald-500/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 blur-[80px] pointer-events-none bg-emerald-400/25" />

          <div className="flex flex-col gap-10 relative z-10">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Built for trust</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Clear information and safer transactions
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                We show the information you need to review a property, complete an agreement, and keep track of payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-5 rounded-xl flex flex-col gap-3 bg-[#101513] border border-white/[0.05]"
                  >
                    <Icon className="h-7 w-7 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">{f.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

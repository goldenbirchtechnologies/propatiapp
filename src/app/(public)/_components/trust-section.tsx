import React from 'react';
import { CheckCircle, Shield, FileCheck, Fingerprint } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'CAC Registered Entity',
    description:
      "Direct API sync with Nigeria's Corporate Affairs Commission ensures all institutional lessors hold legitimate registration.",
  },
  {
    icon: Shield,
    title: 'Paystack Encrypted Escrow',
    description:
      'ISO 27001 certified and PCI-DSS Level 1 compliance safeguarding all lease disbursements and security deposits.',
  },
  {
    icon: FileCheck,
    title: 'Title Vetting Guarantee',
    description:
      "Every property deed, Certificate of Occupancy, and Governor's Consent is independently audited by certified legal practitioners.",
  },
  {
    icon: Fingerprint,
    title: 'Biometric Tenant Screening',
    description:
      'Bank Verification Number (BVN) cross-referencing and national identity checks to curb impersonation and subletting scams.',
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
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Trust Architecture</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Bank-Grade Verification &amp; Security
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Built on zero-trust engineering principles to safeguard title ownership, lease contracts, and capital flows.
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

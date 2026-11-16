import React from 'react';

const stages = [
  {
    num: '01',
    title: 'Verify & Onboard',
    description:
      'Automated CAC corporate lookups, BVN/NIN identity KYC validation, and registered land registry deed confirmation.',
    metric: 'Instant Validation',
    filled: true,
  },
  {
    num: '02',
    title: 'Smart Tour',
    description:
      'Explore 3D interactive walk-throughs or auto-schedule escorted gate visits with biometric access tokens dispatched to your phone.',
    metric: 'Virtual & On-Site',
    filled: false,
  },
  {
    num: '03',
    title: 'Secure Payment',
    description:
      'Pay safely via NIBSS direct transfer or Paystack escrow. Automatic rent receipt generation and service charge ledger logging.',
    metric: 'Encrypted Escrow',
    filled: false,
  },
  {
    num: '04',
    title: 'Digital Handover',
    description:
      'Review condition inventory, sign digitally with timestamped audit records, receive smart lock access, and log your tenant app.',
    metric: 'Frictionless Move-In',
    filled: false,
  },
];

export default function WorkflowSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-14">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Frictionless Lifecycle</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">Operational Workflow</h2>
          <p className="text-sm sm:text-base text-gray-400">
            From initial verification to physical keys in hand in four auditable, automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="relative flex flex-col p-6 rounded-xl bg-[#171E1B] border border-white/[0.07]"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-4 ${
                  stage.filled
                    ? 'bg-emerald-400 text-[#0a0a0a]'
                    : 'bg-transparent border border-emerald-400 text-emerald-400'
                }`}
              >
                {stage.num}
              </div>
              <h4 className="text-base font-bold text-white mb-2">{stage.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed flex-1">{stage.description}</p>
              <div className="mt-4 pt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 border-t border-white/[0.06]">
                <span>&#9671;</span>
                <span>{stage.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

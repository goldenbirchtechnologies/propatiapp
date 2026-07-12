'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function JoinPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const roles = [
    { id: 'landlord', icon: 'home_work', title: 'Landlord', desc: 'List properties, manage tenants, and receive verified payments securely.' },
    { id: 'tenant', icon: 'person_search', title: 'Tenant', desc: 'Find verified listings, schedule inspections, and secure your next home.' },
    { id: 'agent', icon: 'handshake', title: 'Agent', desc: 'Close deals faster with verified listings and professional agency tools.' },
    { id: 'estate-manager', icon: 'corporate_fare', title: 'Estate Manager', desc: 'Oversee large portfolios with automated maintenance and finance tracking.' },
  ];

  useEffect(() => {
    const cards = document.querySelectorAll('.role-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }, []);

  const selectRole = (id: string) => {
    setSelectedRole(id);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 2000);
  };

  return (
          {/* Top Nav */}
      {/* Main Content */}
      <main className="pt-[100px] pb-16 relative min-h-screen flex flex-col">
        <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-2xl mx-auto px-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary-container/10 text-secondary px-4 py-1.5 rounded-full mb-6">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-xs font-medium uppercase tracking-wider">Secure Registration</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary mb-4">Choose your role</h1>
            <p className="text-muted-foreground text-lg">Join 12,000+ verified users securing their property future today.</p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {roles.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className={`role-card group cursor-pointer relative bg-card border rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 ${
                    isActive
                      ? 'border-secondary shadow-lg translate-y-[-4px]'
                      : 'border-outline-variant hover:border-primary/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`text-3xl transition-colors ${isActive ? 'text-secondary' : 'text-primary'}`}>
                      <span className="material-symbols-outlined">{role.icon}</span>
                    </div>
                    <div className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-primary">{role.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Footer Action Area */}
          <div className="flex flex-col gap-6 items-center">
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`w-full max-w-sm py-4 rounded-xl font-heading font-bold text-lg shadow-lg active:scale-95 transition-all ${
                selectedRole
                  ? 'bg-primary text-white hover:brightness-110'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Continue to Registration
            </button>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
                ))}
              </div>
              <p className="text-sm font-medium">Join the 12,000+ verified network</p>
            </div>
          </div>
        </div>
      </main>

      {/* Success Feedback Overlay */}
      <div
        className={`fixed inset-0 bg-primary/20 backdrop-blur-sm z-[60] flex items-center justify-center transition-opacity duration-300 ${
          showOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-primary">Configuring your dashboard...</p>
        </div>
      </div>

  );
}

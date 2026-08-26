'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign, Wrench, FileText, ArrowUpDown, Users, Shield,
  HelpCircle, ChevronRight, Search, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const helpCategories = [
  { icon: DollarSign, title: 'Payments & Billing', desc: 'Rent status, auto-pay setup, and payment history.', cta: 'View Billing', color: 'text-[#00ff66]', bg: 'bg-success/10' },
  { icon: Wrench, title: 'Maintenance Requests', desc: 'Report issues, track repairs, and view schedules.', cta: 'Track Repairs', color: 'text-[#00ff66]', bg: 'bg-success/10', highlight: true },
  { icon: FileText, title: 'Lease & Agreements', desc: 'Renewals, digital contracts, and terms of use.', cta: 'Access Documents', color: 'text-white' },
  { icon: ArrowUpDown, title: 'Move-in / Move-out', desc: 'Checklists, key collection, and deposit returns.', cta: 'View Checklist', color: 'text-white' },
  { icon: Users, title: 'Community & Rules', desc: 'Building policies, parking, and neighbor relations.', cta: 'Read Guidelines', color: 'text-white' },
  { icon: Shield, title: 'Account & Security', desc: 'Profile updates, password reset, and MFA settings.', cta: 'Manage Security', color: 'text-white' },
];

const faqs = [
  { q: 'How do I set up Auto-Pay for my monthly rent?', verified: true },
  { q: 'What is the policy for late rent payments?', verified: true },
  { q: 'How can I request an early lease termination?', verified: true },
  { q: 'Who is responsible for air conditioning maintenance?', verified: true },
];

export default function TenantSupportPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative bg-zinc-950/50/40 rounded-2xl overflow-hidden py-16 px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-heading text-4xl font-extrabold text-white mb-3">How can we help you?</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto mb-8">
            Access 24/7 support, track your requests, and manage your tenancy with Nigeria&apos;s most trusted property platform.
          </p>
          <div className="relative max-w-xl mx-auto">
            <div className="flex items-center bg-zinc-900 rounded-2xl shadow-xl border border-white/[0.08] p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
              <Search className="w-5 h-5 text-zinc-500 px-3" />
              <Input
                placeholder="Search for payments, maintenance, lease terms..."
                className="border-none focus:ring-0 flex-1 bg-transparent"
              />
              <Button className="shrink-0">Search Help</Button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Main Categories Bento Grid */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {helpCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div className="glass-card"
                key={cat.title}
                className={`transition-all duration-200 hover:shadow-none hover:-translate-y-1 cursor-pointer rounded-2xl ${
                  cat.highlight ? 'border-l-4 border-l-teal-600' : ''
                }`}
              >
                <div className="p-6 p-6 flex flex-col gap-4 h-full">
                  <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-white mb-1">{cat.title}</h3>
                    <p className="text-sm text-zinc-500">{cat.desc}</p>
                  </div>
                  <div className={`mt-auto pt-3 flex items-center font-semibold text-sm gap-1 transition-all hover:gap-2 ${cat.color}`}>
                    {cat.cta} <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ & Emergency */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold text-white">Frequently Asked Questions</h2>
              <button className="text-sm text-white font-mono hover:underline">See all articles</button>
            </div>
            {faqs.map((faq) => (
              <button
                key={faq.q}
                className="w-full p-4 rounded-xl border border-white/[0.08] hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#00ff66]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-500/10 border-2 border-red-500 p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3 text-red-500">
              <Phone className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Emergency 24/7</span>
            </div>
            <h3 className="font-heading text-base font-semibold text-red-500 mb-2">Urgent Maintenance Issue?</h3>
            <p className="text-sm text-red-500/80 mb-6">
              For immediate safety concerns, flooding, or security breaches, please use our priority emergency line.
            </p>
            <div className="mt-auto">
              <Button className="w-full bg-destructive text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90">
                <Phone className="w-4 h-4" /> Call Now
              </Button>
              <p className="text-center text-xs text-red-500/80 mt-3 font-mono">Available 24 hours a day, 7 days a week.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <div className="mb-4 w-80 bg-zinc-900 rounded-2xl shadow-2xl border border-white/[0.08] flex flex-col overflow-hidden animate-in">
            <div className="bg-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-bold">Support Agent Online</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 bg-zinc-950/50/30 space-y-3 overflow-y-auto max-h-64">
              <div className="bg-zinc-900 p-3 rounded-xl text-sm max-w-[85%] border border-white/[0.08]">
                Hello! I&apos;m David from PROPATI Support. How can I assist you?
              </div>
            </div>
            <div className="p-3 border-t border-white/[0.08] flex gap-2">
              <Input placeholder="Type a message..." className="bg-zinc-900 text-sm border-white/[0.08]" />
              <Button size="icon" className="bg-primary text-white rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </Button>
            </div>
          </div>
        )}
        <Button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-4.72C3.512 14.042 3 12.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="font-semibold text-sm">Chat with Support</span>
        </Button>
      </div>
    </div>
  );
}

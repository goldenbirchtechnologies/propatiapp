'use client'

import AppIcon from '@/components/icons/app-icon';

import { useState } from 'react';
import {

  ChevronRight, Download, FileText, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);
const years = Array.from({ length: 5 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

const paymentHistory = [
  { statement: 'OCT 2024 STATEMENT', date: 'Oct 02, 2024 • Paid via Transfer', amount: '₦ 1,450,000.00' },
  { statement: 'SEPT 2024 STATEMENT', date: 'Sept 01, 2024 • Paid via Card', amount: '₦ 1,450,000.00' },
  { statement: 'AUG 2024 STATEMENT', date: 'Aug 03, 2024 • Paid via Transfer', amount: '₦ 1,450,000.00' },
];

const ledgerRows = [
  { desc: 'Previous Balance', sub: 'Balance carried from October', category: 'Arrears', amount: '0.00', badge: '' },
  { desc: 'Monthly Rent', sub: 'The Obsidian Penthouse - Nov 2024', category: 'Residential', amount: '1,200,000.00', badge: 'bg-accent/10 text-accent' },
  { desc: 'Service Charge', sub: 'Security, waste management, and common area cleaning', category: 'Maintenance', amount: '150,000.00', badge: '' },
  { desc: 'Utility / Power Levy', sub: 'Prepaid meter allocation (500 units)', category: 'Utilities', amount: '100,000.00', badge: '' },
];

export default function AutomatedMonthlyStatementClient() {
  const [enrolled, setEnrolled] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <span className="font-mono text-zinc-400">PAYMENTS</span>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="font-mono text-white font-semibold">STATEMENT DETAILS</span>
      </nav>

      {/* Top Toolbar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-4">
          <FileText className="w-5 h-5 text-white" />
          <h2 className="font-heading text-headline-lg text-white">Statement Details</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-zinc-900 transition-colors"
            onClick={() => window.print()}
          >
            <Printer className="w-5 h-5 text-zinc-500" />
          </button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Download
          </Button>
          <div className="h-8 w-8 rounded-full bg-secondary-fixed-dim flex items-center justify-center">
            <FileText className="w-4 h-4 text-on-secondary-fixed" />
          </div>
        </div>
      </div>

      {/* A4 Report Layout */}
      <div className="bg-zinc-950/50 p-6 md:p-10 rounded-xl border border-white/[0.08] shadow-none flex flex-col gap-6 overflow-hidden relative max-w-4xl mx-auto">
        {/* Branding & Period */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/[0.08] pb-5 gap-4">
          <div>
            <h1 className="font-headline-md headline-md font-bold text-white tracking-tight">PROPATI</h1>
            <p className="font-label-sm label-sm text-[#835500] uppercase tracking-widest mt-1">
              Trust & Verification Systems
            </p>
          </div>
          <div className="text-right">
            <h2 className="font-headline-sm headline-sm text-zinc-500 mb-1">
              MONTHLY RENT & SERVICE STATEMENT
            </h2>
            <div className="flex flex-col gap-1 font-body-sm text-zinc-500">
              <p>
                Statement ID: <span className="font-label-sm label-sm font-bold">PRP-2024-1104</span>
              </p>
              <p>
                Billing Period: <span className="font-label-sm label-sm font-bold">Nov 1 — Nov 30, 2024</span>
              </p>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-emerald-500 text-white p-5 rounded-xl flex flex-col justify-between shadow-none">
            <div>
              <p className="font-label-sm opacity-70 mb-2">TOTAL AMOUNT DUE</p>
              <h3 className="font-headline-xl headline-xl">₦ 1,450,000.00</h3>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="font-label-sm opacity-70">DUE DATE</p>
                <p className="font-headline-sm headline-sm text-secondary-container">Nov 05, 2024</p>
              </div>
              <button className="bg-secondary-container text-on-secondary-container px-5 py-2 rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform">
                Pay Now
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-zinc-800 p-4 rounded-xl border border-white/[0.08] flex flex-col items-center justify-center text-center">
              <p className="font-label-sm text-zinc-500 mb-2 uppercase">Payment Status</p>
              <div className="px-3 py-1 bg-warning/10 text-warning rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                <span className="font-label-sm label-md">Awaiting Payment</span>
              </div>
            </div>
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <AppIcon name="domain" className="lucide" />
                <span className="font-label-sm text-zinc-500 uppercase text-xs">
                  The Obsidian Penthouse
                </span>
              </div>
              <p className="font-body-sm text-sm text-white">Unit 402, Victoria Tower, Lagos, NG</p>
              <p className="font-body-sm text-xs text-zinc-500 mt-1">Manager: David Kolawole</p>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div>
          <h4 className="font-headline-sm headline-sm mb-3 flex items-center gap-sm">
            <AppIcon name="analytics" className="lucide" />
            Statement Ledger
          </h4>
          <div className="overflow-hidden border border-white/[0.08] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-950 text-white font-label-sm label-md">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount (₦)</th>
                </tr>
              </thead>
              <tbody className="font-body-sm">
                {ledgerRows.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.08] even:bg-zinc-950/50">
                    <td className="p-3">
                      <p className="font-bold">{row.desc}</p>
                      <p className="text-xs text-zinc-500">{row.sub}</p>
                    </td>
                    <td className="p-3">
                      {row.badge ? (
                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${row.badge}`}>
                          {row.category}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-surface-variant rounded-md text-[10px] uppercase">
                          {row.category}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-500 text-white font-bold">
                <tr>
                  <td className="p-3 text-right font-headline-sm" colspan="2">Total Current Charges</td>
                  <td className="p-3 text-right font-headline-sm">₦ 1,450,000.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* History Sparkline / Mini-Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="p-5 bg-zinc-950/50 border border-white/[0.08] rounded-xl">
            <h5 className="font-label-sm text-zinc-500 mb-3">PAYMENT HISTORY (LAST 3)</h5>
            <div className="space-y-2">
              {paymentHistory.map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center pb-2 ${i < paymentHistory.length - 1 ? 'border-b border-dashed border-white/[0.08]' : ''}`}
                >
                  <div>
                    <p className="text-xs font-bold">{item.statement}</p>
                    <p className="text-[10px] text-zinc-500">{item.date}</p>
                  </div>
                  <span className="text-[#009e6f] font-bold text-xs">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-zinc-950/50 border border-white/[0.08] rounded-xl flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 mb-3 bg-tertiary-container rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <p className="font-headline-sm text-white text-white mb-1">Perfect Payer Status</p>
            <p className="font-body-sm text-zinc-500">
              Your account has no outstanding arrears. Maintain this status for future rent discounts.
            </p>
          </div>
        </div>

        {/* Report Footer */}
        <footer className="mt-auto pt-5 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#009e6f]" />
              <span className="font-label-sm text-[#00ff66] font-bold">
                DIGITALLY VERIFIED DOCUMENT
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              This document is an automated electronic statement generated by PROPATI Technologies.
              It serves as an official notice of dues for the specified period. Terms and conditions
              of the lease agreement apply. For disputes, contact support@propati.io within 48 hours
              of receipt.
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex gap-3 mb-2">
              <FileText className="w-5 h-5 text-white" />
              <FileText className="w-5 h-5 text-white" />
              <FileText className="w-5 h-5 text-white" />
            </div>
            <p className="font-label-sm text-zinc-500">
              © 2024 PROPATI Technologies. Lagos, Nigeria.
            </p>
          </div>
        </footer>
      </div>

      {/* Enrollment Control (preserved functional hook) */}
      <div className="glass-card border-sky-500/20 bg-sky-500/5">
        <div className="p-6 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                enrolled ? 'bg-teal-500/10 text-teal-500' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white text-white">
                {enrolled ? 'Auto-Statement is Active' : 'Auto-Statement Disabled'}
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                {enrolled
                  ? 'Your statement is generated automatically every 1st of the month.'
                  : 'Enable the monthly auto-statement today.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEnrolled(!enrolled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              enrolled ? 'bg-teal-500' : 'bg-zinc-900 border border-white/[0.08]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-zinc-950/50 rounded-full shadow-none transition-all ${
                enrolled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

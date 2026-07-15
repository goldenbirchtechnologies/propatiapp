import MaterialIcon from '@/components/icons/material-icon';
'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {

  Share,
  Download,
  Building2,
  Verified,
  FileText,
  MapPin,
  Users,
  Image,
  ShieldCheck,
  Printer,

} from 'lucide-react';

const categories = [
  {
    title: 'Business Registration',
    icon: 'description',
    items: [
      { label: 'CAC Reg', value: 'RC-882910' },
      { label: 'Tax Status', value: 'Current' },
    ],
  },
  {
    title: 'Physical Office',
    icon: 'location_city',
    items: [
      { label: 'Signage', value: 'Present' },
      { label: 'Maintenance', value: 'Excellent' },
    ],
  },
  {
    title: 'Operational Capacity',
    icon: 'groups',
    items: [
      { label: 'Staff Count', value: '24 Active' },
      { label: 'Workstations', value: '30 Units' },
    ],
  },
];

const galleryImages = [
  { alt: 'OFFICE EXTERIOR', src: '' },
  { alt: 'RECEPTION AREA', src: '' },
  { alt: 'WORKSTATIONS', src: '' },
  { alt: 'MEETING ROOM', src: '' },
];

export default function AgentInspectionReportClient() {
  const [score] = useState(98);

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MaterialIcon name="arrow_back" className="material-symbols-outlined" />
          </Button>
          <h1 className="text-headline-sm font-bold">Inspection Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Share className="h-4 w-4" /> Share
          </Button>
          <Button className="gap-2" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      {/* Report Paper */}
      <div className="bg-surface-container-lowest shadow-lg border border-outline-variant rounded-xl overflow-hidden max-w-5xl mx-auto print-area">
        {/* Report Header */}
        <div className="bg-primary text-white p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 border-b-4 border-warning">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <Building2 className="h-4 w-4" />
              <p className="text-xs font-label-md uppercase tracking-wider">Real Estate Audit Document</p>
            </div>
            <h2 className="text-headline-sm font-bold">Mainland Regional Office HQ</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
              <div className="flex items-center gap-2">
                <MaterialIcon name="tag" className="material-symbols-outlined" />
                <span className="text-xs font-label-md uppercase tracking-wider">#INS-2024-0882</span>
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="calendar_today" className="material-symbols-outlined" />
                <span className="text-xs font-label-md uppercase tracking-wider">August 24, 2024</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <div className="bg-success border border-success/30 px-6 py-3 rounded-xl flex items-center gap-3">
              <Verified className="h-6 w-6 text-success/80" />
              <span className="text-headline-sm font-bold">CLEARANCE ISSUED</span>
            </div>
            <p className="mt-2 text-xs font-label-md uppercase tracking-wider text-white/60">Final Accreditation Status</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Clearance Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-muted/50 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-outline-variant">
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-muted rounded-lg flex items-center justify-center">
                <Verified className="h-16 w-16 text-primary/40" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-headline-sm font-bold mb-2">Master Verification Passed</h3>
                <p className="text-xs font-label-md uppercase tracking-wider mb-4" style={{ color: 'text-on-surface-variant' }}>
                  This property has successfully navigated the comprehensive Tier 2 audit framework,
                  confirming legal residency, operational capacity, and structural compliance.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-label-md uppercase tracking-wider font-bold">
                    Tier 2 Accredited
                  </span>
                  <span className="bg-warning text-primary px-3 py-1 rounded-full text-xs font-label-md uppercase tracking-wider font-bold">
                    Lagos State Compliant
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-primary p-6 rounded-xl flex flex-col justify-center items-center text-white text-center border border-outline-variant">
              <p className="text-xs font-label-md uppercase tracking-wider mb-1 opacity-80">Audit Score</p>
              <div className="text-headline-md font-black leading-none">
                {score}<span className="text-headline-sm text-warning">%</span>
              </div>
              <p className="text-xs font-label-md uppercase tracking-wider text-white/70 mt-2">Elite Performance Category</p>
            </div>
          </section>

          {/* Audit Categories */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MaterialIcon name="analytics" className="material-symbols-outlined" />
              <h3 className="text-headline-sm font-bold">Compliance Assessment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat, idx) => (
                <Card key={idx}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <MaterialIcon name={cat.icon} className="material-symbols-outlined" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-label-md uppercase tracking-wider border border-outline-variant font-bold">
                        VERIFIED
                      </span>
                    </div>
                    <h4 className="font-headline-sm font-bold text-lg mb-2">{cat.title}</h4>
                    <ul className="space-y-2 mb-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>
                      {cat.items.map((item, i) => (
                        <li key={i} className="flex justify-between">
                          <MaterialIcon name="{item.label}:" className="material-symbols-outlined" />
                          <span className="font-mono font-bold">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                      View Original <MaterialIcon name="open_in_new" className="material-symbols-outlined" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Evidence Gallery */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MaterialIcon name="photo_library" className="material-symbols-outlined" />
              <h3 className="text-headline-sm font-bold">Evidence Gallery</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square bg-muted rounded-xl overflow-hidden cursor-zoom-in"
                >
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Image className="h-8 w-8" style={{ color: 'text-on-surface-variant' }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs font-label-md uppercase tracking-wider font-bold">{img.alt}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Inspector Remarks */}
          <section className="bg-muted p-6 border-l-4 border-primary rounded-r-xl">
            <h4 className="text-xs font-label-md uppercase tracking-wider text-primary mb-2">
              Inspector&apos;s Professional Remarks
            </h4>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>
              The facility located at the Mainland Regional Office HQ is fully operational and meets all
              Lagos State regulatory requirements for Tier 2 accreditation. Documentation was verified
              against original state records and physical infrastructure exceeds standard safety and
              operational capacity benchmarks. We recommend immediate activation of the certified
              listing status on the PROPATI marketplace.
            </p>
          </section>

          {/* Footer / Sign-off */}
          <footer className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-headline-sm font-bold">Chidi Anthony Okafor</p>
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Lead Field Inspector • ID: PR-992</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-3 py-1 bg-muted rounded border border-outline-variant">
                  <p className="text-[9px] font-label-md uppercase tracking-wider opacity-60 mb-1">Time Logged</p>
                  <p className="text-xs font-mono">14:22:10 WAT</p>
                </div>
                <div className="px-3 py-1 bg-muted rounded border border-outline-variant">
                  <p className="text-[9px] font-label-md uppercase tracking-wider opacity-60 mb-1">GPS Auth</p>
                  <p className="text-xs font-mono">6.5244° N, 3.3792° E</p>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="mb-2 italic font-serif text-headline-md text-primary/80 opacity-80">
                C.A. Okafor
              </div>
              <div className="w-48 h-[1px] bg-outline-variant ml-auto mb-2" />
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Authorized Digital Signature</p>
            </div>
          </footer>
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center no-print">
        <p className="text-xs font-label-md uppercase tracking-wider opacity-60" style={{ color: 'text-on-surface-variant' }}>
          This is a system-generated document. For verification queries, visit propati.com/verify-id?#INS-2024-0882
        </p>
      </div>
    </div>
  );
}

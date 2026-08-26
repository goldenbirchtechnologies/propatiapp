'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  FileText,
  Fingerprint,
  Video,
  ClipboardCheck,
  ShieldCheck,
  Building2,
  Briefcase,
} from 'lucide-react';

type Props = {
  listingId: string | null;
  type: 'property' | 'identity' | 'company' | 'professional';
};

const STEPS_BY_TYPE: Record<string, { layer: number; label: string; desc: string; icon: any; href: string }[]> = {
  property: [
    { layer: 1, label: 'Documents', desc: 'Upload ownership documents, valid ID, property photos, and utility bill.', icon: FileText, href: '/dashboard/verification/step1/documents' },
    { layer: 2, label: 'Identity', desc: 'Verify your identity via NIN/BVN. We cross-check with your submitted documents.', icon: Fingerprint, href: '/dashboard/verification/step2/identity' },
    { layer: 3, label: 'Video Walkthrough', desc: 'Record a clear video of the property. Include the QR code at the start.', icon: Video, href: '/dashboard/verification/step3/video' },
    { layer: 4, label: 'Physical Inspection', desc: 'Schedule an agent to physically inspect the property.', icon: ClipboardCheck, href: '/dashboard/verification/step4/inspection' },
    { layer: 5, label: 'Certification', desc: 'Final admin review. Approved listings receive the Certified badge.', icon: ShieldCheck, href: '/dashboard/verification/checklist' },
  ],
  identity: [
    { layer: 1, label: 'Identity Check', desc: 'Complete identity verification via Dojah. This covers NIN/BVN and liveness checks.', icon: Fingerprint, href: '/dashboard/verification/dojah-kyc' },
  ],
  company: [
    { layer: 1, label: 'Business Docs', desc: 'Upload CAC certificate, TIN, and memorandum & articles of association.', icon: Building2, href: '/dashboard/verification/step1/documents' },
    { layer: 2, label: 'Director Verification', desc: 'Verify identity of the company director or authorized signatory via Dojah.', icon: Fingerprint, href: '/dashboard/verification/dojah-kyc' },
    { layer: 3, label: 'Video Declaration', desc: 'Record a short business declaration video with the authorized signatory.', icon: Video, href: '/dashboard/verification/step3/video' },
    { layer: 4, label: 'Admin Review', desc: 'Final review and certification of business credentials.', icon: ShieldCheck, href: '/dashboard/verification/checklist' },
  ],
  professional: [
    { layer: 1, label: 'Credentials', desc: 'Upload professional licenses, certifications, and employment records.', icon: Briefcase, href: '/dashboard/verification/step1/documents' },
    { layer: 2, label: 'Identity', desc: 'Verify your professional identity via Dojah.', icon: Fingerprint, href: '/dashboard/verification/dojah-kyc' },
    { layer: 3, label: 'Video Introduction', desc: 'Record a short professional introduction or portfolio walkthrough.', icon: Video, href: '/dashboard/verification/step3/video' },
    { layer: 4, label: 'Admin Review', desc: 'Final review and certification of professional status.', icon: ShieldCheck, href: '/dashboard/verification/checklist' },
  ],
};

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function VerificationGuideClient(props: Props) {
  const steps = STEPS_BY_TYPE[props.type] || STEPS_BY_TYPE.property;

  return (
    <div className="space-y-6">
      <div className="glass-card bg-primary text-white">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white capitalize">{props.type} Verification</h3>
        </div>
        <div className="p-6">
          <p className="opacity-90">
            Follow the steps below to complete your {props.type} verification. Each layer must be completed before moving to the next.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div className="glass-card" key={step.layer} className="hover:shadow-none transition-shadow">
            <div className="p-6 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">Layer {step.layer}: {step.label}</h4>
                  <Badge variant="outline" className="text-[10px] font-bold">Required</Badge>
                </div>
                <p className="text-sm text-zinc-400">{step.desc}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`${step.href}?type=${props.type}${props.listingId ? `&listingId=${props.listingId}` : ''}`}>
                  {idx < steps.length - 1 ? 'Start' : 'Review'} <ArrowIcon />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card border-success/20 bg-success/5">
        <div className="p-6 p-5 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-[#10b981] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">Why verify?</h4>
            <p className="text-sm text-zinc-400">
              Verified profiles and properties receive priority placement and unlock premium features.
              Unverified accounts are limited in visibility and access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationGuideClient;

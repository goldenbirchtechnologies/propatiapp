'use client';

import { ShieldCheck, Clock, ShieldQuestion, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DojahWidgetClient from '@/components/verification/DojahWidgetClient';

type KycStatus = 'not_started' | 'in_progress' | 'approved' | 'rejected' | 'requires_review';

export interface KycVerificationCardProps {
  status?: KycStatus | null;
  description?: string;
  onVerified?: (result: { success: boolean; referenceId?: string; data?: Record<string, unknown> }) => void;
}

const statusConfig: Record<KycStatus, { title: string; description: string; icon: React.ReactNode; accent: string }> = {
  not_started: {
    title: 'Identity verification not started',
    description: 'Complete verification to unlock payments, agreements, and full platform access.',
    icon: <ShieldQuestion className="h-5 w-5" />,
    accent: 'bg-slate-900 border-slate-800',
  },
  in_progress: {
    title: 'Verification in progress',
    description: 'Your verification is being reviewed. Most checks complete within a few minutes.',
    icon: <Clock className="h-5 w-5" />,
    accent: 'bg-slate-900 border-slate-800',
  },
  approved: {
    title: 'Identity verified',
    description: 'You have completed identity verification.',
    icon: <ShieldCheck className="h-5 w-5" />,
    accent: 'bg-slate-900 border-slate-800',
  },
  rejected: {
    title: 'Verification not approved',
    description: 'Your verification could not be approved. Please retry with clearer details.',
    icon: <XCircle className="h-5 w-5" />,
    accent: 'bg-slate-900 border-slate-800',
  },
  requires_review: {
    title: 'Verification needs review',
    description: 'Our team is reviewing your verification. We’ll update you shortly.',
    icon: <Clock className="h-5 w-5" />,
    accent: 'bg-slate-900 border-slate-800',
  },
};

export default function KycVerificationCard({
  status = 'not_started',
  description,
  onVerified,
}: KycVerificationCardProps) {
  const resolvedStatus = status === null ? 'not_started' : status;
  const config = statusConfig[resolvedStatus] || statusConfig.not_started;

  return (
    <Card className="border border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          {config.icon}
          Know Your Customer (KYC)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <p>{description || config.description}</p>

        <div className="rounded-lg border border-slate-800 bg-slate-900/80 flex items-center gap-4 p-4">
          <div className="rounded-full p-2 bg-slate-900 border border-slate-800">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">{config.title}</p>
            <p className="text-xs text-slate-400">{resolvedStatus.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {resolvedStatus !== 'approved' && (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <DojahWidgetClient
              type="custom"
              onComplete={(result) => {
                onVerified?.(result);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

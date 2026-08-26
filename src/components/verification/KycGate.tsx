'use client';

import { ShieldQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type KycStatus = 'not_started' | 'in_progress' | 'approved' | 'rejected' | 'requires_review';

export interface KycGateProps {
  status?: KycStatus | null;
  forbiddenAction?: string;
  children?: React.ReactNode;
}

const REQUIRED_ACTION_BLOCKS: Record<string, string> = {
  pay_rent: 'Pay rent',
  withdraw: 'Withdraw funds',
  submit_listing: 'Submit listings',
  create_agreement: 'Create agreements',
  onboarding: 'Complete onboarding',
};

export default function KycGate({ status = 'not_started', forbiddenAction, children }: KycGateProps) {
  if (status === 'approved') {
    return <>{children}</>;
  }

  const actionLabel = forbiddenAction ? REQUIRED_ACTION_BLOCKS[forbiddenAction] || forbiddenAction : 'this feature';

  return (
    <Card className="border border-zinc-800 bg-zinc-900">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-2 bg-zinc-900 border border-zinc-800">
            <ShieldQuestion className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">Identity verification required</p>
            <p className="text-xs text-zinc-400 mt-1">
              Complete Dojah KYC to access {actionLabel}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

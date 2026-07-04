'use client';

import { Shield, Phone, IdCard, Lock } from 'lucide-react';

interface ProfileSecurityProps {
  title: string;
  description: string;
  tier: string;
  status: string;
  nextAction?: string;
  onVerify?: () => void;
}

export default function ProfileSecurity({ title, description, tier, status, nextAction, onVerify }: ProfileSecurityProps) {
  const statusColor = status === 'verified' ? 'text-[var(--success)]' : status === 'pending' ? 'text-[var(--secondary)]' : 'text-[var(--text-muted)]';

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)] p-6">
      <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 mt-0.5 text-[var(--text-muted)]" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">Verification tier</p>
            <p className="text-xs text-[var(--text-muted)] capitalize">{tier.replace('_', ' ')}</p>
          </div>
          <span className={`text-xs font-medium ${statusColor} capitalize`}>{status}</span>
        </div>
        {nextAction && (
          <div className="flex items-start gap-3">
            <IdCard className="h-5 w-5 mt-0.5 text-[var(--text-muted)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">Next step</p>
              <p className="text-xs text-[var(--text-muted)]">{nextAction}</p>
            </div>
          </div>
        )}
        {onVerify && (
          <button
            onClick={onVerify}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--primary)] text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/5 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Verify Phone
          </button>
        )}
      </div>
    </div>
  );
}

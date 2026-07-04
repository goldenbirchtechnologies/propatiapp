'use client';

import { ReactNode } from 'react';
import { Camera } from 'lucide-react';

interface ProfileHeaderProps {
  avatarUrl?: string;
  fullName: string;
  role: string;
  joinDate?: string;
  verifyBadge?: { label: string; icon?: ReactNode };
  onEdit?: () => void;
}

export default function ProfileHeader({ avatarUrl, fullName, role, joinDate, verifyBadge, onEdit }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName} className="h-24 w-24 rounded-full object-cover border-2 border-[var(--border-default)]" />
        ) : (
          <div className="h-24 w-24 rounded-full flex items-center justify-center bg-[var(--bg-overlay)] text-[var(--text-muted)]">
            <span className="text-2xl font-bold">{fullName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <button
          onClick={onEdit}
          className="absolute bottom-0 right-0 p-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-raised)] hover:bg-[var(--bg-overlay)] transition-colors"
          aria-label="Change avatar"
        >
          <Camera className="h-4 w-4 text-[var(--text-secondary)]" />
        </button>
      </div>
      <h2 className="mt-4 font-display font-bold text-lg text-[var(--text-primary)]">{fullName}</h2>
      <p className="text-xs text-[var(--text-muted)] capitalize">{role.replace('_', ' ')} since {joinDate || '2026'}</p>
      {verifyBadge && (
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">
          {verifyBadge.icon}
          {verifyBadge.label}
        </div>
      )}
      {onEdit && (
        <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium hover:opacity-90 transition-opacity">
          Save Changes
        </button>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Home, DoorOpen, Users, Check, Shield } from 'lucide-react';
import type { PrivacyType } from '../types';

export interface Step2Props {
  value?: PrivacyType;
  onChange: (value: PrivacyType) => void;
}

const OPTIONS: { value: PrivacyType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'entire_place',
    label: 'Entire place',
    description: 'Guests get the whole space to themselves. Usually an entire home or apartment.',
    icon: <Home className="size-5" />,
  },
  {
    value: 'private_room',
    label: 'A private room',
    description: 'Guests have their own room to sleep in, plus access to shared common areas.',
    icon: <DoorOpen className="size-5" />,
  },
  {
    value: 'shared_room',
    label: 'A shared room',
    description: 'Guests sleep in a room or common area that may be shared with you or others.',
    icon: <Users className="size-5" />,
  },
];

export default function Step2PrivacyType({ value, onChange }: Step2Props) {
  const [internal, setInternal] = useState<PrivacyType | undefined>(value);
  const selected = value ?? internal;

  const handleSelect = (v: PrivacyType) => {
    setInternal(v);
    onChange(v);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 02 / Privacy Type</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">LASRERA Act 2022 Mandate · Privacy Type</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Define the privacy level of the listing under Lagos State tenancy disclosure rules.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`relative flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 border-primary dark:border-primary shadow-md'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/10 text-primary' : 'bg-zinc-50 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400'}`}>
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-zinc-900 dark:text-white">{opt.label}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{opt.description}</div>
              </div>
              {isActive && (
                <div className="bg-primary text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="p-5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="size-4 text-primary" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">LASRERA Act 2022 Mandate</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">Section 16 requires institutional properties in Eti-Osa and Ikoyi corridors to disclose building approval numbers. Unregistered broker listings carry penalty liabilities.</p>
      </div>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const d = data as Record<string, unknown> | undefined;
  const val = d?.privacy_type ?? d;
  if (!val || (typeof val === 'string' && !val.trim())) {
    return ['privacy_type is required'];
  }
  return [];
}

export function getData(): { privacy_type?: PrivacyType } {
  return {};
}
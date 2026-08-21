'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Home, DoorOpen, Users, Check } from 'lucide-react';
import type { PrivacyType } from '../types';

export interface Step2Props {
  value?: PrivacyType;
  onChange: (value: PrivacyType) => void;
}

const OPTIONS: { value: PrivacyType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'entire_place',
    label: 'Entire place',
    description: 'Guests get the whole space to themselves. This is usually an entire home or apartment.',
    icon: <Home className="size-5" />,
  },
  {
    value: 'private_room',
    label: 'A room',
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">What type of place will guests have?</h2>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <Card
              key={opt.value}
              size="sm"
              onClick={() => handleSelect(opt.value)}
              className={`relative cursor-pointer transition border-2 ${
                isActive
                  ? 'border-primary bg-[#262626]'
                  : 'border-[#262626] hover:border-white/40'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="p-4 flex items-center gap-4">
                <div className={isActive ? 'text-white' : 'text-muted-foreground'}>
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-muted-foreground">{opt.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
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

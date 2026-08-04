'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, DoorOpen, Users } from 'lucide-react';
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
              className={`cursor-pointer transition border ${
                isActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="p-4 flex items-center gap-4">
                <div className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-muted-foreground">{opt.description}</div>
                </div>
                {isActive && <Badge variant="default" className="text-xs">Selected</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { privacy_type?: PrivacyType } {
  return {};
}

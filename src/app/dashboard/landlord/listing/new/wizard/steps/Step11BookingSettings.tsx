'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap } from 'lucide-react';
import type { BookingModel } from '../types';

export interface Step11Props {
  value?: BookingModel;
  onChange: (value: BookingModel) => void;
}

const OPTIONS: { value: BookingModel; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'review_first_3_then_instant',
    label: 'Review first, then auto-accept',
    description: 'We will review the first 3 booking requests and then switch you to Instant Book.',
    icon: <CheckCircle className="size-5" />,
  },
  {
    value: 'instant_book',
    label: 'Instant Book',
    description: 'Guests can book automatically. You will confirm within 24 hours.',
    icon: <Zap className="size-5" />,
  },
];

export default function Step11BookingSettings({ value, onChange }: Step11Props) {
  const [internal, setInternal] = useState<BookingModel | undefined>(value);
  const selected = value ?? internal;

  const handleSelect = (v: BookingModel) => {
    setInternal(v);
    onChange(v);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">How do you want to manage bookings?</h2>
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

export function getData(): { booking_model?: BookingModel } {
  return {};
}

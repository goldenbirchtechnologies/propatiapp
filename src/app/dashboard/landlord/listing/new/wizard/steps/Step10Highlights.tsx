'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export interface Step10Props {
  highlights?: string[];
  onChange: (highlights: string[]) => void;
}

const OPTIONS = [
  { value: 'peaceful', label: 'Peaceful', description: 'A quiet, relaxing stay' },
  { value: 'unique', label: 'Unique', description: 'A one-of-a-kind property' },
  { value: 'family_friendly', label: 'Family-friendly', description: 'Great for families with kids' },
  { value: 'stylish', label: 'Stylish', description: 'Modern and beautifully designed' },
  { value: 'central', label: 'Central', description: 'Close to city center and attractions' },
  { value: 'spacious', label: 'Spacious', description: 'Plenty of room to spread out' },
];

export default function Step10Highlights({ highlights = [], onChange }: Step10Props) {
  const [selected, setSelected] = useState<string[]>(highlights);

  const toggle = (value: string) => {
    let next: string[];
    if (selected.includes(value)) {
      next = selected.filter((x) => x !== value);
    } else {
      if (selected.length >= 2) {
        next = selected;
      } else {
        next = [...selected, value];
      }
    }
    setSelected(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">What makes your place special?</h2>
        <Sparkles className="size-5 text-yellow-500" />
      </div>
      <p className="text-sm text-muted-foreground">Pick up to 2 highlights that best describe your listing.</p>
      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <Card
              key={opt.value}
              size="sm"
              onClick={() => toggle(opt.value)}
              className={`cursor-pointer transition border min-w-[140px] ${
                isActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="p-3 text-center space-y-1">
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
                {isActive && <Badge variant="default" className="text-xs">Selected</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
      <div className="text-sm text-muted-foreground">
        {selected.length}/2 selected
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { highlights?: string[] } {
  return {};
}

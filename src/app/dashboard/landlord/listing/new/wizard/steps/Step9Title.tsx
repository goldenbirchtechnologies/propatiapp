'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export interface Step9Props {
  title?: string;
  onChange: (title: string) => void;
}

export default function Step9Title({ title, onChange }: Step9Props) {
  const [internal, setInternal] = useState(title ?? '');
  const value = title ?? internal;

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  const remaining = 50 - value.length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Name your listing</h2>
      <p className="text-sm text-muted-foreground">Create a catchy title that describes your place. Keep it short and sweet.</p>
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
            <FileText className="size-4" /> Title
          </Label>
          <span
            className={`text-xs font-medium ${
              remaining < 0 ? 'text-destructive' : remaining < 10 ? 'text-yellow-600' : 'text-muted-foreground'
            }`}
          >
            {value.length} / 50
          </span>
        </div>
        <Textarea
          id="title"
          placeholder="e.g. Sunny 2-bedroom apartment with ocean view"
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= 50) {
              setInternal(e.target.value);
              onChange(e.target.value);
            }
          }}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Catchy names get more views</span>
          <Badge variant={remaining < 10 ? 'outline' : 'secondary'} className="text-xs">
            {remaining} characters left
          </Badge>
        </div>
      </Card>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const title = typeof data === 'string' ? data : (data as { title?: string } | undefined)?.title ?? '';
  if (!title.trim() || title.trim().length < 50) {
    errors.push('Title must be at least 50 characters');
  }
  if (title.length > 50) {
    errors.push('Title must be at most 50 characters');
  }
  return errors;
}

export function getData(): { title?: string } {
  return {};
}

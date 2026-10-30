'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles } from 'lucide-react';

export interface Step9Props {
  title?: string;
  onChange: (title: string) => void;
}

export default function Step9Title({ title, onChange }: Step9Props) {
  const [internal, setInternal] = useState(title ?? '');
  const value = title ?? internal;

  const remaining = 50 - value.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 09 / Listing Title</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Title / Listing Title</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a catchy title that describes your place. Keep it short and sweet.</p>
      </div>
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="title" className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Institutional Property Title
          </Label>
          <span className={`text-xs font-medium ${remaining < 0 ? 'text-red-500' : remaining < 10 ? 'text-amber-600' : 'text-zinc-600 dark:text-zinc-400'}`}>
            {value.length} / 50
          </span>
        </div>
        <Textarea
          id="title"
          placeholder="e.g. The Sapphire Marina Towers, Penthouse 4B"
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= 50) {
              setInternal(e.target.value);
              onChange(e.target.value);
            }
          }}
          rows={3}
          className="resize-none bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Catchy names get more views</span>
          <Badge variant={remaining < 10 ? 'outline' : 'secondary'} className="text-xs">
            {remaining} characters left
          </Badge>
        </div>
      </div>
      <div className="p-5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Syndication Marketing Pitch</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Character limit: 142/800. Ultra-luxury duplex with panoramic views of Lagos Lagoon...</p>
      </div>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const title = typeof data === 'string' ? data : (data as { title?: string } | undefined)?.title ?? '';
  if (!title.trim()) {
    errors.push('Title is required');
  }
  if (title.length > 50) {
    errors.push('Title must be at most 50 characters');
  }
  return errors;
}

export function getData(): { title?: string } {
  return {};
}
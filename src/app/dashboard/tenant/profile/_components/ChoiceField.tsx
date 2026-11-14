'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field } from './parts';

/**
 * Enum picker. Uses the existing Select rather than adding a radio-group
 * dependency; `null` is a real state here (the field can be cleared), which
 * Select expresses with a sentinel because it cannot hold an empty value.
 */

const NONE = '__none__';

export function ChoiceField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  error,
  required,
  placeholder = 'Select',
}: {
  id: string;
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (value: T | null) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <Select
        value={value ?? NONE}
        onValueChange={(next) => onChange(next === NONE ? null : (next as T))}
      >
        <SelectTrigger id={id} aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>
            <span className="text-zinc-500 dark:text-zinc-400">Not specified</span>
          </SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

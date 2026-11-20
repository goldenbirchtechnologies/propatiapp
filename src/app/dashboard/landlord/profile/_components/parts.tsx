'use client';

import * as React from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const NONE = '__none__';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-zinc-700 dark:text-zinc-300">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="flex items-start gap-1 text-xs text-destructive" role="alert">
          <AlertCircle className="mt-px h-3 w-3 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  error,
  required,
  className,
  autoComplete,
  inputMode,
  maxLength,
  min,
  max,
  step,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required} className={className}>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  rows = 3,
  className,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} className={className}>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  error,
  required,
  placeholder = 'Select',
  allowEmpty = false,
  emptyLabel = 'Not specified',
  disabled,
  className,
}: {
  id: string;
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required} className={className}>
      <Select
        value={value || (allowEmpty ? NONE : '')}
        onValueChange={(next) => onChange(next === NONE ? '' : next)}
        disabled={disabled}
      >
        <SelectTrigger id={id} aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty && (
            <SelectItem value={NONE}>
              <span className="text-zinc-500 dark:text-zinc-400">{emptyLabel}</span>
            </SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function SectionPanel({
  index,
  title,
  description,
  children,
  footer,
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={`owner-section-${index}-title`}
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60"
    >
      <header className="border-b border-zinc-200 px-5 py-5 dark:border-white/[0.08] sm:px-6">
        <p className="text-[11px] font-semibold tabular-nums tracking-wider text-primary">
          {String(index).padStart(2, '0')}
        </p>
        <h2
          id={`owner-section-${index}-title`}
          className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </header>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
      {footer}
    </section>
  );
}

export function SubSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-white/[0.06]">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function ActionBar({
  state,
  dirty,
  error,
  onBack,
  onSave,
  onContinue,
  isFirst,
  isLast,
}: {
  state: SaveState;
  dirty: boolean;
  error?: string;
  onBack: () => void;
  onSave: () => void;
  onContinue: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const saving = state === 'saving';

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-5 py-3.5 backdrop-blur dark:border-white/[0.08] dark:bg-zinc-900/95 sm:px-6">
      <p aria-live="polite" className="text-xs">
        {saving && (
          <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving…
          </span>
        )}
        {!saving && state === 'saved' && (
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" aria-hidden /> Saved
          </span>
        )}
        {!saving && state === 'error' && (
          <span className="flex items-center gap-1.5 text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {error || 'Could not save'}
          </span>
        )}
        {!saving && state !== 'saved' && state !== 'error' && dirty && (
          <span className="text-zinc-500 dark:text-zinc-400">Unsaved changes</span>
        )}
        {!saving && state !== 'saved' && state !== 'error' && !dirty && (
          <span className="text-zinc-400 dark:text-zinc-500">All changes saved</span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={isFirst || saving}>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onSave} disabled={!dirty || saving}>
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-3.5 w-3.5" aria-hidden />
          )}
          Save
        </Button>
        <Button type="button" size="sm" onClick={onContinue} disabled={saving}>
          {isLast ? 'Finish' : 'Continue'}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function EmptyValue({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">{children}</span>;
}

export function KeyValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-right text-xs font-medium text-zinc-800 dark:text-zinc-200">{children}</span>
    </div>
  );
}

'use client';

import { ReactNode } from 'react';

interface ProfileFormProps {
  title: string;
  description: string;
  fields: { name: string; label: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string }[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  children?: ReactNode;
}

export default function ProfileForm({ title, description, fields, submitLabel, isSubmitting, onSubmit, children }: ProfileFormProps) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-raised)] p-6">
      <h3 className="font-display font-semibold text-base text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      <form onSubmit={onSubmit} className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name} className={field.name === 'bio' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">{field.label}</label>
              {field.type === 'textarea' || field.name === 'bio' ? (
                <textarea
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2"
                />
              )}
            </div>
          ))}
          {children}
        </div>
        {submitLabel && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary)] text-[var(--on-primary)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting && <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

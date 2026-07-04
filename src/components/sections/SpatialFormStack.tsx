'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';
import { Button } from '@/components/ui/button';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  error?: string;
}

type SpatialFormStackProps = React.HTMLAttributes<HTMLDivElement> & {
  fields: FormField[];
  submitLabel: string;
  helperText?: string;
  loading?: boolean;
  error?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
};

const SpatialFormStack = React.forwardRef<HTMLDivElement, SpatialFormStackProps>(
  (
    {
      className,
      fields,
      submitLabel,
      helperText,
      loading = false,
      error,
      onSubmit,
      ...props
    },
    ref
  ) => {
    return (
      <SpatialSection ref={ref} elevation={2} spacing="md" className={className} {...props}>
        {error && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-error">*</span>
                  )}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className={cn(
                      'w-full rounded-lg border border-default bg-raised px-4 py-2.5 text-text-primary placeholder:text-text-muted',
                      'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      field.error && 'border-error focus:border-error focus:ring-error/20'
                    )}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    className={cn(
                      'w-full rounded-lg border border-default bg-raised px-4 py-2.5 text-text-primary',
                      'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      field.error && 'border-error focus:border-error focus:ring-error/20'
                    )}
                  >
                    <option value="">{field.placeholder || 'Select an option'}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      className={cn(
                        'h-4 w-4 rounded border-default text-primary focus:ring-primary',
                        field.error && 'border-error'
                      )}
                    />
                    <span className="text-sm text-text-secondary">{field.placeholder}</span>
                  </div>
                ) : (
                  <input
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={cn(
                      'w-full rounded-lg border border-default bg-raised px-4 py-2.5 text-text-primary placeholder:text-text-muted',
                      'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      field.error && 'border-error focus:border-error focus:ring-error/20'
                    )}
                  />
                )}
                {field.error && (
                  <p className="mt-1.5 text-sm text-error">{field.error}</p>
                )}
              </div>
            ))}
          </div>
          {helperText && (
            <p className="text-sm text-text-muted">{helperText}</p>
          )}
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : submitLabel}
            </Button>
          </div>
        </form>
      </SpatialSection>
    );
  }
);

SpatialFormStack.displayName = 'SpatialFormStack';

export { SpatialFormStack };

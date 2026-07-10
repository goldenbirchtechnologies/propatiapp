"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

function Select({ className, options, placeholder, onValueChange, children, ...props }: SelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.onChange) {
      (props as Record<string, unknown>).onChange(event);
    }
    if (onValueChange) {
      onValueChange(event.target.value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <select
        data-slot="select"
        className={cn(
          "flex h-9 items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
          "focus:outline-none focus:ring-2 focus:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none"
        )}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[18px]">
        expand_more
      </span>
    </div>
  );
}

const SelectTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const SelectValue = ({ children, placeholder }: { children?: React.ReactNode; placeholder?: string }) => (
  <>
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {children}
  </>
);
const SelectContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value?: string; children?: React.ReactNode }) => (
  <option value={value}>{children}</option>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

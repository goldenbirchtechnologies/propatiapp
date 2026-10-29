import { ReactNode } from 'react';

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-outline-variant/70 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider ${className ?? ''}`}>
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      {children}
    </div>
  );
}

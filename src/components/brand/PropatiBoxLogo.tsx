'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PropatiBoxLogoProps {
  variant?: 'horizontal' | 'iconOnly';
  size?: 'sm' | 'md' | 'lg';
  withTM?: boolean;
  className?: string;
  href?: string | null;
  iconClassName?: string;
  textClassName?: string;
}

const sizeMap = {
  sm: { icon: 30, textH: 18, gap: 8 },
  md: { icon: 36, textH: 22, gap: 10 },
  lg: { icon: 48, textH: 28, gap: 12 },
};

function Icon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* House roof - solid blue */}
      <path d="M32 5 L59 24.5 L55.2 28.2 L32 10.5 L8.8 28.2 L5 24.5 Z" fill="#1565C0" />
      {/* House body - thick blue walls with gap for key */}
      <path
        d="M11.5 27.5 H52.5 V40.8 C52.5 43.2 50.6 45.6 47.4 45.6 H38.5 V38.8 H47.4 C48.4 38.8 49 38 49 37 V27.5 H15 V37 C15 38 15.6 38.8 16.6 38.8 H23.5 V45.6 H16.6 C13.2 45.6 11.5 43.1 11.5 40.8 V27.5 Z"
        fill="#1565C0"
      />
      {/* Right wall darker for depth */}
      <path d="M38.5 38.8 H47.4 C48.4 38.8 49 38 49 37 V27.5 H52.5 V40.8 C52.5 43.2 50.6 45.6 47.4 45.6 H38.5 V38.8 Z" fill="#0E4DA0" opacity="0.95" />
      {/* Windows 2x2 */}
      <rect x="21.5" y="19.2" width="8.2" height="7.2" rx="1.2" fill="#0E4DA0" />
      <rect x="31.3" y="19.2" width="8.2" height="7.2" rx="1.2" fill="#0E4DA0" />
      <rect x="21.5" y="27.8" width="8.2" height="7.2" rx="1.2" fill="#0E4DA0" />
      <rect x="31.3" y="27.8" width="8.2" height="7.2" rx="1.2" fill="#0E4DA0" />
      {/* Key shaft - lime green, emerges from left-bottom of house */}
      <path
        d="M23.5 38.8 V45.6 C20.2 45.6 17.5 48.0 17.5 51.2 C17.5 51.2 17.5 45.6 23.5 45.6 Z"
        fill="#8CC63F"
      />
      {/* Key vertical stem */}
      <rect x="23.5" y="45.6" width="8.5" height="16.5" rx="2.2" fill="#8CC63F" />
      {/* Key blade bottom with bitting (3 teeth on right) */}
      <path
        d="M23.5 62.1 V63.8 C23.5 65.1 24.1 66.1 25.2 66.7 L28.0 68.0 L30.8 66.7 C31.9 66.1 32.5 65.1 32.5 63.8 V62.1 H23.5 Z
           M32.5 54.5 L36.8 58.0 L32.5 61.5 Z
           M32.5 58.0 L36.8 61.5 L32.5 65.0 Z"
        fill="#8CC63F"
        stroke="#7AB334"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* Key groove - dark line */}
      <rect x="27.0" y="48.2" width="1.7" height="15.2" rx="0.85" fill="#111827" />
    </svg>
  );
}

function Wordmark({ height, withTM }: { height: number; withTM?: boolean }) {
  return (
    <svg
      height={height}
      viewBox={withTM ? '0 0 232 32' : '0 0 216 32'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <text
        x="0"
        y="24.5"
        fontFamily="Inter, Poppins, ui-sans-serif, sans-serif"
        fontWeight="800"
        fontSize="29"
        letterSpacing="-1.4"
        fill="#8CC63F"
      >
        PropatiBox
      </text>
      {withTM && (
        <text
          x="217"
          y="10"
          fontFamily="Inter, ui-sans-serif, sans-serif"
          fontWeight="600"
          fontSize="9"
          fill="#8CC63F"
        >
          TM
        </text>
      )}
    </svg>
  );
}

export default function PropatiBoxLogo({
  variant = 'horizontal',
  size = 'md',
  withTM = false,
  className,
  href = '/',
  iconClassName,
  textClassName,
}: PropatiBoxLogoProps) {
  const dims = sizeMap[size];
  return (
    <LinkOrSpan href={href} ariaLabel="PropatiBox home">
      <span className={cn('inline-flex items-center', className)} style={{ gap: variant === 'horizontal' ? dims.gap : 0 }}>
        <span className={cn('inline-flex shrink-0', iconClassName)}>
          <Icon size={dims.icon} />
        </span>
        {variant === 'horizontal' && (
          <span className={cn('inline-flex items-center', textClassName)}>
            <Wordmark height={dims.textH} withTM={withTM} />
          </span>
        )}
      </span>
    </LinkOrSpan>
  );
}

function LinkOrSpan({ href, children, ariaLabel }: { href: string | null; children: React.ReactNode; ariaLabel: string }) {
  if (href === null) return <span aria-label={ariaLabel}>{children}</span>;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function PropatiBoxIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0', className)}>
      <Icon size={size} />
    </span>
  );
}

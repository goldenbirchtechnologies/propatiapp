'use client';

import React from 'react';
import Link from 'next/link';

interface PropatiboxLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  href?: string;
}

export function PropatiboxLogo({
  size = 36,
  showText = true,
  className = '',
  href = '/dashboard',
}: PropatiboxLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 overflow-hidden ${className}`}>
      <video
        src="/brand/Transform_static_logo_into_motion_202608041922.mp4"
        poster="/brand/propatibox-logo-dark.jpg"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-lg object-cover shrink-0 bg-[#0A0F18]"
      />
      {showText && (
        <span className="font-bold text-base tracking-tight text-foreground truncate">
          PROPATI<span className="text-[#C8A45C]">BOX</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

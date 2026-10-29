import { ReactNode } from 'react';
import { StitchHeader, StitchFooter } from '@/components/layout/stitch-layout';

export default function StitchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <StitchHeader />
      <main>{children}</main>
      <StitchFooter />
    </div>
  );
}

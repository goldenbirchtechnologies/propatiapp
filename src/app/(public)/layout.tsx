import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { StitchHeader, StitchFooter } from '@/components/layout/stitch-layout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StitchHeader />
      <main className="flex-1 bg-background">{children}</main>
      <StitchFooter />
    </div>
  );
}

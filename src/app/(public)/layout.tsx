import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { StitchHeader, StitchFooter } from '@/components/layout/stitch-layout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StitchHeader />
      <main className="flex-1 bg-white">{children}</main>
      <StitchFooter />
    </div>
  );
}

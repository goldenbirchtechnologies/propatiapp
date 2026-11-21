import { StitchHeader, StitchFooter } from '@/components/layout/stitch-layout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // theme-landing is what every public page's markup is written against: dark
    // surfaces, #ededed text, #a1a1aa muted. Without it the tokens resolve from the
    // light :root block and the hardcoded dark heroes render near-black-on-black.
    <div className="app-layout theme-landing flex min-h-screen flex-col bg-background text-foreground">
      <StitchHeader />
      <main id="main-content" className="flex-1 bg-background pt-20">{children}</main>
      <StitchFooter />
    </div>
  );
}

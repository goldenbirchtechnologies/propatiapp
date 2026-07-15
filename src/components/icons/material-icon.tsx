"use client";
import React from "react";

const FALLBACKS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  bed: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M21 10H3"/><path d="M7 10V7h10v3"/></svg>,
  bathtub: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16a1 1 0 011 1v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h3v2.25"/></svg>,
  square_foot: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  meeting_room: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-3-1.5V11"/></svg>,
  local_parking: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M7 3v6h10V3"/></svg>,
  pool: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M2 17c1.5-1.5 3.5-1 6 0s4.5 1 6 0 3.5-1 6 0"/></svg>,
  location_on: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-7-10a5 5 0 0110-2.9A5 5 0 0119 11c0 5.5-7 10-7 10z"/><circle cx="12" cy="11" r="2"/></svg>,
  arrow_forward: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  arrow_back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>,
  chevron_left: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>,
  chevron_right: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  filter_list: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l7 8.26V19l3 3.74V16.26L22 3z"/></svg>,
};

type MaterialIconProps = { name: string; className?: string };

export default function MaterialIcon({ name, className = "material-symbols-outlined" }: MaterialIconProps) {
  const [missing, setMissing] = React.useState(false);
  const Comp = missing ? FALLBACKS[name] : null;

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (typeof window !== "undefined") {
      const check = () => setMissing(!Array.from(document.fonts).some(f => "Material Symbols Outlined" in f.family));
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => setTimeout(check, 50));
      } else {
        t = setTimeout(check, 600);
      }
    }
    return () => clearTimeout(t);
  }, [name]);

  if (Comp) {
    return <Comp className={className} aria-hidden="true" focusable="false" />;
  }
  return <span className={className} aria-hidden="true" focusable="false">{name}</span>;
}

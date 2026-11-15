'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Keys for the floating overlays that live in the global header. Only one may
 * be open at a time, so opening the notification panel automatically closes the
 * profile dropdown (and vice versa), preventing the overlapping-popover problem.
 */
export type HeaderOverlayKey = 'notifications' | 'profile';

interface HeaderOverlayContextValue {
  /** Open an overlay, closing any other that is currently open. */
  openOverlay: (key: HeaderOverlayKey) => void;
  /** Close an overlay if it is the one currently open. */
  closeOverlay: (key: HeaderOverlayKey) => void;
  /** Whether the given overlay is currently open. */
  isOpen: (key: HeaderOverlayKey) => boolean;
}

const HeaderOverlayContext =
  createContext<HeaderOverlayContextValue | null>(null);

/**
 * Coordinates the header's floating overlays (notification panel, profile
 * dropdown) so they are never open simultaneously. Mount once above both.
 */
export function HeaderOverlayProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<HeaderOverlayKey | null>(null);

  const openOverlay = (key: HeaderOverlayKey) => setOpen(key);
  const closeOverlay = (key: HeaderOverlayKey) =>
    setOpen((prev) => (prev === key ? null : prev));
  const isOpen = (key: HeaderOverlayKey) => open === key;

  return (
    <HeaderOverlayContext.Provider value={{ openOverlay, closeOverlay, isOpen }}>
      {children}
    </HeaderOverlayContext.Provider>
  );
}

export function useHeaderOverlay(key: HeaderOverlayKey) {
  const ctx = useContext(HeaderOverlayContext);
  const [internal, setInternal] = useState(false);

  const isOpen = ctx ? ctx.isOpen(key) : internal;
  const setOpen = (next: boolean) => {
    if (ctx) {
      if (next) ctx.openOverlay(key);
      else ctx.closeOverlay(key);
    } else {
      setInternal(next);
    }
  };

  return { isOpen, setOpen, ctx };
}

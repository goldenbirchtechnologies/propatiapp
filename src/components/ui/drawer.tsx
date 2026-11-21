"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <div
      data-slot="drawer"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-zinc-950/55 supports-[backdrop-filter]:backdrop-blur-[3px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 h-full w-full max-w-xl overflow-y-auto rounded-l-[1.125rem] border-l border-zinc-200/90 bg-background shadow-[-8px_0_30px_rgb(0,0,0,0.14)] transition-transform duration-200 dark:border-white/[0.10]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {children}
      </div>
    </div>
  );
}

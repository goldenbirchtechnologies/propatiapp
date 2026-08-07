"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return (
    <div
      data-slot="drawer"
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-black/10 transition-opacity duration-100",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "absolute inset-y-0 right-0 h-full w-full max-w-xl border-l border-outline-variant bg-background shadow-xl transition-transform duration-100",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {children}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Attachment({ className, orientation = "horizontal", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      data-slot="attachment"
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    />
  );
}

function AttachmentMedia({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "image" | "icon" }) {
  return (
    <div
      data-slot="attachment-media"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted",
        props.variant === "image" ? "size-24" : "size-10",
        className
      )}
      {...props}
    />
  );
}

function AttachmentContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="attachment-content" className={cn("flex-1 text-sm", className)} {...props} />;
}

function AttachmentTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="attachment-title" className={cn("font-medium", className)} {...props} />;
}

function AttachmentDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="attachment-description" className={cn("text-muted-foreground text-xs", className)} {...props} />;
}

function AttachmentActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="attachment-actions" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />;
}

function AttachmentAction({ className, size = "default", variant = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "default" | "icon-sm" | "icon"; variant?: "default" | "secondary" | "ghost" }) {
  return (
    <button
      data-slot="attachment-action"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        size === "icon-sm" && "size-8",
        size === "icon" && "size-9",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      type="button"
      {...props}
    />
  );
}

export {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
};

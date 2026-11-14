import * as React from "react"

import { cn } from "@/lib/utils"

type EmptyStateSize = "sm" | "md" | "lg"
type EmptyStateVariant = "plain" | "bordered" | "filled"

interface EmptyStateProps {
  /**
   * Either a rendered element (`<Bell className="h-5 w-5" />`) or a component
   * reference (`Scale`). When a component is passed it is rendered at the
   * canonical glyph size; a rendered element keeps whatever size it carries.
   */
  icon?: React.ReactNode | React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  size?: EmptyStateSize
  variant?: EmptyStateVariant
  className?: string
}

const SIZES: Record<EmptyStateSize, { root: string; glyph: string; title: string; description: string }> = {
  sm: {
    root: "gap-1 px-4 py-8",
    glyph: "mb-3 h-9 w-9 rounded-lg",
    title: "text-sm",
    description: "text-xs",
  },
  md: {
    root: "gap-1.5 px-6 py-12",
    glyph: "mb-4 h-12 w-12 rounded-xl",
    title: "text-base",
    description: "text-sm",
  },
  lg: {
    root: "gap-2 px-6 py-16",
    glyph: "mb-4 h-14 w-14 rounded-2xl",
    title: "text-lg",
    description: "text-sm",
  },
}

const VARIANTS: Record<EmptyStateVariant, string> = {
  plain: "",
  bordered: "rounded-xl border border-dashed border-border",
  filled: "rounded-xl border border-dashed border-border bg-muted/40",
}

function renderGlyph(icon: EmptyStateProps["icon"], glyphClassName: string) {
  if (!icon) return null

  const content = React.isValidElement(icon)
    ? icon
    : React.createElement(icon as React.ElementType, {
        className: "h-5 w-5",
        "aria-hidden": true,
      })

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-muted text-muted-foreground",
        glyphClassName
      )}
    >
      {content}
    </div>
  )
}

/**
 * The single empty-state primitive for the app. Every dashboard role renders
 * zero-data states through this component; role-specific wrappers
 * (`AgentEmptyState`, `OpsEmptyState`, `FinanceEmptyState`) are presets over it
 * and must not re-implement the layout.
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  variant = "plain",
  className,
}: EmptyStateProps) {
  const sizing = SIZES[size]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizing.root,
        VARIANTS[variant],
        className
      )}
    >
      {renderGlyph(icon, sizing.glyph)}
      <h3 className={cn("font-semibold text-foreground", sizing.title)}>{title}</h3>
      {description && (
        <p className={cn("max-w-md text-muted-foreground", sizing.description)}>{description}</p>
      )}
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps, EmptyStateSize, EmptyStateVariant }

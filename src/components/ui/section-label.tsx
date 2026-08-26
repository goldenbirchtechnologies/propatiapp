import * as React from "react"

import { cn } from "@/lib/utils"

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full",
        className
      )}
    >
      {children}
    </span>
  )
}

export { SectionLabel }

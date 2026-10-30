import * as React from "react"

import { cn } from "@/lib/utils"

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#4edea3] bg-primary/10 border border-primary/20 rounded-full",
        className
      )}
    >
      {children}
    </span>
  )
}

export { SectionLabel }

import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  color?: string
  className?: string
}

function Progress({ value, color = "#10b981", className }: ProgressProps) {
  return (
    <div className={cn("h-1.5 bg-zinc-800 rounded-full overflow-hidden w-full", className)}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  )
}

export { Progress }

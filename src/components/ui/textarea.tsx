import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Same filled surface as Input — see the note there.
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-zinc-50 px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground hover:bg-zinc-100/80 focus-visible:bg-white focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/[0.04] dark:hover:bg-white/[0.07] dark:focus-visible:bg-white/[0.02] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

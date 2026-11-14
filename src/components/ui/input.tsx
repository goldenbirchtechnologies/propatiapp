import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // A filled surface, not `bg-transparent`: against a white card a
        // hairline border alone reads as body text, so people do not realise
        // the field is editable. Literal zinc to match the cards on the
        // dashboard (see TenantProfileClient); the value of --muted here is a
        // text colour, so it must not be used as a background.
        "h-9 w-full min-w-0 rounded-md border border-input bg-zinc-50 px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:bg-zinc-100/80 focus-visible:bg-white focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/[0.04] dark:hover:bg-white/[0.07] dark:focus-visible:bg-white/[0.02] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }

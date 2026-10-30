import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white hover:bg-primary",
        secondary: "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
        outline: "border-zinc-200 bg-white/80 text-zinc-700 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-500",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        gold: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        rent: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
        lease: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40",
        sale: "border-primary/20 bg-primary/10 text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#6ffbbe] dark:border-primary/40",
        shortlet: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        roomshare: "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40",
        obsidian: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        diamond: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
        silver: "border-zinc-400/20 bg-zinc-400/10 text-zinc-600 dark:bg-zinc-400/20 dark:text-zinc-300 dark:border-zinc-400/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

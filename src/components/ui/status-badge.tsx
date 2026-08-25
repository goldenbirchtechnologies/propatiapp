import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      status: {
        // Success family
        Active: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Verified: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Approved: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Completed: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Paid: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Resolved: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Closed: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        Occupied: "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
        // Destructive family
        Overdue: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40",
        Rejected: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40",
        Failed: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40",
        Suspended: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40",
        Hot: "border-transparent bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40",
        // Warning / Pending family
        Pending: "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        "Pending Review": "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        "Under Review": "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        Notice: "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        Maintenance: "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        Negotiation: "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        "Additional Info Needed": "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        // Info family
        "In Review": "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        "In Progress": "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        Processing: "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        New: "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        "Offer Made": "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        "Due Diligence": "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40",
        "Viewing Scheduled": "border-transparent bg-neutral-800 text-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600",
        // Default / neutral
        Vacant: "border-neutral-700 bg-neutral-800 text-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600",
        // Specialty
        Featured: "border-transparent bg-amber-500/10 text-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        Premium: "border-transparent bg-blue-500/10 text-blue-400 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
      },
    },
    defaultVariants: {
      status: "Vacant",
    },
  }
)

function StatusBadge({
  className,
  status,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants> & {
    status?: string
  }) {
  const resolvedStatus = (status ?? "Vacant") as keyof typeof statusBadgeVariants.variants.status

  return (
    <span
      data-slot="status-badge"
      data-status={resolvedStatus}
      className={cn(statusBadgeVariants({ status: resolvedStatus }), className)}
      {...props}
    />
  )
}

export { StatusBadge, statusBadgeVariants }

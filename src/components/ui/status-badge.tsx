import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type StatusKey =
  | 'Active' | 'Verified' | 'Approved' | 'Completed' | 'Paid' | 'Resolved' | 'Closed' | 'Occupied'
  | 'Overdue' | 'Rejected' | 'Failed' | 'Suspended' | 'Hot'
  | 'Pending' | 'Pending Review' | 'Under Review' | 'Notice' | 'Maintenance' | 'Negotiation'
  | 'Additional Info Needed' | 'In Review' | 'In Progress' | 'Processing' | 'New'
  | 'Offer Made' | 'Due Diligence' | 'Viewing Scheduled'
  | 'Vacant' | 'Featured' | 'Premium';

const statusBadgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      status: {
        // Success family
        Active: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Verified: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Approved: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Completed: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Paid: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Resolved: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Closed: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
        Occupied: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#4edea3] dark:border-primary/40",
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
        "Viewing Scheduled": "border-transparent bg-zinc-100 text-zinc-700 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600",
        // Default / neutral
        Vacant: "border-zinc-200 bg-zinc-100 text-zinc-700 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600",
        // Specialty
        Featured: "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
        Premium: "border-transparent bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
      },
    },
    defaultVariants: {
      status: "Vacant",
    },
  }
)

// Snake_case / kebab / lowercase callers (in_escrow, pending_review, paid)
// previously fell through to the "Vacant" default, so every unmapped status
// rendered as a neutral grey badge. Normalise before lookup, and fall back by
// keyword family instead of silently rendering "Vacant".
const NORMALISED: Record<string, StatusKey> = {
  in_escrow: 'Processing',
  inescrow: 'Processing',
  escrow: 'Processing',
  open: 'Pending',
  pending_review: 'Pending Review',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  in_review: 'In Review',
  not_started: 'Pending',
  fully_signed: 'Completed',
  tenant_signed: 'In Progress',
  landlord_signed: 'In Progress',
  draft: 'Pending',
  success: 'Paid',
  settled: 'Paid',
  released: 'Paid',
  withdrawn: 'Paid',
  shortlisted: 'New',
  rejected: 'Rejected',
  cancelled: 'Suspended',
  frozen: 'Suspended',
  verified: 'Verified',
  approved: 'Approved',
  resolved: 'Resolved',
  closed: 'Closed',
  occupied: 'Occupied',
  vacant: 'Vacant',
};

// Explicit key list — cva does not expose `.variants` at runtime, so the
// variant names must be mirrored here for lookup.
const KNOWN_STATUSES = new Set([
  'Active', 'Verified', 'Approved', 'Completed', 'Paid', 'Resolved', 'Closed', 'Occupied',
  'Overdue', 'Rejected', 'Failed', 'Suspended', 'Hot',
  'Pending', 'Pending Review', 'Under Review', 'Notice', 'Maintenance', 'Negotiation', 'Additional Info Needed',
  'In Review', 'In Progress', 'Processing', 'New', 'Offer Made', 'Due Diligence', 'Viewing Scheduled',
  'Vacant', 'Featured', 'Premium',
]);

function resolveStatus(status?: string): StatusKey {
  if (!status) return 'Vacant';
  const snake = status.replace(/[-\s]/g, '_').toLowerCase();

  if (NORMALISED[snake]) return NORMALISED[snake];

  // Exact match (covers "In Progress", "Pending Review", "Under Review")
  if (KNOWN_STATUSES.has(status)) return status as StatusKey;
  const titled = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (KNOWN_STATUSES.has(titled)) return titled as StatusKey;

  // Keyword family fallback
  if (/fail|error|reject|suspend|ban|overdue|urgent/.test(snake)) return 'Failed';
  if (/paid|complete|approv|verif|success|resolved|active|closed/.test(snake)) return 'Completed';
  if (/progress|review|process|pending|open|draft|escrow/.test(snake)) return 'Pending';
  return 'Vacant';
}

function StatusBadge({
  className,
  status,
  ...props
}: Omit<React.ComponentProps<"span">, 'status'> &
  Omit<VariantProps<typeof statusBadgeVariants>, 'status'> & {
    // Any backend status string is accepted; resolveStatus() normalises it to a
    // styled variant (snake_case, kebab-case, lowercase, or Title Case).
    status?: string
  }) {
  const resolvedStatus = resolveStatus(status)

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

import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  // "up"/"down"/"flat" render the standard trend arrow; any other string is
  // rendered verbatim as the trend label (call sites use both conventions).
  trend?: "up" | "down" | "flat" | string
  trendValue?: string | null | undefined
  icon?: React.ElementType | React.ReactNode
  accentColor?: string
  className?: string
  href?: string
}

function StatCard({
  label,
  value,
  sub,
  trend,
  trendValue,
  icon,
  accentColor = "#10b981",
  className,
  href,
}: StatCardProps) {
  const isDirection = trend === "up" || trend === "down" || trend === "flat"
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-zinc-400"

  // Accept both `icon={Users}` (component) and `icon={<Users />}` (element) —
  // call sites use both, and the element form is not a valid component.
  const iconNode = React.isValidElement(icon)
    ? icon
    : icon
      ? React.createElement(icon as React.ElementType, { size: 15, style: { color: accentColor } })
      : null

  const content = (
    <div className={cn("glass-card p-5 flex flex-col gap-3 hover:border-white/15 transition-colors", className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
        {iconNode && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}15` }}
          >
            {iconNode}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {(sub || trendValue || trend) && (
        <div className="flex items-center gap-2">
          {trendValue && (
            <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              {isDirection && <TrendIcon size={12} />}
              {trendValue}
            </span>
          )}
          {/* A non-directional `trend` is a plain label, e.g. trend="Pending review" */}
          {!trendValue && trend && !isDirection && (
            <span className="text-xs font-medium text-zinc-500">{trend}</span>
          )}
          {sub && <span className="text-xs text-zinc-600">{sub}</span>}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}

export { StatCard }

import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: "up" | "down" | "flat"
  trendValue?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  accentColor?: string
  className?: string
}

function StatCard({
  label,
  value,
  sub,
  trend,
  trendValue,
  icon: Icon,
  accentColor = "#10b981",
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
        ? "text-red-400"
        : "text-zinc-400"

  return (
    <div
      className={cn(
        "glass-card p-5 flex flex-col gap-3 hover:border-white/15 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}15` }}
          >
            <Icon size={15} className="text-emerald-400" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {(sub || trendValue) && (
        <div className="flex items-center gap-2">
          {trendValue && trend && (
            <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon size={12} />
              {trendValue}
            </span>
          )}
          {sub && <span className="text-xs text-zinc-600">{sub}</span>}
        </div>
      )}
    </div>
  )
}

export { StatCard }

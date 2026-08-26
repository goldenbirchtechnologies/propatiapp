import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

interface StarRatingProps {
  count?: number
  className?: string
}

function StarRating({ count = 5, className }: StarRatingProps) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-emerald-500 text-emerald-500" />
      ))}
    </div>
  )
}

export { StarRating }

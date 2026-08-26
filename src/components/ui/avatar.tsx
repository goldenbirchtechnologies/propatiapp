import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  children?: React.ReactNode
}

function Avatar({ src, name, size = "md", className, children }: AvatarProps) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  }

  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? ""

  if (children) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden border-2 border-zinc-800 flex-shrink-0",
          sizes[size],
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden border-2 border-zinc-800 flex-shrink-0",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-semibold">
          {initials}
        </div>
      )}
    </div>
  )
}

interface AvatarImageProps {
  src?: string
  alt?: string
  className?: string
}

function AvatarImage({ src, alt, className }: AvatarImageProps) {
  if (!src) return null
  return <img src={src} alt={alt} className={cn("w-full h-full object-cover", className)} />
}

interface AvatarFallbackProps {
  children?: React.ReactNode
  className?: string
}

function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "w-full h-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-semibold",
        className
      )}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }

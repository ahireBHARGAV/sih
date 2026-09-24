import * as React from "react"
import { cn } from "@/lib/utils"

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement>

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-[#E6E6E2] bg-white p-6 text-ink-900",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

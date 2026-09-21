import * as React from "react"
import { cn } from "@/lib/utils"

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement>

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[28px] border border-orange-500/20 bg-white/55 backdrop-blur-xl shadow-[0_8px_32px_rgba(33,26,20,0.08)] p-6 text-[#211A14]",
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

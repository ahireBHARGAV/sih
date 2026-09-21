import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-lg border border-borderSoft bg-surface px-4 py-2 text-base text-charcoal transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-charcoal disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surfaceDim disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }

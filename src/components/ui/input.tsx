import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-2xl border border-[#E6E6E2] bg-white px-4 py-2 text-base text-ink-900 transition-colors outline-none placeholder:text-ink-400 focus-visible:border-ink-900 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }

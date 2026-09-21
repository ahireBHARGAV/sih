import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[20px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white hover:bg-orange-700",
        secondary: "bg-white/55 border border-orange-500/20 text-orange-700 backdrop-blur-xl shadow-[0_8px_32px_rgba(33,26,20,0.08)] hover:bg-white/70",
        accent: "bg-orange-300 text-ink-900 hover:bg-orange-300/90",
        ghost: "hover:bg-white/55 text-ink-900",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        link: "text-orange-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs rounded-xl",
        lg: "h-14 px-8 text-base rounded-[24px]",
        icon: "size-12 rounded-[20px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

import { MagneticWrapper } from "@/components/magnetic-wrapper"

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const button = (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )

  if (variant === "default") {
    return <MagneticWrapper>{button}</MagneticWrapper>
  }

  return button
}

export { Button, buttonVariants }

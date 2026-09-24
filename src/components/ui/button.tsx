import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ink-900 text-white hover:bg-ink-900/90",
        secondary: "bg-white border border-[#E6E6E2] text-ink-900 hover:bg-zinc-50",
        accent: "bg-primary text-white hover:bg-primary-hover",
        ghost: "hover:bg-zinc-100 text-ink-900",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        link: "text-ink-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs rounded-lg",
        lg: "h-14 px-8 text-base rounded-[12px]",
        icon: "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

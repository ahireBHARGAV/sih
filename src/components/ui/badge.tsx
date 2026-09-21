import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default: "bg-ivory border-orange-500/20 text-ink-900",
        unverified: "border-ink-600/30 text-ink-600 bg-transparent",
        mentorEndorsed: "border-orange-500/30 border-dashed text-orange-700 bg-orange-500/10",
        verified: "bg-orange-500 text-white border-transparent",
        industryVerified: "bg-gradient-to-r from-orange-700 to-ink-900 text-white border-transparent font-bold after:content-['✓'] after:ml-0.5",
        secondary: "bg-white/55 text-ink-900 border-orange-500/20",
        destructive: "bg-red-500 text-white border-transparent",
        outline: "text-ink-600 border-ink-600/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }

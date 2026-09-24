import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default: "bg-canvas text-ink-900 border-transparent",
        unverified: "border-ink-400 border-dashed text-ink-600 bg-transparent",
        mentorEndorsed: "border-ink-400 text-ink-900 bg-canvas",
        verified: "bg-ink-900 text-white border-transparent",
        industryVerified: "bg-primary text-white border-transparent font-bold after:content-['✓'] after:ml-0.5",
        secondary: "bg-white text-ink-900 border-[#E6E6E2]",
        destructive: "bg-red-500 text-white border-transparent",
        outline: "text-ink-600 border-[#E6E6E2]",
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

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 border border-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-accent text-accent bg-accent/10",
        secondary: "border-border text-muted-foreground bg-muted",
        destructive: "border-destructive text-destructive bg-destructive/10",
        outline: "border-foreground text-foreground",
        ghost: "text-muted-foreground",
        link: "text-foreground underline underline-offset-4 hover:text-accent",
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

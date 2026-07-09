import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-accent uppercase tracking-wider font-semibold py-2 gap-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-accent after:transition-transform after:duration-150 after:ease-[cubic-bezier(0.25,0,0,1)] hover:after:scale-x-110",
        outline:
          "border border-foreground text-foreground uppercase tracking-wider px-6 py-2 gap-2 hover:bg-foreground hover:text-background transition-colors duration-150",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150",
        ghost:
          "text-muted-foreground px-4 py-1 gap-2 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current after:scale-x-0 after:transition-transform after:duration-150 after:ease-[cubic-bezier(0.25,0,0,1)] hover:text-foreground hover:after:scale-x-100",
        destructive:
          "text-destructive uppercase tracking-wider font-semibold py-2 gap-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-destructive after:transition-transform after:duration-150 hover:after:scale-x-110",
        link: "text-foreground underline underline-offset-4 hover:text-accent transition-colors duration-150",
      },
      size: {
        default: "h-10",
        xs: "h-7 text-xs",
        sm: "h-8 text-xs",
        lg: "h-12 text-base",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
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

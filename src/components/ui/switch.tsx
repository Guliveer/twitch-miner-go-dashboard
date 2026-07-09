"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center border border-border transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 aria-invalid:border-destructive data-[size=default]:h-[20px] data-[size=default]:w-[34px] data-[size=sm]:h-[16px] data-[size=sm]:w-[26px] data-checked:bg-accent data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block bg-foreground transition-transform group-data-[size=default]/switch:size-[14px] group-data-[size=sm]/switch:size-[11px] group-data-[size=default]/switch:data-checked:translate-x-[calc(100%+3px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%+2px)] group-data-[size=default]/switch:data-unchecked:translate-x-[3px] group-data-[size=sm]/switch:data-unchecked:translate-x-[2px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

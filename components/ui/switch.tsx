"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Track: w-11 (44px), h-6 (24px), padding 2px her yandan → iç alan 40×20px
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-zinc-600",
      "data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Thumb: h-5 w-5 (20px) → track iç alan 40px, sağa translate = 40-20 = 20px
        "pointer-events-none block h-5 w-5 rounded-full shadow-md ring-0 transition-transform",
        "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0",
        "bg-white dark:bg-zinc-100"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

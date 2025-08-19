import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm shadow-sm backdrop-blur-sm transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-foreground",
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary-500 text-white shadow hover:bg-primary-600": variant === "default",
          "border-transparent bg-surface-700 text-slate-100 hover:bg-surface-600": variant === "secondary",
          "border-transparent bg-red-500/10 text-red-500 hover:bg-red-500/20": variant === "destructive",
          "border-transparent bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20": variant === "success",
          "border-transparent bg-amber-500/10 text-amber-400 hover:bg-amber-500/20": variant === "warning",
          "text-foreground border-white/10": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

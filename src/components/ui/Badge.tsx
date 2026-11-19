import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/[0.06] text-white/70 border-white/10",
  success: "bg-[#7ce38b]/10 text-[#a4edaf] border-[#7ce38b]/25",
  warning: "bg-[#e8c468]/10 text-[#f0d58e] border-[#e8c468]/25",
  danger: "bg-[#ff6b6b]/10 text-[#ff9a9a] border-[#ff6b6b]/25",
  outline: "bg-transparent text-white/70 border-white/15",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-white/50",
  success: "bg-[#7ce38b]",
  warning: "bg-[#e8c468]",
  danger: "bg-[#ff6b6b]",
  outline: "bg-white/50",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1.5",
  md: "text-[11px] px-2 py-0.5 gap-1.5",
};

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md border tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonVariant = "text" | "circular" | "rectangular";

export interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

export function SkeletonLoader({
  className,
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}: SkeletonLoaderProps) {
  const variantStyles: Record<SkeletonVariant, string> = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full shrink-0",
    rectangular: "rounded-xl",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-white/[0.07]",
        variantStyles[variant],
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/[0.03] border border-white/10 p-6 space-y-4",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <SkeletonLoader variant="circular" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader variant="text" className="w-1/2 h-4" />
          <SkeletonLoader variant="text" className="w-1/3 h-3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <SkeletonLoader variant="text" className="h-3.5 w-full" />
        <SkeletonLoader variant="text" className="h-3.5 w-4/5" />
      </div>
      <div className="pt-2 flex gap-2">
        <SkeletonLoader variant="rectangular" className="h-9 w-24 rounded-lg" />
        <SkeletonLoader variant="rectangular" className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

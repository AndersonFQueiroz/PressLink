import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Sistema do painel: o magenta do logo é preenchimento, nunca texto branco em
// cima (4,08:1 reprova AA). Texto de apoio usa `signal-soft` (11,4:1).
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "pl-sheen bg-signal text-ink hover:bg-signal-hover hover:shadow-[0_10px_28px_-12px_rgb(208_24_246/0.7)] active:bg-signal-press focus-visible:ring-signal/70",
  secondary:
    "bg-panel-raised text-panel-text border border-panel-line hover:border-panel-line-strong hover:bg-panel-raised-hover focus-visible:ring-white/30",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/15 focus-visible:ring-danger/50",
  ghost:
    "bg-transparent text-panel-muted hover:bg-white/[0.06] hover:text-panel-text focus-visible:ring-white/25",
  outline:
    "bg-transparent text-panel-text border border-panel-line hover:border-panel-line-strong hover:bg-white/[0.04] focus-visible:ring-white/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded",
  md: "h-9 px-3.5 text-[13px] gap-2 rounded",
  lg: "h-10 px-5 text-sm gap-2 rounded",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-150 cursor-pointer select-none active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg",
          "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

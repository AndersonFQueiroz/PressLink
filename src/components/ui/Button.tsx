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

// Sistema do painel: um único acento roxo como preenchimento. Texto de apoio
// usa o lilás `brand-soft` (contraste alto sobre o fundo escuro), nunca o roxo
// cheio, que é escuro demais para corpo de texto.
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover active:bg-[#5b21b6] focus-visible:ring-brand/70",
  secondary:
    "bg-white/[0.06] text-panel-text border border-white/10 hover:bg-white/[0.09] hover:border-white/15 focus-visible:ring-white/30",
  danger:
    "bg-[#ff6b6b]/10 text-[#ff9a9a] border border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/15 hover:text-[#ffb4b4] focus-visible:ring-[#ff6b6b]/50",
  ghost:
    "bg-transparent text-white/65 hover:bg-white/[0.06] hover:text-white focus-visible:ring-white/25",
  outline:
    "bg-transparent text-white/85 border border-white/15 hover:border-white/30 hover:bg-white/[0.04] focus-visible:ring-white/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-3.5 text-[13px] gap-2 rounded-lg",
  lg: "h-10 px-5 text-sm gap-2 rounded-lg",
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
          "inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer select-none",
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

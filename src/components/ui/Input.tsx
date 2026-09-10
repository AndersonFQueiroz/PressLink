import React, { useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floatingLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      floatingLabel = false,
      id,
      disabled,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    if (floatingLabel && label) {
      return (
        <div className="w-full flex flex-col gap-1.5">
          <div className="relative flex items-center">
            {leftIcon && (
              <div className="pointer-events-none absolute left-3.5 flex items-center text-white/40 z-10">
                {leftIcon}
              </div>
            )}
            <input
              ref={ref}
              id={inputId}
              type={type}
              disabled={disabled}
              placeholder=" "
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? errorId : helperText ? helperId : undefined
              }
              className={cn(
                "peer w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 pt-2 text-sm text-white placeholder-transparent",
                "transition-all duration-150 outline-none",
                "hover:border-white/20 focus:border-fuchsia-500 focus:bg-white/[0.06] focus:ring-1 focus:ring-fuchsia-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                leftIcon && "pl-10",
                (rightIcon || error) && "pr-10",
                error &&
                  "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500 text-rose-100 bg-rose-950/10",
                className,
              )}
              {...props}
            />
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-3.5 text-sm text-white/50 transition-all duration-150 pointer-events-none",
                "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm",
                "peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-fuchsia-300",
                "peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-wider",
                leftIcon ? "peer-placeholder-shown:left-10 peer-focus:left-3.5 peer-[&:not(:placeholder-shown)]:left-3.5" : "peer-placeholder-shown:left-3.5",
                error && "text-rose-400 peer-focus:text-rose-400",
              )}
            >
              {label}
            </label>
            <div className="absolute right-3.5 flex items-center gap-1.5">
              {error ? (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" aria-hidden="true" />
              ) : (
                rightIcon && <span className="text-white/40 shrink-0">{rightIcon}</span>
              )}
            </div>
          </div>
          {error ? (
            <p id={errorId} className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-xs text-white/40 mt-0.5">
              {helperText}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-white/70"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-white/40">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 text-sm text-white placeholder-white/30",
              "transition-all duration-150 outline-none",
              "hover:border-white/20 focus:border-fuchsia-500 focus:bg-white/[0.06] focus:ring-1 focus:ring-fuchsia-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              (rightIcon || error) && "pr-10",
              error &&
                "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500 text-rose-100 bg-rose-950/10",
              className,
            )}
            {...props}
          />

          <div className="absolute right-3.5 flex items-center gap-1.5">
            {error ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" aria-hidden="true" />
            ) : (
              rightIcon && <span className="text-white/40 shrink-0">{rightIcon}</span>
            )}
          </div>
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-white/40 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

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

const baseInput =
  "w-full h-10 rounded bg-panel-bg border border-panel-line px-3 text-[13px] text-panel-text placeholder-panel-muted/70 " +
  "transition-colors duration-150 outline-none hover:border-panel-line-strong " +
  "focus:border-signal focus:ring-2 focus:ring-signal/20 " +
  "disabled:opacity-45 disabled:cursor-not-allowed";

const baseError =
  "border-danger/50 focus:border-danger/70 focus:ring-danger/15 text-danger bg-danger/[0.04]";

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
              <div className="pointer-events-none absolute left-3.5 flex items-center text-panel-muted z-10">
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
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              className={cn(
                baseInput,
                "peer h-11 pt-2 placeholder-transparent",
                leftIcon && "pl-10",
                (rightIcon || error) && "pr-10",
                error && baseError,
                className,
              )}
              {...props}
            />
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-3.5 text-sm text-panel-muted transition-all duration-150 pointer-events-none",
                "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm",
                "peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-signal-soft",
                "peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:font-medium",
                leftIcon
                  ? "peer-placeholder-shown:left-10 peer-focus:left-3.5 peer-[&:not(:placeholder-shown)]:left-3.5"
                  : "peer-placeholder-shown:left-3.5",
                error && "text-[text-danger] peer-focus:text-[text-danger]",
              )}
            >
              {label}
            </label>
            <div className="absolute right-3.5 flex items-center gap-1.5">
              {error ? (
                <AlertCircle className="h-4 w-4 text-[text-danger] shrink-0" aria-hidden="true" />
              ) : (
                rightIcon && <span className="text-panel-muted shrink-0">{rightIcon}</span>
              )}
            </div>
          </div>
          {error ? (
            <p id={errorId} className="text-xs text-[text-danger] flex items-center gap-1">
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className="text-xs text-panel-muted">
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
            className="text-xs font-medium text-panel-muted"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-panel-muted">
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
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              baseInput,
              leftIcon && "pl-10",
              (rightIcon || error) && "pr-10",
              error && baseError,
              className,
            )}
            {...props}
          />

          <div className="absolute right-3.5 flex items-center gap-1.5">
            {error ? (
              <AlertCircle className="h-4 w-4 text-[text-danger] shrink-0" aria-hidden="true" />
            ) : (
              rightIcon && <span className="text-panel-muted shrink-0">{rightIcon}</span>
            )}
          </div>
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-[text-danger] flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-panel-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

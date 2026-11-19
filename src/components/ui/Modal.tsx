"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Mantém o foco dentro do diálogo (o menu do painel tem muitos links).
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // Foco inicial: primeiro campo/botão do diálogo, nunca no body.
      requestAnimationFrame(() => {
        const target = panelRef.current?.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href]',
        );
        target?.focus();
      });
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="pl-fade fixed inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "pl-pop relative z-10 w-full rounded-xl border border-panel-line bg-panel-raised p-6 shadow-2xl shadow-black/60",
          sizeStyles[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-4">
          <div className="space-y-1">
            {title && (
              <h2
                id={titleId}
                className="font-serif text-[22px] leading-tight text-panel-text"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13px] leading-relaxed text-panel-muted">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded p-1.5 text-panel-muted transition-colors hover:bg-white/[0.06] hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-[13px] text-panel-text">{children}</div>

        {footer && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-panel-line pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

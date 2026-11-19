"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "ghost" | "danger" | "pill";
}

export function LogoutButton({
  className,
  showText = true,
  variant = "pill",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const variantStyles = {
    pill: "rounded-lg border border-panel-line bg-transparent hover:bg-white/[0.06] text-panel-text hover:text-panel-text px-3.5 py-2 text-[12px] font-medium",
    default:
      "rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-panel-text border border-panel-line px-3.5 py-2 text-sm font-medium",
    ghost:
      "rounded-md bg-transparent hover:bg-panel-raised text-panel-muted hover:text-panel-text border border-transparent px-2 py-1.5 text-xs",
    danger:
      "rounded-lg bg-danger/10 hover:bg-danger/20 text-danger hover:text-[#ffb8b8] border border-danger/30 px-3.5 py-1.5 text-xs font-medium",
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      title="Sair da conta"
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60",
        variantStyles[variant],
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      {showText && <span>{isPending ? "Saindo..." : "Sair"}</span>}
    </button>
  );
}

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
    pill: "rounded-full border border-white/15 bg-white/[0.04] hover:bg-rose-500/15 hover:border-rose-500/40 text-white/80 hover:text-rose-300 px-4 py-2 text-xs font-semibold backdrop-blur-sm",
    default:
      "rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/90 border border-white/15 px-3.5 py-2 text-sm font-medium",
    ghost:
      "rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white border border-transparent px-3 py-1.5 text-xs",
    danger:
      "rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold",
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      title="Sair da conta"
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30",
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

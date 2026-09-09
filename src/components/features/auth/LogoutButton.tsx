"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "ghost" | "danger";
}

export function LogoutButton({
  className,
  showText = true,
  variant = "default",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const variantStyles = {
    default:
      "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50",
    ghost:
      "bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-transparent",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30",
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      title="Sair da conta"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/40",
        variantStyles[variant],
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {showText && <span>{isPending ? "Saindo..." : "Sair"}</span>}
    </button>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PressLinkLogo } from "@/components/brand/PressLinkLogo";

export const metadata: Metadata = {
  title: "Entrar | PressLink",
  description: "Acesse sua conta para gerenciar seu portfólio digital na PressLink.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-panel-text selection:bg-signal selection:text-ink">
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between border-b border-panel-line px-6 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="PressLink — início"
          className="rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
        >
          <PressLinkLogo size={22} />
        </Link>
        <Link
          href="/"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-panel-muted transition-colors hover:bg-white/[0.06] hover:text-panel-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Voltar ao início
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-[12px] text-panel-muted sm:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} PressLink · A pista é sua. O palco também.</p>
      </footer>
    </div>
  );
}

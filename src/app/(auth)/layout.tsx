import type { Metadata } from "next";
import Link from "next/link";
import { Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Autenticação | PressLink",
  description: "Acesse sua conta ou recupere seu acesso no PressLink.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-ink text-white overflow-hidden selection:bg-plum selection:text-white">
      {/* Background glow accents */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-plum/20 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-plum/10 blur-[120px]"
        aria-hidden="true"
      />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white no-underline transition-opacity hover:opacity-90"
        >
          <div className="w-9 h-9 rounded-lg bg-plum/25 border border-plum/50 flex items-center justify-center text-plum transition-transform group-hover:scale-105">
            <Headphones className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
            PressLink
          </span>
        </Link>
      </header>

      {/* Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} PressLink — Plataforma de Portfólios para DJs Freelancers.</p>
      </footer>
    </div>
  );
}

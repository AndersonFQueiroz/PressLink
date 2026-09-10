import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Entrar | presslink",
  description: "Acesse sua conta para gerenciar seu portfólio digital no presslink.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-ink text-white overflow-hidden selection:bg-fuchsia-500 selection:text-white">
      {/* Background radial glow accents matching landing page */}
      <div
        className="pointer-events-none absolute -right-36 top-1/4 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-fuchsia-600/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-36 bottom-10 h-[30rem] w-[30rem] rounded-full bg-fuchsia-700/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 sm:px-10 lg:px-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight transition hover:opacity-90"
        >
          press<span className="text-fuchsia-400">link</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/90 transition hover:border-white/50 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </Link>
      </header>

      {/* Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 sm:px-10 lg:px-16 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} presslink — A pista é sua. O palco também.</p>
      </footer>
    </div>
  );
}

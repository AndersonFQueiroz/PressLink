import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "@/components/features/auth/CadastroForm";

export const metadata: Metadata = {
  title: "Cadastro | PressLink",
  description: "Crie sua conta no PressLink",
};

export default function CadastroPage() {
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 sm:p-8 shadow-xl">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center justify-center text-xl font-bold tracking-tight">
              <span className="text-white">Press</span>
              <span className="text-fuchsia-400">Link</span>
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-white">Criar conta</h1>
            <p className="mt-1 text-sm text-white/60">Preencha os dados para começar seu portfólio</p>
          </div>
          <CadastroForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/40">Ao criar a conta você concorda com o tratamento de dados conforme a LGPD.</p>
      </div>
    </main>
  );
}

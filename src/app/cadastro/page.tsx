import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "@/components/features/auth/CadastroForm";

export const metadata: Metadata = {
  title: "Cadastro | PressLink",
  description: "Crie sua conta no PressLink",
};

export default function CadastroPage() {
  return (
    <div>
      <div className="rounded-xl border border-panel-line bg-panel-surface p-6 sm:p-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex font-display text-lg font-semibold tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            press<span className="text-brand-soft">link</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white">
            Criar conta
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">
            Leva poucos minutos. Você monta o perfil e publica quando quiser.
          </p>
        </div>

        <CadastroForm />
      </div>

      <p className="mt-5 text-center text-[12px] leading-relaxed text-white/30">
        Ao criar a conta você concorda com o tratamento de dados conforme a LGPD.
      </p>
    </div>
  );
}

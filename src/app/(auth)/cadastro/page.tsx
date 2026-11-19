import type { Metadata } from "next";
import { CadastroForm } from "@/components/features/auth/CadastroForm";

export const metadata: Metadata = {
  title: "Cadastro | PressLink",
  description: "Crie sua conta no PressLink",
};

export default function CadastroPage() {
  return (
    <div>
      <div className="rounded-lg border border-panel-line bg-panel-surface p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="font-serif font-bold text-[30px] leading-tight text-panel-text">
            Criar conta
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-panel-muted">
            Leva poucos minutos. Você monta o perfil e publica quando quiser.
          </p>
        </div>

        <CadastroForm />
      </div>

      <p className="mt-5 text-center text-[12px] leading-relaxed text-panel-muted">
        Ao criar a conta você concorda com o tratamento de dados conforme a LGPD.
      </p>
    </div>
  );
}

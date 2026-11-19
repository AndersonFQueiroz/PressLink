import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DangerZoneConta } from "@/components/features/painel/DangerZoneConta";
import { PageHeader } from "@/components/features/painel/PageHeader";

export const metadata: Metadata = {
  title: "Configurações | Painel PressLink",
  description: "Gerencie sua conta PressLink e exerça o direito de excluir seus dados (LGPD).",
};

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <PageHeader
        label="Conta"
        title="Conta"
        description="Seus dados de acesso e o encerramento da conta. A exclusão é definitiva e pode ser feita por aqui."
      />

      <section className="border-y border-panel-line">
        <dl className="divide-y divide-panel-line">
          <div className="py-4">
            <dt className="text-[12px] text-panel-muted">E-mail de acesso</dt>
            <dd className="mt-1 text-[13px] text-panel-text">{user?.email ?? "-"}</dd>
          </div>
          <div className="py-4">
            <dt className="text-[12px] text-panel-muted">Base legal (LGPD)</dt>
            <dd className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-panel-muted">
              Art. 18, VI — eliminação dos dados tratados com o consentimento do titular.
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-6">
        <DangerZoneConta email={user?.email ?? null} />
      </div>
    </div>
  );
}

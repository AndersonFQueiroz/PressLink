import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DangerZoneConta } from "@/components/features/painel/DangerZoneConta";

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
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="border-b border-white/10 pb-6 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Configurações
          </h1>
          <p className="mt-1.5 text-sm text-white/60 max-w-2xl leading-relaxed">
            Sua conta e seus dados no PressLink. A exclusão é definitiva e pode ser
            feita por aqui mesmo, sem precisar falar com o suporte.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              E-mail de acesso
            </dt>
            <dd className="mt-1 text-sm text-white/85">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Base legal (LGPD)
            </dt>
            <dd className="mt-1 text-sm text-white/85">
              Art. 18, VI — eliminação dos dados tratados com o consentimento do titular.
            </dd>
          </div>
        </dl>
      </div>

      <DangerZoneConta email={user?.email ?? null} />
    </div>
  );
}

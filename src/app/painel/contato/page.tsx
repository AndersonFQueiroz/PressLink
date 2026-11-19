import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContatoForm } from "@/components/features/painel/ContatoForm";
import { PageHeader } from "@/components/features/painel/PageHeader";

export const metadata: Metadata = {
  title: "Contato e Booking | Painel PressLink",
  description: "Configure seus canais oficiais de contato e e-mail para contratação e booking de datas.",
};

export default async function ContatoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultValues = undefined;
  if (user) {
    const { data } = await supabase
      .from("perfil")
      .select("whatsapp, email_booking")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (data) {
      defaultValues = {
        whatsapp: data.whatsapp ?? "",
        email_booking: data.email_booking ?? "",
      };
    }
  }

  return (
    <div>
      <PageHeader
        title="Contato público"
        description="Por onde produtores e contratantes falam com você. Esses botões ficam visíveis na página pública."
      />
      <div className="rounded-xl border border-panel-line bg-panel-surface p-5 sm:p-6">
        <ContatoForm defaultValues={defaultValues} />
      </div>
    </div>
  );
}

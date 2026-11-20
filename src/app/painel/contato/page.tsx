import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CampoFoco } from "@/components/features/painel/CampoFoco";
import { ContatoForm } from "@/components/features/painel/ContatoForm";
import { PageHeader } from "@/components/features/painel/PageHeader";
import { siteHost } from "@/lib/site";

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
  let preview = undefined;
  if (user) {
    const { data } = await supabase
      .from("perfil")
      .select("whatsapp, email_booking, nome_artistico, username, foto_url, biografia_pt")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (data) {
      defaultValues = {
        whatsapp: data.whatsapp ?? "",
        email_booking: data.email_booking ?? "",
      };
      preview = {
        nome: data.nome_artistico ?? "",
        username: data.username ?? "",
        fotoUrl: data.foto_url ?? "",
        bio: data.biografia_pt ?? "",
      };
    }
  }

  return (
    <div>
      <CampoFoco />
      <PageHeader
        label="Página"
        title="Contato público"
        description="Por onde produtores e contratantes falam com você. Esses botões ficam visíveis na página pública."
      />
      <div className="rounded-lg border border-panel-line bg-panel-surface p-5 sm:p-6">
        <ContatoForm defaultValues={defaultValues} preview={preview} origem={siteHost()} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "@/components/features/painel/PerfilForm";
import { PageHeader } from "@/components/features/painel/PageHeader";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultValues = undefined;
  if (user) {
    const { data } = await supabase.from("perfil").select("*").eq("usuario_id", user.id).maybeSingle();
    if (data) {
      defaultValues = {
        nome_artistico: data.nome_artistico ?? "",
        username: data.username ?? "",
        biografia_pt: data.biografia_pt ?? "",
        biografia_en: data.biografia_en ?? "",
        instagram: data.instagram ?? "",
        tiktok: data.tiktok ?? "",
        twitter_x: data.twitter_x ?? "",
        facebook: data.facebook ?? "",
        foto_url: data.foto_url ?? "",
      };
    }
  }

  return (
    <div>
      <PageHeader
        title="Perfil"
        description="Seu nome, seu endereço e o texto que apresenta você. Tudo aqui aparece na página pública."
      />
      <div className="rounded-xl border border-panel-line bg-panel-surface p-5 sm:p-6">
        <PerfilForm defaultValues={defaultValues} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "@/components/features/painel/PerfilForm";

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
      };
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <h1 className="text-xl font-semibold text-white">Editar Perfil</h1>
      <p className="mt-1 text-sm text-white/60">Atualize seu nome, username, biografia e redes sociais.</p>
      <div className="mt-6">
        <PerfilForm defaultValues={defaultValues} />
      </div>
    </div>
  );
}

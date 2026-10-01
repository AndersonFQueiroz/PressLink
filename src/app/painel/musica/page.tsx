import { createClient } from "@/lib/supabase/server";
import { LinkDeMidia } from "@/lib/validators/links";
import { LinksMusicaForm } from "@/components/features/painel/LinksMusicaForm";

export default async function PainelMusicaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialLinks: LinkDeMidia[] = [];

  if (user) {
    const { data: perfil } = await supabase
      .from("perfil")
      .select("id")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (perfil) {
      const { data: links } = await supabase
        .from("link_de_midia")
        .select("*")
        .eq("perfil_id", perfil.id)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });

      if (links) {
        initialLinks = links as LinkDeMidia[];
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h1 className="text-xl font-semibold text-white">Música e Vídeo</h1>
        <p className="mt-1 text-sm text-white/60">
          Gerencie os links de suas músicas, playlists e vídeos. Suas faixas serão exibidas com players embarcados no seu portfólio.
        </p>

        <div className="mt-6">
          <LinksMusicaForm initialLinks={initialLinks} />
        </div>
      </div>
    </div>
  );
}

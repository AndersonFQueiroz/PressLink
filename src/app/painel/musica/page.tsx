import { createClient } from "@/lib/supabase/server";
import { LinkDeMidia } from "@/lib/validators/links";
import { LinksMusicaForm } from "@/components/features/painel/LinksMusicaForm";
import { PageHeader } from "@/components/features/painel/PageHeader";

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
    <div>
      <PageHeader
        label="Conteúdo"
        title="Mídia"
        description="Sets, playlists e vídeos. Os links viram players embarcados na sua página pública."
      />
      <div className="rounded-lg border border-panel-line bg-panel-surface p-5 sm:p-6">
        <LinksMusicaForm initialLinks={initialLinks} />
      </div>
    </div>
  );
}

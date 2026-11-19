import { createClient } from "@/lib/supabase/server";
import { PainelShell } from "@/components/features/painel/PainelShell";
import type { PainelPerfil } from "@/components/features/painel/Sidebar";
import type { RequisitoPublicacao } from "@/components/features/painel/PublicacaoStatus";

export const metadata = {
  title: "Painel | PressLink",
  description: "Gerencie seu portfólio profissional de DJ no PressLink.",
};

/**
 * Layout do painel.
 *
 * A casca (sidebar + topo) é um componente cliente, mas o estado que ela mostra
 * — nome, @username, status de publicação e o checklist — vem do servidor. Sem
 * isso o topo piscava "Rascunho" para quem já estava publicado enquanto o
 * `/api/perfil` respondia.
 */
export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let perfil: PainelPerfil = {
    nome: "",
    username: null,
    fotoUrl: null,
    email: user?.email ?? null,
  };
  let publicado = false;
  let requisitos: RequisitoPublicacao[] = [
    { label: "Nome artístico", href: "/painel/perfil", done: false },
    { label: "Endereço da página (@username)", href: "/painel/perfil", done: false },
    { label: "Pelo menos 1 foto na galeria", href: "/painel/galeria", done: false },
    { label: "Pelo menos 1 link de música ou vídeo", href: "/painel/musica", done: false },
  ];

  if (user) {
    const { data } = await supabase
      .from("perfil")
      .select("id, nome_artistico, username, foto_url, publicado")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (data) {
      perfil = {
        nome: data.nome_artistico ?? "",
        username: data.username ?? null,
        fotoUrl: data.foto_url ?? null,
        email: user.email ?? null,
      };
      publicado = Boolean(data.publicado);

      const [fotos, midias] = await Promise.all([
        supabase
          .from("foto_galeria")
          .select("id", { count: "exact", head: true })
          .eq("perfil_id", data.id),
        supabase
          .from("link_de_midia")
          .select("id", { count: "exact", head: true })
          .eq("perfil_id", data.id),
      ]);

      requisitos = [
        {
          label: "Nome artístico",
          href: "/painel/perfil",
          done: Boolean(data.nome_artistico?.trim()),
        },
        {
          label: "Endereço da página (@username)",
          href: "/painel/perfil",
          done: Boolean(data.username),
        },
        {
          label: "Pelo menos 1 foto na galeria",
          href: "/painel/galeria",
          done: (fotos.count ?? 0) > 0,
        },
        {
          label: "Pelo menos 1 link de música ou vídeo",
          href: "/painel/musica",
          done: (midias.count ?? 0) > 0,
        },
      ];
    }
  }

  return (
    <PainelShell perfil={perfil} publicado={publicado} requisitos={requisitos}>
      {children}
    </PainelShell>
  );
}

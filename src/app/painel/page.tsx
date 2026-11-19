import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/features/painel/PageHeader";
import { VisaoGeral } from "@/components/features/painel/VisaoGeral";
import { siteUrl } from "@/lib/site";
import { getTemplateById } from "@/lib/templates";
import {
  agregarEventos,
  intervaloEstatisticas,
  type PeriodoEstatisticas,
} from "@/lib/estatisticas";
import { carregarEventos } from "@/lib/estatisticas-servidor";

export const metadata = {
  title: "Visão geral | Painel PressLink",
  description: "Acompanhe sua página, seus números e o que falta para publicar.",
};

const PERIODO: PeriodoEstatisticas = 30;

function diaEmSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/painel");
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select(
      "id, nome_artistico, username, foto_url, publicado, biografia_pt, template_slug",
    )
    .eq("usuario_id", user.id)
    .maybeSingle();

  const hoje = diaEmSaoPaulo();
  const agora = new Date();
  const { desdeAnterior } = intervaloEstatisticas(PERIODO, agora);

  let fotos = 0;
  let midias = 0;
  let proximosShows: {
    id: string;
    nome_evento: string;
    data: string;
    horario: string | null;
    local: string | null;
    cidade: string | null;
  }[] = [];
  let resumo = agregarEventos([], PERIODO, agora);

  if (perfil) {
    const [fotosRes, midiasRes, showsRes, eventosRes] = await Promise.all([
      supabase
        .from("foto_galeria")
        .select("id", { count: "exact", head: true })
        .eq("perfil_id", perfil.id),
      supabase
        .from("link_de_midia")
        .select("id", { count: "exact", head: true })
        .eq("perfil_id", perfil.id),
      supabase
        .from("data_de_show")
        .select("id, nome_evento, data, horario, local, cidade")
        .eq("perfil_id", perfil.id)
        .gte("data", hoje)
        .order("data", { ascending: true })
        .limit(3),
      carregarEventos(supabase, perfil.id, desdeAnterior),
    ]);

    fotos = fotosRes.count ?? 0;
    midias = midiasRes.count ?? 0;
    proximosShows = showsRes.data ?? [];
    resumo = agregarEventos(eventosRes.eventos, PERIODO, agora);
  }

  const nome = perfil?.nome_artistico?.trim() || user.email?.split("@")[0] || "Seu perfil";
  const username = perfil?.username ?? null;
  const publicado = Boolean(perfil?.publicado);
  const urlPublica = `${siteUrl()}/${username ?? ""}`;
  const enderecoPublico = urlPublica.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const temaNome = getTemplateById(perfil?.template_slug ?? "")?.nome ?? "Dark Minimal";

  const itensProntidao = [
    { label: "Nome artístico", done: Boolean(perfil?.nome_artistico?.trim()), href: "/painel/perfil" },
    { label: "Endereço da página", done: Boolean(username), href: "/painel/perfil" },
    { label: "Foto de destaque", done: Boolean(perfil?.foto_url), href: "/painel/perfil" },
    { label: "Biografia", done: Boolean(perfil?.biografia_pt?.trim()), href: "/painel/perfil" },
    { label: "Fotos na galeria", done: fotos > 0, href: "/painel/galeria", hint: `${fotos}` },
    { label: "Músicas ou vídeos", done: midias > 0, href: "/painel/musica", hint: `${midias}` },
  ];
  const prontos = itensProntidao.filter((item) => item.done).length;

  return (
    <div>
      <div className="px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
        <PageHeader
          label="Painel"
          title="Visão geral"
          description={
            publicado
              ? "Sua página está no ar. Acompanhe os números e mantenha o conteúdo atualizado."
              : "Sua página ainda é um rascunho. Complete o conteúdo e publique quando estiver pronto."
          }
          className="mb-4 sm:mb-5"
        />
      </div>

      <VisaoGeral
        nome={nome}
        username={username}
        fotoUrl={perfil?.foto_url ?? null}
        publicado={publicado}
        temaNome={temaNome}
        urlPublica={urlPublica}
        enderecoPublico={enderecoPublico}
        resumo={resumo}
        shows={proximosShows}
        itensProntidao={itensProntidao}
        prontos={prontos}
        totalItens={itensProntidao.length}
      />
    </div>
  );
}

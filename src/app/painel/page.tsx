import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Check, Circle, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/features/painel/PageHeader";
import { PublicPageLink } from "@/components/features/painel/PublicPageLink";
import { CopiarLink } from "@/components/features/painel/CopiarLink";
import { Badge } from "@/components/ui/Badge";
import { siteUrl } from "@/lib/site";

export const metadata = {
  title: "Visão geral | Painel PressLink",
  description: "Acompanhe sua página, seus números e o que falta para publicar.",
};

const TIPOS_CLIQUE = ["click_whatsapp", "click_email", "click_formulario"];

function formatarNumero(valor: number) {
  return valor.toLocaleString("pt-BR");
}

function diaEmSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatarDataCurta(data: string) {
  const d = new Date(`${data}T12:00:00Z`);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(d);
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "")
    .toUpperCase();
  return { dia, mes };
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
  const desde = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const desdeAnterior = new Date(Date.now() - 60 * 86_400_000).toISOString();

  let fotos = 0;
  let midias = 0;
  let visualizacoes = 0;
  let visualizacoesAnterior = 0;
  let cliques = 0;
  let cliquesAnterior = 0;
  let proximosShows: {
    id: string;
    nome_evento: string;
    data: string;
    horario: string | null;
    local: string | null;
    cidade: string | null;
  }[] = [];

  if (perfil) {
    const [
      fotosRes,
      midiasRes,
      viewsRes,
      viewsAnteriorRes,
      cliquesRes,
      cliquesAnteriorRes,
      showsRes,
    ] = await Promise.all([
      supabase.from("foto_galeria").select("id", { count: "exact", head: true }).eq("perfil_id", perfil.id),
      supabase.from("link_de_midia").select("id", { count: "exact", head: true }).eq("perfil_id", perfil.id),
      supabase
        .from("visualizacao_de_pagina")
        .select("id", { count: "exact", head: true })
        .eq("perfil_id", perfil.id)
        .eq("tipo", "page_view")
        .gte("created_at", desde),
      supabase
        .from("visualizacao_de_pagina")
        .select("id", { count: "exact", head: true })
        .eq("perfil_id", perfil.id)
        .eq("tipo", "page_view")
        .gte("created_at", desdeAnterior)
        .lt("created_at", desde),
      supabase
        .from("visualizacao_de_pagina")
        .select("id", { count: "exact", head: true })
        .eq("perfil_id", perfil.id)
        .in("tipo", TIPOS_CLIQUE)
        .gte("created_at", desde),
      supabase
        .from("visualizacao_de_pagina")
        .select("id", { count: "exact", head: true })
        .eq("perfil_id", perfil.id)
        .in("tipo", TIPOS_CLIQUE)
        .gte("created_at", desdeAnterior)
        .lt("created_at", desde),
      supabase
        .from("data_de_show")
        .select("id, nome_evento, data, horario, local, cidade")
        .eq("perfil_id", perfil.id)
        .gte("data", hoje)
        .order("data", { ascending: true })
        .limit(3),
    ]);

    fotos = fotosRes.count ?? 0;
    midias = midiasRes.count ?? 0;
    visualizacoes = viewsRes.count ?? 0;
    visualizacoesAnterior = viewsAnteriorRes.count ?? 0;
    cliques = cliquesRes.count ?? 0;
    cliquesAnterior = cliquesAnteriorRes.count ?? 0;
    proximosShows = showsRes.data ?? [];
  }

  const taxa = visualizacoes > 0 ? (cliques / visualizacoes) * 100 : 0;
  const nome = perfil?.nome_artistico?.trim() || user.email?.split("@")[0] || "Seu perfil";
  const username = perfil?.username ?? null;
  const publicado = Boolean(perfil?.publicado);
  const urlPublica = `${siteUrl()}/${username ?? ""}`;

  const variacao = (atual: number, anterior: number) =>
    anterior > 0 ? Math.round(((atual - anterior) / anterior) * 100) : null;

  const itensProntidao = [
    { label: "Nome artístico", done: Boolean(perfil?.nome_artistico?.trim()), href: "/painel/perfil" },
    { label: "Endereço da página", done: Boolean(username), href: "/painel/perfil" },
    { label: "Foto de destaque", done: Boolean(perfil?.foto_url), href: "/painel/perfil" },
    { label: "Biografia", done: Boolean(perfil?.biografia_pt?.trim()), href: "/painel/perfil" },
    { label: "Fotos na galeria", done: fotos > 0, href: "/painel/galeria", hint: `${fotos}` },
    { label: "Músicas ou vídeos", done: midias > 0, href: "/painel/musica", hint: `${midias}` },
  ];
  const prontos = itensProntidao.filter((i) => i.done).length;
  const totalItens = itensProntidao.length;

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description={
          publicado
            ? "Sua página está no ar. Acompanhe os números e mantenha o conteúdo atualizado."
            : "Sua página ainda é um rascunho. Complete o conteúdo e publique quando estiver pronto."
        }
      />

      {/* Métricas: um bloco só, colunas separadas por hairline — sem três cards iguais. */}
      <section aria-label="Métricas dos últimos 30 dias" className="rounded-lg border border-panel-line bg-panel-surface">
        <dl className="grid divide-y divide-panel-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <dt className="text-[12px] text-white/45">
              Visualizações
            </dt>
            <dd className="mt-2 flex items-baseline gap-2">
              <span className="tabular font-display text-[30px] font-semibold leading-none text-white">
                {formatarNumero(visualizacoes)}
              </span>
              <Variacao valor={variacao(visualizacoes, visualizacoesAnterior)} />
            </dd>
            <p className="mt-2 text-[12px] text-white/35">Últimos 30 dias</p>
          </div>

          <div className="p-5">
            <dt className="text-[12px] text-white/45">
              Cliques em contato
            </dt>
            <dd className="mt-2 flex items-baseline gap-2">
              <span className="tabular font-display text-[30px] font-semibold leading-none text-white">
                {formatarNumero(cliques)}
              </span>
              <Variacao valor={variacao(cliques, cliquesAnterior)} />
            </dd>
            <p className="mt-2 text-[12px] text-white/35">WhatsApp, e-mail e formulário</p>
          </div>

          <div className="p-5">
            <dt className="text-[12px] text-white/45">
              Conversão
            </dt>
            <dd className="mt-2 flex items-baseline gap-2">
              <span className="tabular font-display text-[30px] font-semibold leading-none text-white">
                {taxa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
              </span>
            </dd>
            <p className="mt-2 text-[12px] text-white/35">Cliques divididos por visitas</p>
          </div>
        </dl>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Sua página */}
        <section className="rounded-lg border border-panel-line bg-panel-surface">
          <div className="flex items-start justify-between gap-4 border-b border-panel-line p-5">
            <h2 className="font-display text-[15px] font-semibold tracking-tight text-white">
              Sua página
            </h2>
            <Badge variant={publicado ? "success" : "warning"} dot size="sm">
              {publicado ? "Publicado" : "Rascunho"}
            </Badge>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-panel-raised text-sm font-semibold text-white/80">
                {perfil?.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfil.foto_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  nome.slice(0, 2).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-white">{nome}</p>
                <p className="truncate text-[12px] text-white/40">
                  {username ? `presslink.app/${username}` : "Defina seu @username no perfil"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {username ? (
                <>
                  <PublicPageLink
                    username={username}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                  >
                    Abrir página
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </PublicPageLink>
                  <CopiarLink url={urlPublica} />
                </>
              ) : (
                <Link
                  href="/painel/perfil"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover"
                >
                  Escolher meu endereço
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-panel-line px-5 py-3 text-[12px] text-white/35">
            <span>Aparência</span>
            <Link href="/painel/template" className="text-white/60 hover:text-white">
              {perfil?.template_slug ?? "Escolher template"}
            </Link>
          </div>
        </section>

        {/* Prontidão */}
        <section className="rounded-lg border border-panel-line bg-panel-surface">
          <div className="flex items-center justify-between gap-4 border-b border-panel-line p-5">
            <h2 className="font-display text-[15px] font-semibold tracking-tight text-white">
              Prontidão da página
            </h2>
            <span className="tabular text-[12px] text-white/40">
              {prontos}/{totalItens}
            </span>
          </div>

          <ul className="divide-y divide-white/[0.05]">
            {itensProntidao.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-3 px-5 py-2.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2.5 text-[13px]">
                    {item.done ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-soft" aria-hidden="true" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-white/20" aria-hidden="true" />
                    )}
                    <span className={item.done ? "text-white/45" : "text-white/80"}>
                      {item.label}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-[12px] text-white/30">
                    {item.hint && item.done ? item.hint : null}
                    {!item.done && (
                      <span className="text-white/40 transition-colors group-hover:text-brand-soft/90">
                        Completar
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="px-5 pb-4 pt-2">
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{ width: `${(prontos / totalItens) * 100}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Próximos shows */}
      <section className="mt-6 rounded-lg border border-panel-line bg-panel-surface">
        <div className="flex items-center justify-between gap-4 border-b border-panel-line p-5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight text-white">
            Próximos shows
          </h2>
          <Link
            href="/painel/agenda"
            className="inline-flex items-center gap-1 text-[12px] text-white/45 transition-colors hover:text-white"
          >
            Gerenciar agenda
          </Link>
        </div>

        {proximosShows.length === 0 ? (
          <div className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-white/25" aria-hidden="true" />
              <p className="text-[13px] text-white/50">
                Nenhuma data futura cadastrada. A agenda é o que mais converte contratação.
              </p>
            </div>
            <Link
              href="/painel/agenda"
              className="text-[12px] font-medium text-brand-soft/90 underline-offset-4 hover:underline"
            >
              Adicionar show
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {proximosShows.map((show) => {
              const { dia, mes } = formatarDataCurta(show.data);
              return (
                <li
                  key={show.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="flex w-12 shrink-0 flex-col items-start leading-none">
                    <span className="tabular font-display text-lg font-semibold text-white">
                      {dia}
                    </span>
                    <span className="mt-0.5 text-[10px] font-medium text-white/35">
                      {mes}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-white/85">
                      {show.nome_evento}
                    </span>
                    <span className="block truncate text-[12px] text-white/35">
                      {[show.local, show.cidade].filter(Boolean).join(", ") || "Local a definir"}
                      {show.horario ? `, ${show.horario.slice(0, 5)}` : ""}
                    </span>
                  </span>
                  <Link
                    href="/painel/agenda"
                    className="shrink-0 text-[12px] text-white/35 transition-colors hover:text-white"
                  >
                    Editar
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Variacao({ valor }: { valor: number | null }) {
  if (valor === null) return null;
  const positivo = valor >= 0;
  return (
    <span
      className={
        positivo
          ? "tabular text-[12px] font-medium text-[#a4edaf]"
          : "tabular text-[12px] font-medium text-[#ff9a9a]"
      }
    >
      {positivo ? "+" : ""}
      {valor}%
    </span>
  );
}

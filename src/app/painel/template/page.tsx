// /painel/template — seletor de temas do portfólio (issue #21).
//
// Server component: busca o perfil + fotos + mídias + shows do DJ logado e
// monta os TemplatePublicData reais usados pelo preview do TemplateSelector.
// Sem perfil (ou Supabase indisponível) o seletor entra no estado vazio.
import { createClient } from "@/lib/supabase/server";
import { TemplateSelector } from "@/components/features/painel/TemplateSelector";
import type { TemplatePublicData } from "@/types/template";

export default async function PainelTemplatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let portfolioData: TemplatePublicData | null = null;
  let currentSlug: string | null = null;

  if (user) {
    try {
      const { data: perfil } = await supabase
        .from("perfil")
        .select("*")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (perfil) {
        // Mesmas tabelas da página pública ([username]) para o preview fiel
        const [fotosRes, midiasRes, showsRes] = await Promise.all([
          supabase
            .from("foto_galeria")
            .select("id,url,alt_text,ordem")
            .eq("perfil_id", perfil.id)
            .order("ordem", { ascending: true }),
          supabase
            .from("link_de_midia")
            .select("id,tipo,url,titulo,ordem")
            .eq("perfil_id", perfil.id)
            .order("ordem", { ascending: true }),
          supabase
            .from("data_de_show")
            .select("id,nome_evento,data,horario,local,cidade")
            .eq("perfil_id", perfil.id)
            .order("data", { ascending: false }),
        ]);

        portfolioData = {
          perfil: {
            id: String(perfil.id),
            username: perfil.username ?? "",
            nome_artistico: perfil.nome_artistico ?? "",
            foto_url: perfil.foto_url || fotosRes.data?.[0]?.url || null,
            biografia_pt: perfil.biografia_pt ?? null,
            biografia_en: perfil.biografia_en ?? null,
            instagram: perfil.instagram ?? null,
            facebook: perfil.facebook ?? null,
            tiktok: perfil.tiktok ?? null,
            twitter_x: perfil.twitter_x ?? null,
            whatsapp: perfil.whatsapp ?? null,
            email_booking: perfil.email_booking ?? null,
            template_slug: perfil.template_slug ?? null,
          },
          fotos: (fotosRes.data ?? []).map((f) => ({
            id: String(f.id),
            url: f.url,
            alt_text: f.alt_text ?? null,
            ordem: f.ordem,
          })),
          midias: (midiasRes.data ?? []).map((m) => ({
            id: String(m.id),
            tipo: m.tipo,
            url: m.url,
            titulo: m.titulo ?? null,
            ordem: m.ordem,
          })),
          shows: (showsRes.data ?? []).map((s) => ({
            id: String(s.id),
            nome_evento: s.nome_evento,
            data: s.data,
            horario: s.horario ?? null,
            local: s.local ?? null,
            cidade: s.cidade ?? null,
          })),
        };
        currentSlug = perfil.template_slug ?? null;
      }
    } catch {
      // Ambiente sem Supabase → seletor no estado vazio (tratado na UI)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h1 className="text-xl font-semibold text-white">Template do Portfólio</h1>
        <p className="mt-1 text-sm text-white/60">
          Escolha como sua página pública aparece. O preview usa os seus dados
          reais — trocar de tema não altera nenhum dado do seu perfil.
        </p>
      </div>

      <TemplateSelector data={portfolioData} currentSlug={currentSlug} />
    </div>
  );
}

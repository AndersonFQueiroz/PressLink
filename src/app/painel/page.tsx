import Link from "next/link";
import {
  User,
  Music,
  Calendar,
  Image as ImageIcon,
  Palette,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { PublicacaoManager } from "@/components/features/painel/PublicacaoManager";
// O painel utiliza PublicPageLink integrado em PublicacaoManager

export const metadata = {
  title: "Painel | presslink",
  description: "Gerencie seu portfólio profissional de DJ no presslink.",
};

const modules = [
  {
    title: "Perfil do DJ",
    desc: "Nome artístico, bio multi-idioma, foto de destaque e redes sociais.",
    icon: User,
    href: "/painel/perfil",
    badge: "Essencial",
  },
  {
    title: "Música & Vídeos",
    desc: "Embeds integrados do Spotify, faixas do SoundCloud e vídeos do YouTube.",
    icon: Music,
    href: "/painel/musica",
    badge: "Mídia",
  },
  {
    title: "Agenda de Shows",
    desc: "Cadastre suas próximas datas, festivais, cidades e eventos confirmados.",
    icon: Calendar,
    href: "/painel/agenda",
    badge: "Datas",
  },
  {
    title: "Galeria de Fotos",
    desc: "Carregue fotos de apresentações em alta resolução com organização por ordem.",
    icon: ImageIcon,
    href: "/painel/galeria",
    badge: "Visual",
  },
  {
    title: "Template & Identidade",
    desc: "Escolha entre estilos visuais (Dark Electronic, Vibrant, Clean Editorial).",
    icon: Palette,
    href: "/painel/template",
    badge: "Design",
  },
  {
    title: "Estatísticas de Acesso",
    desc: "Acompanhe visualizações do portfólio e cliques em WhatsApp e contratação.",
    icon: BarChart3,
    href: "/painel/estatisticas",
    badge: "Métricas",
  },
];

export default function PainelPage() {
  return (
    <div className="relative min-h-screen bg-ink text-white overflow-hidden selection:bg-fuchsia-500 selection:text-white">
      {/* Ambient background glow matching landing page */}
      <div
        className="pointer-events-none fixed -right-48 top-10 h-[38rem] w-[38rem] rounded-full bg-fuchsia-600/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -left-48 bottom-10 h-[32rem] w-[32rem] rounded-full bg-fuchsia-700/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-16">
        {/* Hero & Publicação Manager Section */}
        <PublicacaoManager />

        {/* Management Modules Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              Recursos do Portfólio
            </h2>
            <span className="text-xs text-white/50">6 módulos disponíveis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.title}
                  href={mod.href}
                  className="group relative rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-fuchsia-950/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-fuchsia-400 transition-colors group-hover:border-fuchsia-400/40 group-hover:bg-fuchsia-500/10">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/60 group-hover:text-white/80">
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/60 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center text-xs font-semibold text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">
                    <span>Acessar</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer Highlights */}
        <section className="mt-16 pt-8 border-t border-white/10 text-center">
          <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-white/50">
            <li>✦ Portfólio em minutos</li>
            <li>✦ Links e agenda em um só lugar</li>
            <li>✦ Sua identidade em destaque</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

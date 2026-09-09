import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { Headphones, User, ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Painel do DJ | PressLink",
  description: "Gerencie seu portfólio profissional de DJ.",
};

export default async function PainelPage() {
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  } catch {
    // Supabase pode não estar com chaves válidas no ambiente local
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-plum/20 border border-plum/40 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="font-bold font-display tracking-tight text-lg text-white">
              PressLink <span className="text-xs font-normal text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-full ml-1.5">Painel</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-700/50">
                <User className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-zinc-200">{userEmail}</span>
              </div>
            )}
            <LogoutButton variant="danger" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-purple-400 bg-purple-950/50 border border-purple-800/50 px-3 py-1 rounded-full mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Autenticação ativa</span>
              </div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2">
                Painel Administrativo
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                {userEmail
                  ? `Sessão autenticada com sucesso como ${userEmail}.`
                  : "Sua área de gerenciamento do portfólio de DJ."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-zinc-800/70 hover:bg-zinc-800 px-3.5 py-2 rounded-lg border border-zinc-700/50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar à Landing Page</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Perfil do DJ</h3>
              <p className="text-xs text-zinc-400">Edição de bio, redes sociais e foto artística.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Galeria & Mídia</h3>
              <p className="text-xs text-zinc-400">Upload de fotos, links de Spotify, SoundCloud e YouTube.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Agenda de Shows</h3>
              <p className="text-xs text-zinc-400">Gerenciamento de datas futuras de eventos e apresentações.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

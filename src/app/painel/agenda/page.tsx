import { createClient } from "@/lib/supabase/server";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6 text-white">Faça login para acessar a agenda.</div>;
  }

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  let shows: unknown[] = [];
  if (perfil) {
    const { data } = await supabase
      .from("data_de_show")
      .select("*")
      .eq("perfil_id", perfil.id)
      .order("data", { ascending: true })
      .order("horario", { ascending: true, nullsFirst: true });
    shows = data ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Agenda</h1>
        <p className="text-sm text-white/60">Cadastre suas próximas apresentações — serão exibidas em ordem cronológica.</p>
      </div>
      <AgendaClient initialShows={shows as never[]} />
    </div>
  );
}

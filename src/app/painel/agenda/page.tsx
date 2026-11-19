import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgendaClient } from "./agenda-client";
import { PageHeader } from "@/components/features/painel/PageHeader";

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    <div>
      <PageHeader
        title="Agenda"
        description="Suas próximas datas. As futuras aparecem em ordem cronológica na página pública."
      />
      <AgendaClient initialShows={shows as never[]} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GaleriaClient } from "./galeria-client";
import { PageHeader } from "@/components/features/painel/PageHeader";

export default async function GaleriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  let fotos: unknown[] = [];
  if (perfil) {
    const { data } = await supabase.from("foto_galeria").select("*").eq("perfil_id", perfil.id).order("ordem", { ascending: true });
    fotos = data ?? [];
  }

  return (
    <div>
      <PageHeader
        label="Conteúdo"
        title="Galeria"
        description="Fotos de festa, estúdio e bastidores. Arraste para enviar, reordene e exclua o que não quiser mostrar."
      />
      <GaleriaClient initialFotos={fotos as never[]} />
    </div>
  );
}

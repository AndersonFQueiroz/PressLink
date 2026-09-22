import { createClient } from "@/lib/supabase/server";
import { GaleriaClient } from "./galeria-client";

export default async function GaleriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6 text-white">Faça login para acessar a galeria.</div>;
  }

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  let fotos: unknown[] = [];
  if (perfil) {
    const { data } = await supabase.from("foto_galeria").select("*").eq("perfil_id", perfil.id).order("ordem", { ascending: true });
    fotos = data ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Galeria</h1>
        <p className="text-sm text-white/60">Envie várias fotos promocionais, visualize em grade e exclua quando precisar.</p>
      </div>
      <GaleriaClient initialFotos={fotos as never[]} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("template").select("id").limit(1);

    if (error) {
      return Response.json(
        { connected: false, error: "Não foi possível consultar o Supabase." },
        { status: 503 },
      );
    }

    return Response.json({ connected: true });
  } catch {
    return Response.json(
      { connected: false, error: "Supabase não configurado." },
      { status: 503 },
    );
  }
}

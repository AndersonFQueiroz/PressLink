import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ContatoForm } from "@/components/features/painel/ContatoForm";

export const metadata: Metadata = {
  title: "Contato e Booking | Painel PressLink",
  description: "Configure seus canais oficiais de contato e e-mail para contratação e booking de datas.",
};

export default async function ContatoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultValues = undefined;
  if (user) {
    const { data } = await supabase
      .from("perfil")
      .select("whatsapp, email_booking")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (data) {
      defaultValues = {
        whatsapp: data.whatsapp ?? "",
        email_booking: data.email_booking ?? "",
      };
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <div className="border-b border-white/10 pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Contato Comercial e Booking
        </h1>
        <p className="mt-1.5 text-sm text-white/60 max-w-2xl leading-relaxed">
          Configure os canais diretos para contratação de apresentações e shows. Esses canais serão exibidos
          no seu Electronic Press Kit (EPK) público para produtores de eventos e contratantes.
        </p>
      </div>

      <div>
        <ContatoForm defaultValues={defaultValues} />
      </div>
    </div>
  );
}

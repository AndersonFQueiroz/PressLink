"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle, Mail, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import {
  contatoSchema,
  type ContatoFormData,
  formatWhatsApp,
  getCleanWhatsAppDigits,
  isValidWhatsApp,
} from "@/lib/validators/contato";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PreviewCelular } from "@/components/features/painel/PreviewCelular";

type ContatoFormProps = {
  defaultValues?: Partial<ContatoFormData>;
  /** Dados do perfil usados só na prévia ao lado do formulário. */
  preview?: {
    nome?: string;
    username?: string;
    fotoUrl?: string;
    bio?: string;
  };
  /** Host real do site (ex.: `localhost:3000`), sem protocolo. */
  origem: string;
};

export function ContatoForm({ defaultValues, preview, origem }: ContatoFormProps) {
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const initialWhatsApp = defaultValues?.whatsapp ? formatWhatsApp(defaultValues.whatsapp) : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContatoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contatoSchema) as any,
    defaultValues: {
      whatsapp: initialWhatsApp,
      email_booking: defaultValues?.email_booking ?? "",
    },
  });

  const valores = watch();
  const whatsappValue = watch("whatsapp") || "";
  const cleanDigits = getCleanWhatsAppDigits(whatsappValue);
  const isWhatsAppFilled = whatsappValue.trim().length > 0;
  const isWhatsAppValid = isWhatsAppFilled && isValidWhatsApp(whatsappValue) && cleanDigits.length >= 10;
  const waTestUrl = isWhatsAppValid ? `https://wa.me/${cleanDigits}` : null;

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      setValue("whatsapp", "", { shouldValidate: true });
      return;
    }
    const formatted = formatWhatsApp(raw);
    setValue("whatsapp", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: ContatoFormData): Promise<void> => {
    setToast(null);
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", msg: json.error || "Erro ao salvar informações de contato." });
        return;
      }

      setToast({ type: "success", msg: "Canais de contato e booking salvos com sucesso!" });
    } catch {
      setToast({ type: "error", msg: "Erro de conexão ao salvar informações de contato." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_272px]">
        <div className="flex min-w-0 flex-col gap-8">
      {/* Seção WhatsApp */}
      <section>
        <h2 className="flex items-center gap-2 text-[13px] font-medium text-panel-text">
          <MessageCircle className="h-4 w-4 text-panel-muted" aria-hidden="true" />
          WhatsApp comercial
        </h2>
        <p className="mt-0.5 text-[12px] text-panel-muted">
          Canal direto para orçamentos, produtores e contratantes.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-2 md:items-start">
          <Input
            label="Número do WhatsApp"
            placeholder="(11) 99999-9999 ou +1 555 123-4567"
            error={errors.whatsapp?.message}
            helperText="Formato nacional com DDD ou internacional iniciando com +"
            leftIcon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
            {...register("whatsapp")}
            onChange={handleWhatsAppChange}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-panel-muted">
              Link direto (wa.me)
            </span>
            {waTestUrl ? (
              <a
                href={waTestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-panel-line px-4 text-[13px] font-medium text-panel-text transition-colors hover:bg-white/[0.05] hover:text-panel-text"
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Testar link no WhatsApp</span>
              </a>
            ) : (
              <span className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-panel-line px-4 text-[13px] font-medium text-panel-muted">
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Testar link no WhatsApp</span>
              </span>
            )}
            {waTestUrl ? (
              <p className="break-all text-[12px] text-panel-muted">
                URL gerada: <span className="tabular text-panel-muted">{waTestUrl}</span>
              </p>
            ) : isWhatsAppFilled ? (
              <p className="text-[12px] text-warn">
                Complete o número com DDD válido para habilitar o teste do link.
              </p>
            ) : (
              <p className="text-[12px] text-panel-muted">
                O link <span className="tabular">https://wa.me/...</span> fica disponível para teste assim que você preencher o número.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Seção E-mail de Booking */}
      <section className="border-t border-panel-line pt-7">
        <h2 className="flex items-center gap-2 text-[13px] font-medium text-panel-text">
          <Mail className="h-4 w-4 text-panel-muted" aria-hidden="true" />
          E-mail para booking
        </h2>
        <p className="mt-0.5 text-[12px] text-panel-muted">
          Endereço oficial para contratos, propostas detalhadas e datas de shows.
        </p>

        <div className="mt-4 max-w-xl">
          <Input
            type="email"
            label="E-mail de booking"
            placeholder="booking@seudominio.com"
            error={errors.email_booking?.message}
            helperText="Apenas o endereço, sem texto extra."
            leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
            {...register("email_booking")}
          />
        </div>
      </section>

      {/* Feedback Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px]",
            toast.type === "success"
              ? "border-ok/25 bg-ok/[0.08] text-ok"
              : "border-danger/25 bg-danger/[0.08] text-danger",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Botão de Salvar */}
      <div className="flex items-center justify-end border-t border-panel-line pt-5">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Salvar canais de contato
        </Button>
      </div>
        </div>

        <aside className="hidden lg:block lg:border-l lg:border-white/[0.06] lg:pl-7">
          <div className="sticky top-20">
            <PreviewCelular
              origem={origem}
              nome={preview?.nome}
              username={preview?.username}
              fotoUrl={preview?.fotoUrl}
              bio={preview?.bio}
              whatsapp={valores.whatsapp}
              email={valores.email_booking}
            />
          </div>
        </aside>
      </div>
    </form>
  );
}

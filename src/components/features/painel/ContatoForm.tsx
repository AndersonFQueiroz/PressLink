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

type ContatoFormProps = {
  defaultValues?: Partial<ContatoFormData>;
};

export function ContatoForm({ defaultValues }: ContatoFormProps) {
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Seção WhatsApp */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            WhatsApp Comercial
          </h2>
          <p className="mt-0.5 text-xs text-white/60">
            Canal direto para orçamentos, produtores de eventos e contratantes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 items-start">
          <div>
            <Input
              label="Número do WhatsApp"
              placeholder="(11) 99999-9999 ou +1 555 123-4567"
              error={errors.whatsapp?.message}
              helperText="Formato nacional com DDD ou internacional iniciando com +"
              leftIcon={<MessageCircle className="h-4 w-4 text-emerald-400/80" />}
              {...register("whatsapp")}
              onChange={handleWhatsAppChange}
            />
          </div>

          <div className="flex flex-col gap-2 pt-0 md:pt-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Link Direto (wa.me)
            </label>
            <div className="flex items-center gap-3">
              {waTestUrl ? (
                <a
                  href={waTestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                >
                  <ExternalLink className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Testar link no WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/30 cursor-not-allowed"
                >
                  <ExternalLink className="h-4 w-4 text-white/20 shrink-0" />
                  <span>Testar link no WhatsApp</span>
                </button>
              )}
            </div>
            {waTestUrl ? (
              <p className="text-xs text-white/40 break-all">
                URL gerada: <span className="text-emerald-400 font-mono">{waTestUrl}</span>
              </p>
            ) : isWhatsAppFilled ? (
              <p className="text-xs text-amber-400/80">
                Complete o número com DDD válido para habilitar o teste do link.
              </p>
            ) : (
              <p className="text-xs text-white/40">
                O link <span className="font-mono">https://wa.me/...</span> será disponibilizado para teste assim que preenchido.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seção E-mail de Booking */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-fuchsia-400" />
            E-mail para Booking
          </h2>
          <p className="mt-0.5 text-xs text-white/60">
            Endereço oficial para envio de contratos, propostas detalhadas e datas de shows.
          </p>
        </div>

        <div className="max-w-xl">
          <Input
            type="email"
            label="E-mail de Booking"
            placeholder="booking@seudominio.com"
            error={errors.email_booking?.message}
            helperText="Validação estrita de formato corporativo/pessoal para propostas comerciais."
            leftIcon={<Mail className="h-4 w-4 text-fuchsia-400/80" />}
            {...register("email_booking")}
          />
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm transition-all",
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
              : "border-rose-500/40 bg-rose-950/40 text-rose-200",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Botão de Salvar */}
      <div className="flex items-center justify-start pt-2">
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full sm:w-auto"
        >
          Salvar canais de contato
        </Button>
      </div>
    </form>
  );
}

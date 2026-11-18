"use client";

// Seletor de templates do portfólio (issue #21).
//
// Grade com os 3 temas do registro (TEMPLATES): miniatura estática
// (TemplateThumbnail), nome/descrição, botão "Visualizar" (preview real dos
// dados do DJ no TemplatePreviewModal) e "Selecionar" (persiste via
// PUT /api/perfil).
//
// RF-23: a troca envia buildTemplateSwitchPayload(...) — todos os campos do
// perfil repetidos sem alteração + apenas o template_slug — para que os dados
// do DJ permaneçam intactos após trocar de tema.
import { useCallback, useState } from "react";
import { Check, Eye } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATES,
  buildTemplateSwitchPayload,
} from "@/lib/templates";
import { explainPerfilSaveError } from "@/lib/perfil-errors";
import type { TemplateDef } from "@/lib/templates";
import type { TemplatePublicData } from "@/types/template";
import { cn } from "@/lib/utils";

import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateThumbnail } from "./TemplateThumbnail";

interface TemplateSelectorProps {
  /** Dados reais do portfólio para o preview (null = ainda sem perfil) */
  data: TemplatePublicData | null;
  /** Slug ativo no banco (null = padrão dark-minimal) */
  currentSlug: string | null;
}

type Feedback = { tipo: "ok" | "erro"; texto: string };

export function TemplateSelector({ data, currentSlug }: TemplateSelectorProps) {
  // Slug aplicado localmente: a prop currentSlug é estática (server), então
  // acompanhamos aqui o resultado da última troca bem-sucedida
  const [appliedSlug, setAppliedSlug] = useState(currentSlug ?? DEFAULT_TEMPLATE_ID);
  const [previewTpl, setPreviewTpl] = useState<TemplateDef | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const temConteudo = data !== null;

  // Troca de tema: PUT com o perfil completo sem alteração + o novo slug (RF-23)
  const aplicar = useCallback(
    async (tpl: TemplateDef, fecharModal: boolean) => {
      if (!data || savingSlug) return;
      setSavingSlug(tpl.id);
      setFeedback(null);
      try {
        const res = await fetch("/api/perfil", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildTemplateSwitchPayload(data, tpl.id)),
        });
        if (!res.ok) {
          const corpo = await res.json().catch(() => null);
          throw new Error(explainPerfilSaveError(res.status, corpo?.error));
        }
        setAppliedSlug(tpl.id);
        setFeedback({
          tipo: "ok",
          texto: `Template "${tpl.nome}" ativado — seus dados do perfil permanecem intactos.`,
        });
        if (fecharModal) setPreviewTpl(null);
      } catch (err) {
        setFeedback({
          tipo: "erro",
          texto: err instanceof Error ? err.message : "Falha ao ativar o template.",
        });
      } finally {
        setSavingSlug(null);
      }
    },
    [data, savingSlug],
  );

  return (
    <div className="space-y-4">
      {/* Grade de temas */}
      <div className="grid gap-4 md:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const ativo = tpl.id === appliedSlug;
          return (
            <article
              key={tpl.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-4 transition-colors",
                ativo
                  ? "border-[#d8ff4a]/60 bg-white/[0.05]"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              <TemplateThumbnail template={tpl} />

              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">{tpl.nome}</h2>
                {ativo && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d8ff4a]/40 bg-[#d8ff4a]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#d8ff4a]">
                    <Check className="h-3 w-3" /> Ativo
                  </span>
                )}
              </div>

              <p className="flex-1 text-xs leading-relaxed text-white/55">
                {tpl.descricao}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => setPreviewTpl(tpl)}
                  disabled={savingSlug !== null}
                >
                  Visualizar
                </Button>
                {ativo ? (
                  <Button variant="secondary" size="sm" className="flex-1" disabled>
                    Em uso
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    isLoading={savingSlug === tpl.id}
                    disabled={!temConteudo}
                    onClick={() => void aplicar(tpl, false)}
                  >
                    Selecionar
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Dica quando ainda não há perfil cadastrado */}
      {!temConteudo && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
          Você ainda não cadastrou seu perfil. Cadastre em{" "}
          <span className="font-semibold">Perfil</span> para liberar a seleção de
          template — assim o preview já aparece com os seus dados reais.
        </p>
      )}

      {/* Feedback da última operação */}
      {feedback && (
        <p
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-xs",
            feedback.tipo === "ok"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200",
          )}
        >
          {feedback.texto}
        </p>
      )}

      {/* Preview real dos dados do DJ no tema escolhido (RF-22) */}
      {previewTpl && (
        <TemplatePreviewModal
          template={previewTpl}
          data={data}
          onClose={() => setPreviewTpl(null)}
          onConfirm={() => void aplicar(previewTpl, true)}
          confirming={savingSlug === previewTpl.id}
        />
      )}
    </div>
  );
}

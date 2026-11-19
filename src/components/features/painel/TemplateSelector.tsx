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
                "flex flex-col gap-3 rounded-xl border p-4 transition-colors",
                ativo
                  ? "border-brand/45 bg-panel-raised"
                  : "border-panel-line bg-panel-surface hover:border-white/20",
              )}
            >
              <TemplateThumbnail template={tpl} />

              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[13px] font-medium text-white/90">{tpl.nome}</h2>
                {ativo && (
                  <span className="inline-flex items-center gap-1 rounded border border-brand/30 bg-brand/[0.1] px-1.5 py-0.5 text-[10px] font-medium text-brand-soft">
                    <Check className="h-3 w-3" aria-hidden="true" /> Ativo
                  </span>
                )}
              </div>

              <p className="flex-1 text-[12px] leading-relaxed text-white/40">
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
        <p className="rounded-lg border border-[#f0d58e]/25 bg-[#f0d58e]/[0.06] px-3.5 py-2.5 text-[12px] text-[#f0d58e]">
          Você ainda não cadastrou seu perfil. Cadastre em{" "}
          <span className="font-medium">Perfil</span> para liberar a seleção de
          template — assim o preview já aparece com os seus dados reais.
        </p>
      )}

      {/* Feedback da última operação */}
      {feedback && (
        <p
          role="status"
          className={cn(
            "rounded-lg border px-3.5 py-2.5 text-[12px]",
            feedback.tipo === "ok"
              ? "border-[#7ce38b]/25 bg-[#7ce38b]/[0.08] text-[#a4edaf]"
              : "border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.08] text-[#ff9a9a]",
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

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
import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, Eye } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATES,
  buildTemplateSwitchPayload,
} from "@/lib/templates";
import { erroSemPerfil, explicarErroDeRede, explicarErroSalvar, type ErroAcao } from "@/lib/erros-painel";
import type { TemplateDef } from "@/lib/templates";
import type { TemplatePublicData } from "@/types/template";
import { cn } from "@/lib/utils";

import { ErroAcaoDialog } from "./ErroAcaoDialog";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateThumbnail } from "./TemplateThumbnail";

interface TemplateSelectorProps {
  /** Dados reais do portfólio para o preview (null = ainda sem perfil) */
  data: TemplatePublicData | null;
  /** Slug ativo no banco (null = padrão dark-minimal) */
  currentSlug: string | null;
}

type Feedback = { tipo: "ok"; texto: string };

export function TemplateSelector({ data, currentSlug }: TemplateSelectorProps) {
  // Slug aplicado localmente: a prop currentSlug é estática (server), então
  // acompanhamos aqui o resultado da última troca bem-sucedida
  const [appliedSlug, setAppliedSlug] = useState(currentSlug ?? DEFAULT_TEMPLATE_ID);
  const [previewTpl, setPreviewTpl] = useState<TemplateDef | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [erro, setErro] = useState<ErroAcao | null>(null);

  const temConteudo = data !== null;

  // Troca de tema: PUT com o perfil completo sem alteração + o novo slug (RF-23)
  const aplicar = useCallback(
    async (tpl: TemplateDef, fecharModal: boolean) => {
      if (savingSlug) return;
      // Pré-requisito: sem perfil não há dados para vestir o tema. Em vez de
      // um botão apagado sem explicação, fecha o preview (para não empilhar
      // dois diálogos) e abre o popup com o caminho.
      if (!data) {
        setPreviewTpl(null);
        setErro(erroSemPerfil());
        return;
      }
      setSavingSlug(tpl.id);
      setFeedback(null);
      setErro(null);
      try {
        const res = await fetch("/api/perfil", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildTemplateSwitchPayload(data, tpl.id)),
        });
        if (!res.ok) {
          const corpo = await res.json().catch(() => null);
          setErro(explicarErroSalvar("template", res.status, corpo));
          return;
        }
        setAppliedSlug(tpl.id);
        setFeedback({
          tipo: "ok",
          texto: `Template "${tpl.nome}" ativado — seus dados do perfil permanecem intactos.`,
        });
        if (fecharModal) setPreviewTpl(null);
      } catch {
        setErro(explicarErroDeRede());
      } finally {
        setSavingSlug(null);
      }
    },
    [data, savingSlug],
  );

  return (
    <div className="space-y-4">
      {/* Grade de temas */}
      <div className="pl-stagger grid gap-4 md:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const ativo = tpl.id === appliedSlug;
          return (
            <article
              key={tpl.id}
              className={cn(
                "pl-lift group flex flex-col gap-3 rounded-lg border p-3",
                ativo
                  ? "border-signal/45 bg-panel-raised shadow-[0_0_0_1px_rgb(208_24_246/0.25),0_18px_40px_-30px_rgb(208_24_246/0.6)]"
                  : "border-panel-line bg-panel-surface hover:border-panel-line-strong",
              )}
              style={{ "--pl-i": TEMPLATES.indexOf(tpl) } as CSSProperties}
            >
              <div className="overflow-hidden rounded-xl transition-transform duration-500 ease-out group-hover:scale-[1.015]">
                <TemplateThumbnail template={tpl} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[13px] font-medium text-panel-text">{tpl.nome}</h2>
                {ativo && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-signal-soft">
                    <Check className="h-3 w-3" aria-hidden="true" /> Ativo
                  </span>
                )}
              </div>

              <p className="flex-1 text-[12px] leading-relaxed text-panel-muted">
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
        <p className="border-y border-warn/25 py-2.5 text-[12px] text-warn">
          Você ainda não cadastrou seu perfil. Cadastre em{" "}
          <Link
            href="/painel/perfil?campo=nome_artistico"
            className="font-medium underline underline-offset-4"
          >
            Perfil
          </Link>{" "}
          para liberar a seleção de template — assim o preview já aparece com os
          seus dados reais.
        </p>
      )}

      {/* Feedback da última operação (erros vão para o popup com ação) */}
      {feedback && (
        <p
          role="status"
          className="border-y border-ok/25 py-2.5 text-[12px] text-ok"
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

      {/* Erros e pré-requisitos com caminho de correção */}
      <ErroAcaoDialog erro={erro} onClose={() => setErro(null)} />
    </div>
  );
}

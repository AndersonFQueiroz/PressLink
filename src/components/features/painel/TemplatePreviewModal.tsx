"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import type { TemplateDef } from "@/lib/templates";
import type { TemplatePublicData } from "@/types/template";

type TemplatePreviewModalProps = {
  template: TemplateDef;
  /** Portfólio real da sessão; null quando o DJ ainda não cadastrou o perfil. */
  data: TemplatePublicData | null;
  onClose: () => void;
  /** Confirma a seleção (PUT /api/perfil) e fecha o modal. */
  onConfirm: () => void;
  confirming: boolean;
};

/**
 * Preview em tempo real (issue #21, RF-22).
 *
 * Renderiza o portfólio COMPLETO do DJ dentro do template escolhido,
 * reaproveitando exatamente os componentes da página pública (via
 * TemplateRenderer), sem reimplementar a visualização. A classe raiz do
 * template aplica os tokens como CSS variables na moldura do modal.
 */
export function TemplatePreviewModal({ template, data, onClose, onConfirm, confirming }: TemplatePreviewModalProps) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      size="xl"
      title={"Pré-visualização — " + template.nome}
      description="É assim que a sua página pública vai ficar com este estilo: os dados exibidos são os seus, desta sessão."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={confirming}>
            Fechar
          </Button>
          <Button onClick={onConfirm} isLoading={confirming}>
            Usar este template
          </Button>
        </>
      }
    >
      {data ? (
        <div className="h-[65vh] overflow-y-auto rounded-lg border border-panel-line bg-black/40">
          {/* pl-tpl-preview-frame: o transform cria um bloco contendo para os
              position:fixed dos templates (nav/menu), mantendo tudo no modal. */}
          <div className="pl-tpl-preview-frame">
            <div className={template.classeRaiz}>
              <TemplateRenderer slug={template.id} data={data} isPreview />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[65vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-panel-line bg-white/[0.02] px-6 text-center">
          <p className="text-[13px] font-medium text-panel-text">Cadastre seu perfil para ver a pré-visualização</p>
          <p className="max-w-sm text-[12px] leading-relaxed text-panel-muted">
            Complete nome artístico e username na tela Perfil; o preview mostrará o seu
            portfólio real com este estilo.
          </p>
        </div>
      )}
    </Modal>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ErroAcao } from "@/lib/erros-painel";

/**
 * Popup único de erro do painel.
 *
 * Mostra o motivo (nunca "Dados inválidos" solto) e, quando existe solução, um
 * botão que leva à página certa já com o campo em foco. O texto vem de
 * `explicarErroSalvar`/`erroSemPerfil` (lib/erros-painel) para ficar igual em
 * todas as telas.
 *
 * Quando o erro é de formulário (400), o próprio formulário continua montado
 * atrás do popup — fechar devolve os dados digitados, sem recarregar a página.
 */
export function ErroAcaoDialog({
  erro,
  onClose,
}: {
  erro: ErroAcao | null;
  onClose: () => void;
}) {
  const router = useRouter();

  const irParaDestino = () => {
    const href = erro?.destino?.href;
    if (!href) return;
    onClose();
    router.push(href);
  };

  return (
    <Modal
      isOpen={Boolean(erro)}
      onClose={onClose}
      size="sm"
      title={erro?.titulo ?? "Algo deu errado"}
      description={erro?.mensagem}
      footer={
        erro?.destino ? (
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            <Button
              type="button"
              onClick={irParaDestino}
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              {erro.destino.label}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={onClose}>
            Entendi
          </Button>
        )
      }
    >
      {erro?.detalhe ? (
        <div className="flex items-start gap-3 rounded border border-danger/25 bg-danger/[0.06] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-panel-text">{erro.detalhe}</p>
        </div>
      ) : null}
    </Modal>
  );
}

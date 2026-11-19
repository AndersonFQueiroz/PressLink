"use client";

import { Button } from "@/components/ui/Button";

/**
 * Falha ao carregar uma tela do painel. Mostra o essencial e deixa o usuário
 * tentar de novo sem recarregar a página inteira. Não expõe a mensagem crua do
 * servidor — só o código de digest, para suporte.
 */
export default function PainelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[56ch] border-t border-panel-line pt-8">
      <h1 className="font-serif font-bold text-[30px] leading-tight text-panel-text">
        Esta tela não carregou
      </h1>
      <p className="mt-3 text-[13px] leading-relaxed text-panel-muted">
        Os seus dados continuam salvos. Tente abrir a tela de novo; se continuar
        acontecendo, fale com o suporte.
      </p>
      <Button className="mt-5" onClick={reset}>
        Tentar de novo
      </Button>
      {error.digest && (
        <p className="mt-4 text-[11px] text-panel-muted">Código do erro: {error.digest}</p>
      )}
    </div>
  );
}

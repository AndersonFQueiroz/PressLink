"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type DangerZoneContaProps = {
  email: string | null;
};

/**
 * Zona de perigo de /painel/configuracoes (issue #29 / RNF-12 / LGPD art. 18).
 *
 * A exclusão só acontece depois que o dono abre o modal e digita a senha: a
 * senha é revalidada no servidor (DELETE /api/conta), não aqui — este
 * componente nunca decide sozinho que a conta pode ser apagada.
 */
export function DangerZoneConta({ email }: DangerZoneContaProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function abrir() {
    setSenha("");
    setErro(null);
    setAberto(true);
  }

  function fechar() {
    if (enviando) return;
    setAberto(false);
    setSenha("");
    setErro(null);
  }

  async function confirmar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const res = await fetch("/api/conta", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };

      if (!res.ok) {
        setErro(json.error ?? "Não foi possível excluir a conta. Tente novamente.");
        return;
      }

      setAberto(false);
      setSenha("");
      // Sessão já foi encerrada no servidor; a landing mostra o aviso.
      router.replace(json.redirect ?? "/?conta=excluida");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <section
        aria-labelledby="zona-de-perigo-titulo"
        className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
          <div>
            <h2
              id="zona-de-perigo-titulo"
              className="font-display text-lg font-bold tracking-tight text-rose-100"
            >
              Zona de perigo
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-rose-100/70">
              Excluir a conta apaga <strong className="font-semibold text-rose-100">definitivamente</strong> o
              seu perfil público, as fotos, os links, a música, a agenda e as estatísticas.
              Não há como desfazer e o mesmo nome de usuário pode ser usado por outra pessoa
              depois.
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-rose-500/20 pt-5">
          <Button
            type="button"
            variant="danger"
            onClick={abrir}
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          >
            Excluir minha conta
          </Button>
          <p className="mt-3 text-xs text-rose-100/60">
            Direito ao esquecimento — LGPD, art. 18, VI.
          </p>
        </div>
      </section>

      <Modal
        isOpen={aberto}
        onClose={fechar}
        title="Excluir conta permanentemente"
        description="Esta ação não pode ser desfeita. Confirme com a sua senha para continuar."
        size="md"
      >
        <form onSubmit={confirmar} className="space-y-4" noValidate>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.08] p-4 text-sm text-rose-100/85">
            <p className="font-semibold text-rose-100">Serão apagados agora:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>o perfil público e o endereço que você divulgou;</li>
              <li>todas as fotos dos buckets <span className="font-mono text-xs">avatars</span> e{" "}
                <span className="font-mono text-xs">galeria</span>;</li>
              <li>links, músicas, agenda e estatísticas de visitas;</li>
              <li>o usuário de acesso (você sai da conta imediatamente).</li>
            </ul>
          </div>

          {email && (
            <p className="text-xs text-white/50">
              Conta: <span className="font-medium text-white/70">{email}</span>
            </p>
          )}

          <Input
            label="Senha atual"
            type="password"
            name="senha"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={erro ?? undefined}
            disabled={enviando}
            required
            autoFocus
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={enviando}
              disabled={senha.length === 0}
            >
              Excluir definitivamente
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

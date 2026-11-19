"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Circle, PowerOff } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type RequisitoPublicacao = {
  label: string;
  href: string;
  done: boolean;
};

interface PublicacaoStatusProps {
  initialPublicado: boolean;
  username: string | null;
  requisitos: RequisitoPublicacao[];
}

/**
 * Status de publicação global do painel.
 *
 * O estado fica no topo de todas as telas: a chave mostra Rascunho/No ar e abre
 * o menu com ver página, copiar link e despublicar. O botão "Publicar" executa;
 * a placa magenta desliza com ease-out expo — o único gesto expressivo do painel.
 */
export function PublicacaoStatus({
  initialPublicado,
  username,
  requisitos,
}: PublicacaoStatusProps) {
  const [publicado, setPublicado] = useState(initialPublicado);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modal, setModal] = useState<"checklist" | "despublicar" | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendenciasApi, setPendenciasApi] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const faltando = requisitos.filter((r) => !r.done);

  // O servidor manda o estado real; quando o refresh chega, a chave local
  // acompanha (o cabeçalho da Visão geral lê o mesmo dado no servidor).
  useEffect(() => {
    setPublicado(initialPublicado);
  }, [initialPublicado]);

  useEffect(() => {
    if (!menuAberto) return;
    const fechar = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    const escapar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", escapar);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", escapar);
    };
  }, [menuAberto]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const publicUrl = username ? `${typeof window !== "undefined" ? window.location.origin : ""}/${username}` : "";

  const copiarLink = async () => {
    setMenuAberto(false);
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.prompt("Copie o link da sua página:", publicUrl);
    }
  };

  const publicar = async () => {
    setErro(null);
    setPendenciasApi([]);
    if (faltando.length > 0) {
      setModal("checklist");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/publicar", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (Array.isArray(data.pendencias) && data.pendencias.length > 0) {
          setPendenciasApi(data.pendencias.map(String));
          setModal("checklist");
        } else {
          setErro(data.error ?? "Não foi possível publicar agora. Tente novamente.");
          setModal("checklist");
        }
        return;
      }
      setPublicado(true);
      setModal(null);
      setAviso("Sua página está no ar.");
      // Re-renderiza o que é do servidor (texto do cabeçalho, selo do painel)
      // na hora, sem esperar F5.
      router.refresh();
    } catch {
      setErro("Erro de conexão ao publicar. Tente novamente.");
      setModal("checklist");
    } finally {
      setCarregando(false);
    }
  };

  const despublicar = async () => {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/despublicar", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível despublicar agora. Tente novamente.");
        return;
      }
      setPublicado(false);
      setModal(null);
      setAviso("Sua página saiu do ar. Só você consegue vê-la agora.");
      router.refresh();
    } catch {
      setErro("Erro de conexão ao despublicar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {aviso && (
        <span
          role="status"
          className="hidden max-w-[220px] truncate text-[12px] text-ok lg:inline"
        >
          {aviso}
        </span>
      )}

      {copiado && (
        <span role="status" className="hidden text-[12px] text-panel-muted lg:inline">
          Link copiado
        </span>
      )}

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuAberto}
          aria-label={`Status da página: ${publicado ? "no ar" : "rascunho"}. Abrir opções.`}
          className="pl-spring relative inline-flex h-8 items-stretch overflow-hidden rounded border border-panel-line bg-panel-raised p-[3px] text-[11px] font-medium transition-colors hover:border-panel-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-panel-bg"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-y-[3px] left-[3px] w-[60px] rounded-[3px] transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              publicado ? "translate-x-[60px] bg-signal" : "translate-x-0 bg-white/[0.07]",
            )}
          />
          <span
            className={cn(
              "relative z-10 flex w-[60px] items-center justify-center transition-colors duration-200",
              publicado ? "text-panel-muted" : "text-panel-text",
            )}
          >
            Rascunho
          </span>
          <span
            className={cn(
              "relative z-10 flex w-[60px] items-center justify-center transition-colors duration-200",
              publicado ? "text-ink" : "text-panel-muted",
            )}
          >
            No ar
          </span>
        </button>

        {menuAberto && (
          <div
            role="menu"
            className="pl-pop absolute right-0 z-40 mt-2 w-56 rounded-lg border border-panel-line bg-panel-raised p-1 shadow-xl shadow-black/50"
          >
            <MenuItem href={publicado && username ? `/${username}` : "/painel/perfil"}>
              Ver página
            </MenuItem>
            <MenuItem onClick={copiarLink} disabled={!publicado || !username}>
              Copiar link
            </MenuItem>
            <div className="my-1 h-px bg-white/[0.07]" />
            {publicado ? (
              <MenuItem
                onClick={() => {
                  setMenuAberto(false);
                  setModal("despublicar");
                }}
                danger
              >
                Despublicar página
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  setMenuAberto(false);
                  void publicar();
                }}
              >
                Publicar agora
              </MenuItem>
            )}
          </div>
        )}
      </div>

      {!publicado && (
        <Button size="sm" onClick={() => void publicar()} isLoading={carregando}>
          Publicar
        </Button>
      )}

      <Modal
        isOpen={modal === "checklist"}
        onClose={() => setModal(null)}
        title={publicado ? "Tudo pronto" : "Publicar sua página"}
        description={
          publicado
            ? "Sua página já está no ar."
            : faltando.length > 0
              ? "Falta pouco. Estes itens são obrigatórios para o público ver sua página:"
              : "Tudo certo. Sua página vai ficar no ar imediatamente."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Fechar
            </Button>
            {!publicado && (
              <Button onClick={() => void publicar()} isLoading={carregando}>
                Publicar agora
              </Button>
            )}
          </>
        }
      >
        <ul className="divide-y divide-panel-line">
          {requisitos.map((req) => (
            <li key={req.label} className="pl-row flex items-center justify-between gap-3 py-2.5 pl-3">
              <span className="flex items-center gap-2.5">
                {req.done ? (
                  <Check className="h-4 w-4 shrink-0 text-signal-soft" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-panel-muted/50" aria-hidden="true" />
                )}
                <span className={req.done ? "text-panel-muted" : "text-panel-text"}>
                  {req.label}
                </span>
              </span>
              {!req.done && (
                <Link
                  href={req.href}
                  className="shrink-0 text-[12px] font-medium text-signal-soft underline-offset-4 hover:underline"
                >
                  Resolver
                </Link>
              )}
            </li>
          ))}
        </ul>

        {pendenciasApi.length > 0 && (
          <ul className="mt-3 space-y-1 rounded border border-warn/25 bg-warn/[0.07] p-3 text-[12px] text-warn">
            {pendenciasApi.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {erro && (
          <p role="alert" className="mt-3 text-[12px] text-danger">
            {erro}
          </p>
        )}
      </Modal>

      <Modal
        isOpen={modal === "despublicar"}
        onClose={() => setModal(null)}
        size="sm"
        title="Despublicar a página?"
        description="O endereço deixa de abrir para o público. Seus dados continuam salvos e você pode publicar de novo quando quiser."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void despublicar()} isLoading={carregando}>
              <PowerOff className="h-4 w-4" aria-hidden="true" />
              Despublicar
            </Button>
          </>
        }
      >
        {erro && (
          <p role="alert" className="text-[12px] text-danger">
            {erro}
          </p>
        )}
      </Modal>
    </div>
  );
}

function MenuItem({
  children,
  href,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const classes = cn(
    "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] transition-colors",
    danger
      ? "text-danger hover:bg-danger/10"
      : "text-panel-muted hover:bg-white/[0.06] hover:text-panel-text",
    disabled && "pointer-events-none opacity-35",
  );

  if (href && !disabled) {
    return (
      <Link href={href} role="menuitem" className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

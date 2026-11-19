"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Circle, PowerOff } from "lucide-react";
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
 * Antes (até 19/11/2026) publicar/despublicar só existia no dashboard, e o
 * usuário descobria o que faltava levando um erro depois do clique. Agora o
 * estado fica no topo de todas as telas e o checklist mostra o que falta com
 * link direto para resolver.
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

  const faltando = requisitos.filter((r) => !r.done);

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
          className="hidden max-w-[220px] truncate text-[12px] text-[#a4edaf] lg:inline"
        >
          {aviso}
        </span>
      )}

      {copiado && (
        <span role="status" className="hidden text-[12px] text-white/50 lg:inline">
          Link copiado
        </span>
      )}

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuAberto}
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-[12px] font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
            publicado
              ? "border-[#7ce38b]/25 bg-[#7ce38b]/[0.08] text-[#a4edaf] hover:bg-[#7ce38b]/[0.12]"
              : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white/80",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              publicado ? "bg-[#7ce38b]" : "bg-[#e8c468]",
            )}
          />
          <span className="hidden sm:inline">{publicado ? "Publicado" : "Rascunho"}</span>
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
        </button>

        {menuAberto && (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-1.5 w-56 rounded-lg border border-white/10 bg-panel-raised p-1 shadow-xl shadow-black/50"
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
        <ul className="divide-y divide-white/[0.06]">
          {requisitos.map((req) => (
            <li key={req.label} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2.5">
                {req.done ? (
                  <Check className="h-4 w-4 shrink-0 text-brand-soft" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-white/25" aria-hidden="true" />
                )}
                <span className={req.done ? "text-white/45" : "text-white/85"}>{req.label}</span>
              </span>
              {!req.done && (
                <Link
                  href={req.href}
                  className="shrink-0 text-[12px] font-medium text-brand-soft/90 underline-offset-4 hover:underline"
                >
                  Resolver
                </Link>
              )}
            </li>
          ))}
        </ul>

        {pendenciasApi.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-md border border-[#e8c468]/25 bg-[#e8c468]/[0.07] p-3 text-[12px] text-[#f0d58e]">
            {pendenciasApi.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {erro && (
          <p role="alert" className="mt-3 text-[12px] text-[#ff9a9a]">
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
          <p role="alert" className="text-[12px] text-[#ff9a9a]">
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
    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors",
    danger ? "text-[#ff9a9a] hover:bg-[#ff6b6b]/10" : "text-white/75 hover:bg-white/[0.06] hover:text-white",
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

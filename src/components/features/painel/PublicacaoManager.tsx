"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Eye,
  PowerOff,
  ArrowRight,
  Send,
  MousePointerClick,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PublicPageLink } from "@/components/features/painel/PublicPageLink";

interface PublicacaoManagerProps {
  initialPublicado?: boolean;
  initialUsername?: string;
}

export function PublicacaoManager({
  initialPublicado,
  initialUsername,
}: PublicacaoManagerProps) {
  const [publicado, setPublicado] = useState<boolean>(initialPublicado ?? false);
  const [username, setUsername] = useState<string>(initialUsername ?? "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modais
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);
  const [errorsModalOpen, setErrorsModalOpen] = useState(false);
  const [pendencias, setPendencias] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Busca dados mais recentes do perfil
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/perfil");
        if (res.ok) {
          const json = await res.json();
          if (active && json.perfil) {
            setPublicado(Boolean(json.perfil.publicado));
            if (json.perfil.username) {
              setUsername(json.perfil.username);
            }
          }
        }
      } catch {
        // Fallback se perfil não carregar
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleCopyLink = async () => {
    const fullUrl = `https://presslink.app/${username || "nomedodj"}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignora erro se sem permissão de clipboard
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setApiError(null);
    setPendencias([]);

    try {
      const res = await fetch("/api/publicar", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.pendencias && Array.isArray(data.pendencias)) {
          setPendencias(data.pendencias);
        } else {
          setApiError(data.error || "Não foi possível publicar seu portfólio.");
        }
        setErrorsModalOpen(true);
        return;
      }

      setPublicado(true);
      if (data.username) {
        setUsername(data.username);
      }
      setSuccessModalOpen(true);
    } catch {
      setApiError("Erro de conexão ao tentar publicar. Tente novamente.");
      setErrorsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/despublicar", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.error || "Não foi possível despublicar seu portfólio.");
        setErrorsModalOpen(true);
        return;
      }

      setPublicado(false);
      setUnpublishModalOpen(false);
    } catch {
      setApiError("Erro de conexão ao tentar despublicar. Tente novamente.");
      setErrorsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const displayUrl = `presslink.app/${username || "nomedodj"}`;

  return (
    <section className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden mb-12">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
          Área do Artista
        </p>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
          A pista é sua.<br />
          <span className="text-fuchsia-400">Gerencie seu portfólio.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl">
          Mantenha suas faixas, fotos e próximas apresentações sempre atualizadas para produtores e contratantes de eventos.
        </p>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/painel/perfil"
            className="rounded-full bg-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400 flex items-center gap-2"
          >
            <span>Editar meu perfil</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {publicado ? (
            <>
              <PublicPageLink
                username={username}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Ver página pública</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </PublicPageLink>

              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 opacity-60" />
                    <span>Copiar link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setUnpublishModalOpen(true)}
                className="rounded-full border border-white/10 px-4 py-3.5 text-sm font-medium text-white/50 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 flex items-center gap-2"
                title="Despublicar portfólio"
              >
                <PowerOff className="w-4 h-4" />
                <span className="hidden sm:inline">Despublicar</span>
              </button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handlePublish}
              isLoading={loading}
              className="rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-600/30 hover:from-fuchsia-500 hover:to-pink-500 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Portfólio</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-fuchsia-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">Visualizações</p>
            <p className="text-xl font-bold font-display text-white">
              0 <span className="text-xs font-normal text-white/40">este mês</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-fuchsia-400">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">Cliques em Contato</p>
            <p className="text-xl font-bold font-display text-white">
              0 <span className="text-xs font-normal text-white/40">conversões</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${
              publicado
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/[0.04] text-fuchsia-400"
            }`}
          >
            {publicado ? <Globe className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-white/45">Status da Página</p>
            {publicado ? (
              <p className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Publicado
              </p>
            ) : (
              <p className="text-sm font-semibold text-amber-300 flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Rascunho
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Sucesso na Publicação (RF-26 / Critério de Aceitação) */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Portfólio Publicado com Sucesso! 🎉"
        description="Seu Electronic Press Kit já está no ar e pronto para ser divulgado para contratantes e festivais."
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setSuccessModalOpen(false)}
            >
              Fechar
            </Button>
            <PublicPageLink
              username={username}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 text-sm font-semibold text-white shadow-md shadow-fuchsia-600/20 transition hover:bg-fuchsia-500"
            >
              <span>Abrir página pública</span>
              <ExternalLink className="w-4 h-4" />
            </PublicPageLink>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
              Sua URL Pública Oficial
            </p>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-black/40 border border-fuchsia-500/30 p-3 font-mono text-base font-bold text-fuchsia-300 select-all">
              <Globe className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span className="truncate">{displayUrl}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white/70" />
                  <span>Copiar Link</span>
                </>
              )}
            </Button>

            <PublicPageLink
              username={username}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4 text-white/70" />
              <span>Abrir no Navegador</span>
            </PublicPageLink>
          </div>

          <p className="text-xs text-white/40 text-center leading-relaxed">
            Você pode atualizar suas fotos, faixas e agenda a qualquer momento. Suas alterações são sincronizadas imediatamente com a página pública.
          </p>
        </div>
      </Modal>

      {/* Modal 2: Pré-requisitos Pendentes (RF-25) */}
      <Modal
        isOpen={errorsModalOpen}
        onClose={() => setErrorsModalOpen(false)}
        title="Pré-requisitos para Publicação"
        description="Para garantir uma apresentação profissional aos contratantes, complete as pendências abaixo antes de publicar:"
        footer={
          <Button variant="primary" onClick={() => setErrorsModalOpen(false)}>
            Entendi, vou completar
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          {pendencias.length > 0 ? (
            <ul className="space-y-2.5">
              {pendencias.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-sm text-amber-200"
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-100">{item}</p>
                    {item.includes("Nome artístico") && (
                      <Link
                        href="/painel/perfil"
                        onClick={() => setErrorsModalOpen(false)}
                        className="inline-block mt-1 text-xs text-amber-300 underline hover:text-amber-100"
                      >
                        Ir para Perfil do DJ &rarr;
                      </Link>
                    )}
                    {item.includes("foto") && (
                      <Link
                        href="/painel/galeria"
                        onClick={() => setErrorsModalOpen(false)}
                        className="inline-block mt-1 text-xs text-amber-300 underline hover:text-amber-100"
                      >
                        Ir para Galeria de Fotos &rarr;
                      </Link>
                    )}
                    {item.includes("link") && (
                      <Link
                        href="/painel/musica"
                        onClick={() => setErrorsModalOpen(false)}
                        className="inline-block mt-1 text-xs text-amber-300 underline hover:text-amber-100"
                      >
                        Ir para Música & Vídeos &rarr;
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p>{apiError || "Ocorreu um erro ao processar a solicitação."}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal 3: Confirmação de Despublicação (RF-27) */}
      <Modal
        isOpen={unpublishModalOpen}
        onClose={() => setUnpublishModalOpen(false)}
        title="Despublicar Portfólio?"
        description="Ao despublicar, sua página deixará de ser acessível publicamente até que você decida publicá-la novamente."
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setUnpublishModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleUnpublish}
              isLoading={loading}
            >
              Sim, despublicar
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-sm text-white/70">
            Seus dados, fotos, links e configurações continuarão salvos com segurança no painel. Você poderá publicar novamente com um clique quando quiser.
          </p>
        </div>
      </Modal>
    </section>
  );
}

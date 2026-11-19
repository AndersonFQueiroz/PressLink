"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  ExternalLink,
  Music,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  LinkDeMidia,
  TipoMidia,
  detectTipoMidia,
} from "@/lib/validators/links";
import { MediaEmbed, ProviderBadge } from "@/components/features/painel/MediaEmbed";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface LinksMusicaFormProps {
  initialLinks: LinkDeMidia[];
}

export function LinksMusicaForm({ initialLinks }: LinksMusicaFormProps) {
  const [links, setLinks] = useState<LinkDeMidia[]>(initialLinks);
  const [newUrl, setNewUrl] = useState("");
  const [newTitulo, setNewTitulo] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  // Estados para edição
  const [editingLink, setEditingLink] = useState<LinkDeMidia | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Estados para exclusão
  const [deletingLink, setDeletingLink] = useState<LinkDeMidia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Controle de pré-visualização individual na lista
  const [expandedPreviews, setExpandedPreviews] = useState<Record<string, boolean>>({});

  // Detecção em tempo real do provedor para a nova URL
  const detectedTipo: TipoMidia | null = detectTipoMidia(newUrl);

  const togglePreview = (id: string) => {
    setExpandedPreviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      setErrorMsg("Informe a URL da música ou vídeo.");
      return;
    }

    const tipo = detectTipoMidia(trimmedUrl);
    if (!tipo) {
      setErrorMsg("A URL deve ser do Spotify, SoundCloud ou YouTube.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmedUrl,
          titulo: newTitulo.trim() || undefined,
          tipo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar link.");
      }

      setLinks((prev) => [...prev, data.link]);
      setNewUrl("");
      setNewTitulo("");
      setSuccessMsg("Mídia adicionada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (link: LinkDeMidia) => {
    setEditingLink(link);
    setEditTitulo(link.titulo || "");
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    setIsEditingSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/links/${editingLink.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: editTitulo.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar título.");
      }

      setLinks((prev) =>
        prev.map((item) => (item.id === editingLink.id ? data.link : item))
      );
      setEditingLink(null);
      setSuccessMsg("Título atualizado!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao atualizar.");
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLink) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/links/${deletingLink.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir mídia.");
      }

      setLinks((prev) => prev.filter((item) => item.id !== deletingLink.id));
      setDeletingLink(null);
      setSuccessMsg("Mídia removida com sucesso.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao remover.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const previousLinks = [...links];
    const newLinks = [...links];
    const [movedItem] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, movedItem);

    // Otimista
    setLinks(newLinks);

    startTransition(async () => {
      try {
        const ids = newLinks.map((l) => l.id);
        const res = await fetch("/api/links/reordenar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });

        if (!res.ok) {
          throw new Error("Falha ao salvar a nova ordem.");
        }
      } catch (err: unknown) {
        // Rollback em caso de erro
        setLinks(previousLinks);
        setErrorMsg(err instanceof Error ? err.message : "Erro ao reordenar.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Mensagens de Sucesso ou Erro Globais */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-[#7ce38b]/25 bg-[#7ce38b]/[0.08] p-3 text-[13px] text-[#a4edaf]">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.08] p-3 text-[13px] text-[#ff9a9a]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Seção 1: Formulário de Cadastro de Novo Link */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-medium text-white/75">Adicionar música ou vídeo</h2>
          {detectedTipo && <ProviderBadge tipo={detectedTipo} />}
        </div>

        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="URL da faixa, álbum ou vídeo"
              placeholder="https://open.spotify.com/track/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={isSubmitting}
              helperText="Spotify, SoundCloud e YouTube."
            />

            <Input
              label="Título (opcional)"
              placeholder="Ex.: Track Oficial (Remix 2026)"
              value={newTitulo}
              onChange={(e) => setNewTitulo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Pré-visualização do Embed antes de adicionar */}
          {detectedTipo && newUrl.trim() && (
            <div className="space-y-2 rounded-lg border border-panel-line bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-[11px] text-white/45">
                <span>Pré-visualização do player</span>
                <ProviderBadge tipo={detectedTipo} />
              </div>
              <MediaEmbed tipo={detectedTipo} url={newUrl} titulo={newTitulo} />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Adicionar à lista
            </Button>
          </div>
        </form>
      </div>

      {/* Seção 2: Lista de Links Cadastrados e Reordenação */}
      <div className="space-y-3 border-t border-panel-line pt-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[13px] font-medium text-white/75">
            Na sua página ({links.length})
          </h2>
          {links.length > 1 && (
            <span className="text-[12px] text-white/30">
              Use as setas para definir a ordem
            </span>
          )}
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
            <Music className="h-5 w-5 text-white/25" aria-hidden="true" />
            <p className="text-[13px] font-medium text-white/70">
              Nenhuma música ou vídeo cadastrado ainda.
            </p>
            <p className="max-w-sm text-[12px] leading-relaxed text-white/35">
              Cole um link do Spotify, SoundCloud ou YouTube para montar o player
              do seu press kit.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {links.map((link, index) => {
              const isFirst = index === 0;
              const isLast = index === links.length - 1;
              const isPreviewOpen = expandedPreviews[link.id] ?? false;

              return (
                <li
                  key={link.id}
                  className="space-y-3 rounded-lg border border-panel-line bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/[0.05] text-[11px] font-semibold text-white/50">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <ProviderBadge tipo={link.tipo} />
                          <h3 className="truncate text-[13px] font-medium text-white/90">
                            {link.titulo || "Sem título informado"}
                          </h3>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-1 truncate text-[12px] text-white/35 transition-colors hover:text-white/70"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                        </a>
                      </div>
                    </div>

                    {/* Ações: Reordenar, Preview, Editar, Excluir */}
                    <div className="flex shrink-0 items-center gap-0.5 self-end sm:self-center">
                      {/* Subir */}
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={isFirst}
                        type="button"
                        aria-label="Mover para cima"
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>

                      {/* Descer */}
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={isLast}
                        type="button"
                        aria-label="Mover para baixo"
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>

                      {/* Alternar Preview */}
                      <button
                        onClick={() => togglePreview(link.id)}
                        type="button"
                        aria-label={isPreviewOpen ? "Ocultar player" : "Ver player"}
                        title={isPreviewOpen ? "Ocultar player" : "Ver player"}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        {isPreviewOpen ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                      {/* Editar Título */}
                      <button
                        onClick={() => handleOpenEdit(link)}
                        type="button"
                        aria-label="Editar título"
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Excluir */}
                      <button
                        onClick={() => setDeletingLink(link)}
                        type="button"
                        aria-label="Excluir música"
                        className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-[#ff6b6b]/10 hover:text-[#ff9a9a]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Player Embed Expandido */}
                  {isPreviewOpen && (
                    <div className="border-t border-panel-line pt-3 animate-in fade-in duration-200">
                      <MediaEmbed tipo={link.tipo} url={link.url} titulo={link.titulo} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal de Edição de Título */}
      <Modal
        isOpen={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
        title="Editar Faixa"
        description="Altere o título de exibição deste link."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setEditingLink(null)}
              disabled={isEditingSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              isLoading={isEditingSaving}
            >
              Salvar Alterações
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Título da Faixa"
            value={editTitulo}
            onChange={(e) => setEditTitulo(e.target.value)}
            placeholder="Ex.: Track Oficial (Remix)"
          />
          {editingLink && (
            <p className="text-xs text-white/50 truncate">
              URL: {editingLink.url}
            </p>
          )}
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={Boolean(deletingLink)}
        onClose={() => setDeletingLink(null)}
        title="Excluir Mídia"
        description="Tem certeza de que deseja remover esta música ou vídeo da sua lista?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeletingLink(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Sim, Excluir
            </Button>
          </>
        }
      >
        <div className="text-sm text-white/80">
          Esta ação removerá o link{" "}
          <strong className="text-white">
            {deletingLink?.titulo || deletingLink?.url}
          </strong>{" "}
          do seu perfil.
        </div>
      </Modal>
    </div>
  );
}

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
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Seção 1: Formulário de Cadastro de Novo Link */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-fuchsia-400" />
            Adicionar Nova Música ou Vídeo
          </h2>
          {detectedTipo && <ProviderBadge tipo={detectedTipo} />}
        </div>

        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="space-y-3">
            <Input
              label="URL da Faixa, Álbum ou Vídeo"
              placeholder="https://open.spotify.com/track/... ou https://youtube.com/watch?v=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={isSubmitting}
              helperText="Suporta links públicos de músicas ou playlists do Spotify, faixas do SoundCloud e vídeos do YouTube."
            />

            <Input
              label="Título Personalizado (Opcional)"
              placeholder="Ex.: Track Oficial (Remix 2026)"
              value={newTitulo}
              onChange={(e) => setNewTitulo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Pré-visualização do Embed antes de adicionar */}
          {detectedTipo && newUrl.trim() && (
            <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/[0.03] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-fuchsia-300 font-medium">
                <span>Pré-visualização do Player Embed:</span>
                <ProviderBadge tipo={detectedTipo} />
              </div>
              <MediaEmbed tipo={detectedTipo} url={newUrl} titulo={newTitulo} />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Adicionar à Lista
            </Button>
          </div>
        </form>
      </div>

      {/* Seção 2: Lista de Links Cadastrados e Reordenação */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Music className="h-4 w-4 text-fuchsia-400" />
            Músicas e Vídeos Cadastrados ({links.length})
          </h2>
          <span className="text-xs text-white/50">
            Use as setas para definir a ordem na sua página pública
          </span>
        </div>

        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center text-white/40">
              <Music className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-white/70">
              Nenhuma música ou vídeo cadastrado ainda.
            </p>
            <p className="text-xs text-white/40 max-w-sm">
              Adicione links de suas faixas favoritas no Spotify, SoundCloud ou clipes no YouTube para compor o seu Press Kit.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => {
              const isFirst = index === 0;
              const isLast = index === links.length - 1;
              const isPreviewOpen = expandedPreviews[link.id] ?? false;

              return (
                <div
                  key={link.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white/70">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ProviderBadge tipo={link.tipo} />
                          <h3 className="text-sm font-semibold text-white truncate">
                            {link.titulo || "Sem título informado"}
                          </h3>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/50 hover:text-fuchsia-300 truncate flex items-center gap-1 group"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    </div>

                    {/* Ações: Reordenar, Preview, Editar, Excluir */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Subir */}
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={isFirst}
                        type="button"
                        aria-label="Mover para cima"
                        className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>

                      {/* Descer */}
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={isLast}
                        type="button"
                        aria-label="Mover para baixo"
                        className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>

                      {/* Alternar Preview */}
                      <button
                        onClick={() => togglePreview(link.id)}
                        type="button"
                        aria-label={isPreviewOpen ? "Ocultar player" : "Ver player"}
                        title={isPreviewOpen ? "Ocultar player" : "Ver player"}
                        className="rounded-lg p-2 text-white/60 hover:text-fuchsia-300 hover:bg-white/10 transition-colors"
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
                        className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Excluir */}
                      <button
                        onClick={() => setDeletingLink(link)}
                        type="button"
                        aria-label="Excluir música"
                        className="rounded-lg p-2 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Player Embed Expandido */}
                  {isPreviewOpen && (
                    <div className="pt-2 border-t border-white/5 animate-in fade-in duration-200">
                      <MediaEmbed tipo={link.tipo} url={link.url} titulo={link.titulo} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

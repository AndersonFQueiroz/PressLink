"use client";

import { useState } from "react";
import { GaleriaUpload } from "@/components/features/galeria/GaleriaUpload";
import { GaleriaGrid, Foto } from "@/components/features/galeria/GaleriaGrid";
import { GaleriaDeleteModal } from "@/components/features/galeria/GaleriaDeleteModal";

export function GaleriaClient({ initialFotos }: { initialFotos: Foto[] }) {
  const [fotos, setFotos] = useState<Foto[]>(initialFotos);
  const [toDelete, setToDelete] = useState<Foto | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  function handleUploaded(novas: Foto[]) {
    setFotos((prev) => [...prev, ...novas].sort((a, b) => a.ordem - b.ordem));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/galeria?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Falha ao excluir");
    setFotos((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleReorder(novas: Foto[]) {
    const prev = fotos;
    setFotos(novas);
    setReorderError(null);
    try {
      const res = await fetch("/api/galeria/reordenar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: novas.map((f) => f.id) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Falha ao reordenar");
    } catch (err) {
      setFotos(prev);
      setReorderError(err instanceof Error ? err.message : "Erro ao reordenar");
    }
  }

  return (
    <div className="space-y-6">
      <GaleriaUpload onUploaded={handleUploaded as never} />
      {reorderError && <p className="text-sm text-rose-400">{reorderError}</p>}
      {fotos.length > 1 && <p className="text-xs text-white/45">Arraste pelo ícone para reordenar.</p>}
      <GaleriaGrid fotos={fotos} onDelete={setToDelete} onReorder={handleReorder} />
      <GaleriaDeleteModal foto={toDelete} onClose={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}

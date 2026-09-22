"use client";

import { useState } from "react";
import { GaleriaUpload } from "@/components/features/galeria/GaleriaUpload";
import { GaleriaGrid, Foto } from "@/components/features/galeria/GaleriaGrid";
import { GaleriaDeleteModal } from "@/components/features/galeria/GaleriaDeleteModal";

export function GaleriaClient({ initialFotos }: { initialFotos: Foto[] }) {
  const [fotos, setFotos] = useState<Foto[]>(initialFotos);
  const [toDelete, setToDelete] = useState<Foto | null>(null);

  function handleUploaded(novas: Foto[]) {
    setFotos((prev) => [...prev, ...novas].sort((a, b) => a.ordem - b.ordem));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/galeria?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Falha ao excluir");
    setFotos((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-6">
      <GaleriaUpload onUploaded={handleUploaded as never} />
      <GaleriaGrid fotos={fotos} onDelete={setToDelete} />
      <GaleriaDeleteModal foto={toDelete} onClose={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}

"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Foto } from "./GaleriaGrid";

type Props = {
  foto: Foto | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
};

export function GaleriaDeleteModal({ foto, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!foto) return;
    setLoading(true);
    try {
      await onConfirm(foto.id);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={!!foto}
      onClose={onClose}
      title="Excluir foto?"
      description="A imagem será removida da galeria e apagada do armazenamento. Essa ação não pode ser desfeita."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" isLoading={loading} onClick={handleConfirm}>
            Excluir
          </Button>
        </>
      }
    >
      <p className="text-white/70">
        Tem certeza que deseja excluir esta foto da sua galeria?
      </p>
      {foto && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt={foto.alt_text || ""} className="h-48 w-full object-cover" />
        </div>
      )}
    </Modal>
  );
}

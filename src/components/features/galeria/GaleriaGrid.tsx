"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type Foto = {
  id: string;
  url: string;
  ordem: number;
  alt_text?: string | null;
};

type Props = {
  fotos: Foto[];
  onDelete: (foto: Foto) => void;
};

export function GaleriaGrid({ fotos, onDelete }: Props) {
  if (!fotos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
        <p className="text-sm text-white/60">Nenhuma foto na galeria ainda. Envie suas fotos promocionais acima.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {fotos.map((foto) => (
        <div key={foto.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt={foto.alt_text || "Foto galeria"} className="h-40 w-full object-cover sm:h-44" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <Button
            variant="danger"
            size="sm"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(foto)}
            aria-label="Excluir foto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

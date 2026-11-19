"use client";

import { useMemo } from "react";
import { Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export type Foto = {
  id: string;
  url: string;
  ordem: number;
  alt_text?: string | null;
};

type Props = {
  fotos: Foto[];
  onDelete: (foto: Foto) => void;
  onReorder?: (novasFotos: Foto[]) => void;
};

/**
 * Foto em cartão denso: a imagem manda, as ações só aparecem quando o mouse
 * chega (ou quando o card recebe foco). No toque a barra "Arrastar" continua
 * visível, porque esconder a única forma de reordenar não é elegante.
 */
function SortableFoto({
  foto,
  posicao,
  onDelete,
}: {
  foto: Foto;
  posicao: number;
  onDelete: (f: Foto) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: foto.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    "--pl-i": posicao - 1,
  } as React.CSSProperties;

  return (
    <figure
      ref={setNodeRef}
      style={style}
      className={cn(
        "pl-lift group relative m-0 overflow-hidden rounded-[var(--pl-r-card)] border border-white/[0.07] bg-panel-surface",
        isDragging && "scale-[1.02] border-signal/60 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.9)]",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto.url}
        alt={foto.alt_text || `Foto ${posicao} da galeria`}
        className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        loading="lazy"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      />

      <span
        className="tabular absolute left-2 top-2 rounded-[5px] bg-black/55 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white/80 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110"
        title={`Posição ${posicao}`}
      >
        {String(posicao).padStart(2, "0")}
      </span>

      <button
        type="button"
        onClick={() => onDelete(foto)}
        aria-label={`Excluir foto ${posicao}`}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/55 text-white/78 opacity-0 backdrop-blur-sm transition-[opacity,color] hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <figcaption className="absolute inset-x-0 bottom-0 flex translate-y-0 items-center sm:translate-y-[calc(100%-0px)] sm:opacity-0 sm:transition-all sm:duration-200 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
        <button
          type="button"
          aria-label={`Arrastar foto ${posicao} para reordenar`}
          className="inline-flex h-8 flex-1 cursor-grab items-center gap-1.5 border-t border-white/10 bg-black/55 px-2 text-[11px] text-white/75 backdrop-blur-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Arrastar
        </button>
      </figcaption>
    </figure>
  );
}

export function GaleriaGrid({ fotos, onDelete, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const ids = useMemo(() => fotos.map((f) => f.id), [fotos]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = fotos.findIndex((f) => f.id === active.id);
    const newIndex = fotos.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(fotos, oldIndex, newIndex).map((f, idx) => ({ ...f, ordem: idx }));
    onReorder(reordered);
  }

  if (!fotos.length) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-[var(--pl-r-card)] border border-dashed border-white/10 px-4 py-5">
        <div>
          <p className="text-[13px] font-medium text-panel-text">Galeria vazia.</p>
          <p className="mt-0.5 max-w-[56ch] text-[12px] leading-relaxed text-panel-muted">
            Envie as fotos promocionais acima. Elas aparecem na sua página na ordem
            definida aqui — arraste para trocar.
          </p>
        </div>
      </div>
    );
  }

  const grade = (lista: Foto[]) => (
    <div className="pl-stagger grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {lista.map((foto, indice) => (
        <SortableFoto key={foto.id} foto={foto} posicao={indice + 1} onDelete={onDelete} />
      ))}
    </div>
  );

  // sem reorder (fallback) mantém grid simples
  if (!onReorder) return grade(fotos);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {grade(fotos)}
      </SortableContext>
    </DndContext>
  );
}

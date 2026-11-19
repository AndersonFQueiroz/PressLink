"use client";

import { useMemo } from "react";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

function SortableFoto({ foto, onDelete }: { foto: Foto; onDelete: (f: Foto) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: foto.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative overflow-hidden rounded-lg border border-panel-line bg-black/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={foto.url} alt={foto.alt_text || "Foto galeria"} className="h-40 w-full object-cover sm:h-44" loading="lazy" />
      <Button
        variant="danger"
        size="sm"
        className="absolute right-2 top-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
        onClick={() => onDelete(foto)}
        aria-label="Excluir foto"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {/* handle de arraste — sempre visível no touch, com press-and-hold */}
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className="absolute left-2 top-2 rounded-md border border-white/10 bg-black/60 p-1.5 text-white/75 opacity-100 transition-opacity hover:bg-black/80 hover:text-white md:opacity-0 md:group-hover:opacity-100"
        style={{ touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
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
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-[13px] text-white/45">Nenhuma foto na galeria ainda. Envie suas fotos promocionais acima.</p>
      </div>
    );
  }

  // sem reorder (fallback) mantém grid simples
  if (!onReorder) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto) => (
          <SortableFoto key={foto.id} foto={foto} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto) => (
            <SortableFoto key={foto.id} foto={foto} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

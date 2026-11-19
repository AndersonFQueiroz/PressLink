"use client";

import { Calendar, MapPin, Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type Show = {
  id: string;
  nome_evento: string;
  data: string; // YYYY-MM-DD
  horario: string | null;
  local: string | null;
  cidade: string | null;
  created_at: string;
};

function isPast(show: Show): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(show.data + "T00:00:00");
  return d < today;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function AgendaList({
  shows,
  onEdit,
  onDelete,
}: {
  shows: Show[];
  onEdit: (s: Show) => void;
  onDelete: (s: Show) => void;
}) {
  if (!shows.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-[13px] text-white/45">
          Nenhum show cadastrado ainda. Adicione suas próximas apresentações.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-panel-line overflow-hidden rounded-xl border border-panel-line bg-panel-surface">
      {shows.map((show) => {
        const past = isPast(show);
        return (
          <li
            key={show.id}
            className={`flex items-center justify-between gap-4 px-4 py-3.5 transition-colors ${past ? "opacity-45" : "hover:bg-white/[0.02]"}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[13px] font-medium text-white/90">{show.nome_evento}</h3>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                    past
                      ? "bg-white/[0.05] text-white/35"
                      : "bg-brand/[0.12] text-brand-soft"
                  }`}
                >
                  {past ? "Realizado" : "Próximo"}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/40">
                <span className="tabular inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(show.data)}
                </span>
                {show.horario && (
                  <span className="tabular inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {show.horario.slice(0, 5)}
                  </span>
                )}
                {show.local && <span className="truncate">{show.local}</span>}
                {show.cidade && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {show.cidade}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button variant="ghost" size="sm" aria-label="Editar show" onClick={() => onEdit(show)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Excluir show"
                onClick={() => onDelete(show)}
                className="text-white/35 hover:text-[#ff9a9a]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

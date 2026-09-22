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
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
        <p className="text-sm text-white/60">Nenhum show cadastrado ainda. Adicione suas próximas apresentações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shows.map((show) => {
        const past = isPast(show);
        return (
          <div
            key={show.id}
            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${past ? "border-white/5 bg-white/[0.02] opacity-60" : "border-emerald-500/20 bg-emerald-500/[0.04]"}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white truncate">{show.nome_evento}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${past ? "bg-white/10 text-white/60" : "bg-emerald-500/20 text-emerald-300"}`}>
                  {past ? "Realizado" : "Próximo"}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(show.data)}
                </span>
                {show.horario && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {show.horario.slice(0, 5)}
                  </span>
                )}
                {show.local && <span className="inline-flex items-center gap-1.5 truncate">{show.local}</span>}
                {show.cidade && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {show.cidade}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" aria-label="Editar show" onClick={() => onEdit(show)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Excluir show" onClick={() => onDelete(show)} className="text-rose-300 hover:text-rose-200">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

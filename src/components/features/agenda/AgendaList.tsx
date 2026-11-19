"use client";

import type { CSSProperties } from "react";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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

function formatarData(data: string) {
  const d = new Date(`${data}T12:00:00Z`);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(d);
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
  const semana = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
  return { dia, mes, semana };
}

/** Distância em dias entre hoje e a data do show (negativo = passado). */
function diasAte(data: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(`${data}T00:00:00`);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

function seloDoShow(show: Show): { texto: string; classe: string } | null {
  const dias = diasAte(show.data);
  if (dias < 0) return null;
  if (dias === 0) return { texto: "Hoje", classe: "border-signal/30 bg-signal/10 text-signal-soft" };
  if (dias === 1) return { texto: "Amanhã", classe: "border-white/12 bg-white/[0.05] text-panel-text" };
  if (dias <= 7)
    return {
      texto: `Em ${dias} dias`,
      classe: "border-white/10 bg-white/[0.03] text-panel-muted",
    };
  return null;
}

function CartaoShow({
  show,
  passado,
  indice,
  onEdit,
  onDelete,
}: {
  show: Show;
  passado: boolean;
  indice: number;
  onEdit: (s: Show) => void;
  onDelete: (s: Show) => void;
}) {
  const { dia, mes, semana } = formatarData(show.data);
  const lugar = [show.local, show.cidade].filter(Boolean).join(", ");
  const selo = seloDoShow(show);

  return (
    <li
      className={cn(
        "pl-card pl-card-hover pl-lift group flex items-stretch gap-4 p-3 sm:p-3.5",
        passado && "bg-transparent",
      )}
      style={{ "--pl-i": indice } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className={cn(
          "flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[10px] border py-1.5",
          passado
            ? "border-white/[0.05] bg-white/[0.015]"
            : "border-white/[0.08] bg-white/[0.03]",
        )}
      >
        <span
          className={cn(
            "text-[10px] font-medium uppercase leading-none tracking-[0.08em]",
            passado ? "text-panel-muted/60" : "text-panel-muted",
          )}
        >
          {mes}
        </span>
        <span
          className={cn(
            "tabular mt-0.5 text-[24px] font-medium leading-none tracking-[-0.02em]",
            passado ? "text-panel-muted" : "text-panel-text",
          )}
        >
          {dia}
        </span>
        <span className="mt-1 text-[10px] leading-none text-panel-muted/70">{semana}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className={cn(
              "min-w-0 truncate text-[13.5px] font-medium",
              passado ? "text-panel-muted" : "text-panel-text",
            )}
          >
            {show.nome_evento}
          </h3>
          {selo && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-1.5 py-[1px] text-[10px] font-medium",
                selo.classe,
                selo.texto === "Hoje" && "pl-live",
              )}
            >
              {selo.texto}
            </span>
          )}
          {passado && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-white/[0.06] px-1.5 py-[1px] text-[10px] text-panel-muted/70">
              Realizado
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-[12px] text-panel-muted">
          {lugar || "Local a definir"}
          {show.horario ? (
            <>
              <span aria-hidden="true"> · </span>
              <span className="tabular">{show.horario.slice(0, 5)}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-center opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Editar ${show.nome_evento}`}
          onClick={() => onEdit(show)}
          className="px-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Excluir ${show.nome_evento}`}
          onClick={() => onDelete(show)}
          className="px-2 text-panel-muted hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

function Vazio({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-[var(--pl-r-card)] border border-dashed border-white/10 px-4 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-panel-muted">
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[13px] font-medium text-panel-text">Nenhuma data marcada.</p>
          <p className="mt-0.5 max-w-[52ch] text-[12px] leading-relaxed text-panel-muted">
            A agenda é o que mais transforma visita em contratação. Adicione a próxima
            apresentação para ela aparecer na sua página.
          </p>
        </div>
      </div>
      {onCreate && (
        <Button variant="secondary" size="sm" onClick={onCreate}>
          Adicionar show
        </Button>
      )}
    </div>
  );
}

export function AgendaList({
  shows,
  onEdit,
  onDelete,
  onCreate,
}: {
  shows: Show[];
  onEdit: (s: Show) => void;
  onDelete: (s: Show) => void;
  onCreate?: () => void;
}) {
  const proximos = shows.filter((show) => !isPast(show));
  const realizados = shows.filter(isPast).slice().reverse();

  return (
    <div className="space-y-8">
      <section aria-label="Próximos shows">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <h2 className="text-[12px] font-medium text-panel-text">Próximos</h2>
          <span className="tabular text-[11px] text-panel-muted">{proximos.length}</span>
        </div>

        {proximos.length === 0 ? (
          <Vazio onCreate={onCreate} />
        ) : (
          <ul className="pl-stagger space-y-2">
            {proximos.map((show, indice) => (
              <CartaoShow
                key={show.id}
                show={show}
                passado={false}
                indice={indice}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </section>

      {realizados.length > 0 && (
        <section aria-label="Shows realizados">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 className="text-[12px] font-medium text-panel-text">Realizados</h2>
            <span className="tabular text-[11px] text-panel-muted">{realizados.length}</span>
          </div>
          <ul className="pl-stagger space-y-2">
            {realizados.map((show, indice) => (
              <CartaoShow
                key={show.id}
                show={show}
                passado
                indice={indice}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

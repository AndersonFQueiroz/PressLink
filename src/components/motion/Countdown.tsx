"use client";

import { useEffect, useMemo, useState } from "react";
import type { TemplateShow } from "@/types/template";

interface CountdownProps {
  /** Próximo show; usa data (YYYY-MM-DD) + horário (HH:MM) quando existir. */
  show: TemplateShow | null;
  className?: string;
  tileClassName?: string;
  labelClassName?: string;
}

function targetDate(show: TemplateShow | null): number | null {
  if (!show?.data) return null;
  const time = show.horario && /^\d{2}:\d{2}/.test(show.horario) ? show.horario.slice(0, 5) : "23:59";
  const parsed = new Date(`${show.data}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Contagem regressiva para o próximo show. Não renderiza nada se já passou. */
export function Countdown({
  show,
  className,
  tileClassName,
  labelClassName,
}: CountdownProps) {
  const target = useMemo(() => targetDate(show), [show]);
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!target) return;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!target || (mounted && remaining <= 0)) return null;

  const parts = split(remaining);
  const cells = [
    { value: parts.days, label: "dias" },
    { value: parts.hours, label: "horas" },
    { value: parts.minutes, label: "min" },
    { value: parts.seconds, label: "seg" },
  ];

  return (
    <div className={className} role="timer" aria-label="Contagem regressiva para o próximo show">
      {cells.map((cell) => (
        <div key={cell.label} className={tileClassName}>
          <span className="tabular-nums">{String(cell.value).padStart(2, "0")}</span>
          <span className={labelClassName}>{cell.label}</span>
        </div>
      ))}
    </div>
  );
}

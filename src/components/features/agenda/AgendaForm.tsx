"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showCreateSchema, type ShowCreateData } from "@/lib/validators/shows";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

type Props = {
  defaultValues?: Partial<ShowCreateData>;
  onSubmit: (data: ShowCreateData) => Promise<void>;
  onCancel: () => void;
};

export function AgendaForm({ defaultValues, onSubmit, onCancel }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShowCreateData>({
    // cast necessário: Zod transform (""->null) diverge do tipo RHF string "" — padrão PerfilForm já usa any
    resolver: zodResolver(showCreateSchema) as unknown as never,
    defaultValues: {
      nome_evento: defaultValues?.nome_evento ?? "",
      data: defaultValues?.data ?? "",
      horario: defaultValues?.horario ?? "",
      local: defaultValues?.local ?? "",
      cidade: defaultValues?.cidade ?? "",
    },
  });

  async function submit(data: ShowCreateData) {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit as never)} className="space-y-4">
      {serverError && <p className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-300">{serverError}</p>}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2">Nome do evento *</label>
        <input
          {...register("nome_evento")}
          placeholder="Ex: Festival Pulsar"
          className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${errors.nome_evento ? "border-rose-500/70" : "border-white/10 focus:border-fuchsia-400"}`}
        />
        {errors.nome_evento && <p className="mt-1 text-xs text-rose-400">{errors.nome_evento.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2">Data *</label>
          <input
            type="date"
            {...register("data")}
            className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${errors.data ? "border-rose-500/70" : "border-white/10 focus:border-fuchsia-400"}`}
          />
          {errors.data && <p className="mt-1 text-xs text-rose-400">{errors.data.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2">Horário</label>
          <input
            type="time"
            {...register("horario")}
            className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${errors.horario ? "border-rose-500/70" : "border-white/10 focus:border-fuchsia-400"}`}
          />
          {errors.horario && <p className="mt-1 text-xs text-rose-400">{errors.horario.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2">Local</label>
        <input
          {...register("local")}
          placeholder="Ex: Club Vibe, Palco Principal"
          className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${errors.local ? "border-rose-500/70" : "border-white/10 focus:border-fuchsia-400"}`}
        />
        {errors.local && <p className="mt-1 text-xs text-rose-400">{errors.local.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2">Cidade / UF</label>
        <input
          {...register("cidade")}
          placeholder="Ex: São Paulo/SP"
          className={`w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${errors.cidade ? "border-rose-500/70" : "border-white/10 focus:border-fuchsia-400"}`}
        />
        {errors.cidade && <p className="mt-1 text-xs text-rose-400">{errors.cidade.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}

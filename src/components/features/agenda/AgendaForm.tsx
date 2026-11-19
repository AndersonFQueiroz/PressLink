"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showCreateSchema, type ShowCreateData } from "@/lib/validators/shows";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      {serverError && (
        <p className="rounded-lg border border-danger/25 bg-danger/[0.08] p-3 text-[13px] text-danger">
          {serverError}
        </p>
      )}

      <Input
        label="Nome do evento *"
        placeholder="Ex: Festival Pulsar"
        error={errors.nome_evento?.message}
        {...register("nome_evento")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data *"
          type="date"
          className="[color-scheme:dark]"
          error={errors.data?.message}
          {...register("data")}
        />
        <Input
          label="Horário"
          type="time"
          className="[color-scheme:dark]"
          error={errors.horario?.message}
          {...register("horario")}
        />
      </div>

      <Input
        label="Local"
        placeholder="Ex: Club Vibe, Palco Principal"
        error={errors.local?.message}
        {...register("local")}
      />

      <Input
        label="Cidade / UF"
        placeholder="Ex: São Paulo/SP"
        error={errors.cidade?.message}
        {...register("cidade")}
      />

      <div className="flex justify-end gap-2 pt-1">
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

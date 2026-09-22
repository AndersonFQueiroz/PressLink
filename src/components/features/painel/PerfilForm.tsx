"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { perfilSchema, type PerfilFormData } from "@/lib/validators/perfil";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PerfilFormProps = {
  defaultValues?: Partial<PerfilFormData>;
};

export function PerfilForm({ defaultValues }: PerfilFormProps) {
  const [bioTab, setBioTab] = useState<"pt" | "en">("pt");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<PerfilFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(perfilSchema) as any,
    defaultValues: {
      nome_artistico: "",
      username: "",
      biografia_pt: "",
      biografia_en: "",
      instagram: "",
      tiktok: "",
      twitter_x: "",
      facebook: "",
      ...defaultValues,
    },
  });

  const checkUsername = async () => {
    const username = getValues("username")?.toLowerCase().trim();
    if (!username || username.length < 3) {
      setUsernameStatus("invalid");
      return;
    }
    if (!/^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/.test(username)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/perfil/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.available) setUsernameStatus("available");
      else setUsernameStatus("taken");
    } catch {
      setUsernameStatus("idle");
    }
  };

  const onSubmit = async (data: PerfilFormData): Promise<void> => {
    setToast(null);
    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setToast({ type: "error", msg: json.error || "Erro ao salvar perfil" });
      return;
    }
    setToast({ type: "success", msg: "Perfil salvo com sucesso!" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome artístico" placeholder="DJ Example" error={errors.nome_artistico?.message} {...register("nome_artistico")} />
        <div>
          <Input
            label="Username"
            placeholder="dj-example"
            helperText="presslink.app/seu-username"
            error={errors.username?.message}
            {...register("username")}
            onBlur={checkUsername}
          />
          {usernameStatus === "checking" && <p className="text-xs text-white/50 mt-1">Verificando...</p>}
          {usernameStatus === "available" && <p className="text-xs text-emerald-400 mt-1">✓ Disponível</p>}
          {usernameStatus === "taken" && <p className="text-xs text-rose-400 mt-1">Username já em uso</p>}
          {usernameStatus === "invalid" && <p className="text-xs text-amber-400 mt-1">Formato inválido</p>}
        </div>
      </div>

      <div>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setBioTab("pt")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium border",
              bioTab === "pt" ? "bg-fuchsia-600 text-white border-fuchsia-500" : "bg-white/5 text-white/70 border-white/10",
            )}
          >
            PT
          </button>
          <button
            type="button"
            onClick={() => setBioTab("en")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium border",
              bioTab === "en" ? "bg-fuchsia-600 text-white border-fuchsia-500" : "bg-white/5 text-white/70 border-white/10",
            )}
          >
            EN
          </button>
        </div>

        {bioTab === "pt" ? (
          <div>
            <label htmlFor="bio_pt" className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Biografia (PT)
            </label>
            <textarea
              id="bio_pt"
              rows={4}
              placeholder="Conte sua história em português"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500"
              {...register("biografia_pt")}
            />
            {errors.biografia_pt && <p className="text-xs text-rose-400 mt-1">{errors.biografia_pt.message}</p>}
          </div>
        ) : (
          <div>
            <label htmlFor="bio_en" className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Biography (EN)
            </label>
            <textarea
              id="bio_en"
              rows={4}
              placeholder="Tell your story in English"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500"
              {...register("biografia_en")}
            />
            {errors.biografia_en && <p className="text-xs text-rose-400 mt-1">{errors.biografia_en.message}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Instagram" placeholder="https://instagram.com/..." error={errors.instagram?.message} {...register("instagram")} />
        <Input label="TikTok" placeholder="https://tiktok.com/..." error={errors.tiktok?.message} {...register("tiktok")} />
        <Input label="Twitter / X" placeholder="https://x.com/..." error={errors.twitter_x?.message} {...register("twitter_x")} />
        <Input label="Facebook" placeholder="https://facebook.com/..." error={errors.facebook?.message} {...register("facebook")} />
      </div>

      {toast && (
        <div
          role="status"
          className={cn(
            "rounded-xl border px-3.5 py-2.5 text-sm",
            toast.type === "success" ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-200" : "border-rose-500/30 bg-rose-950/30 text-rose-200",
          )}
        >
          {toast.msg}
        </div>
      )}

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto self-start">
        Salvar alterações
      </Button>
    </form>
  );
}

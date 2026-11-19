"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { perfilSchema, type PerfilFormData } from "@/lib/validators/perfil";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AvatarUpload, AVATAR_UPDATED_EVENT } from "@/components/features/painel/AvatarUpload";
import { PreviewCelular } from "@/components/features/painel/PreviewCelular";
import { cn } from "@/lib/utils";

type PerfilFormProps = {
  defaultValues?: Partial<PerfilFormData>;
  /** Host real do site (ex.: `localhost:3000`), sem protocolo. */
  origem: string;
};

export function PerfilForm({ defaultValues, origem }: PerfilFormProps) {
  const router = useRouter();
  const [bioTab, setBioTab] = useState<"pt" | "en">("pt");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [fotoUrl, setFotoUrl] = useState<string>(defaultValues?.foto_url ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    watch,
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
      foto_url: "",
      ...defaultValues,
    },
  });

  const valores = watch();
  const linkPrevia = `${origem}/${valores.username?.trim().toLowerCase() || "seu-username"}`;

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
      body: JSON.stringify({ ...data, foto_url: fotoUrl }),
    });
    const json = await res.json();
    if (!res.ok) {
      setToast({ type: "error", msg: json.error || "Erro ao salvar perfil" });
      return;
    }
    setToast({ type: "success", msg: "Perfil salvo com sucesso! Redirecionando..." });
    window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { foto_url: fotoUrl } }));
    window.setTimeout(() => router.push("/painel"), 1200);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_272px]">
        <div className="flex min-w-0 flex-col gap-8">
      {/* Identidade */}
      <section>
        <h2 className="text-[13px] font-medium text-panel-text">Identidade</h2>
        <p className="mt-0.5 text-[12px] text-panel-muted">
          É o que aparece primeiro no topo da sua página pública.
        </p>

        <div className="mt-4 flex flex-col gap-5">
          <AvatarUpload initialUrl={fotoUrl} onUploaded={setFotoUrl} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome artístico"
              placeholder="DJ Example"
              error={errors.nome_artistico?.message}
              {...register("nome_artistico")}
            />
            <div>
              <Input
                label="Username"
                placeholder="dj-example"
                helperText={linkPrevia}
                error={errors.username?.message}
                {...register("username")}
                onBlur={checkUsername}
              />
              {usernameStatus === "checking" && (
                <p className="mt-1 text-[11px] text-panel-muted">Verificando...</p>
              )}
              {usernameStatus === "available" && (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-ok">
                  <Check className="h-3 w-3" aria-hidden="true" /> Disponível
                </p>
              )}
              {usernameStatus === "taken" && (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-danger">
                  <X className="h-3 w-3" aria-hidden="true" /> Já está em uso
                </p>
              )}
              {usernameStatus === "invalid" && (
                <p className="mt-1 text-[11px] text-warn">
                  Use letras minúsculas, números e hífen
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Biografia */}
      <section className="border-t border-panel-line pt-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-medium text-panel-text">Biografia</h2>
            <p className="mt-0.5 text-[12px] text-panel-muted">
              Um texto curto sobre sua trajetória e seu som. A versão em inglês aparece para quem abre a página em outro idioma.
            </p>
          </div>

          <div
            role="group"
            aria-label="Idioma da biografia"
            className="inline-flex rounded-md border border-panel-line bg-panel-raised p-0.5"
          >
            {(["pt", "en"] as const).map((idioma) => (
              <button
                key={idioma}
                type="button"
                onClick={() => setBioTab(idioma)}
                aria-pressed={bioTab === idioma}
                className={cn(
                  "rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60",
                  bioTab === idioma
                    ? "bg-panel-raised text-panel-text"
                    : "text-panel-muted hover:text-panel-text",
                )}
              >
                {idioma.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {bioTab === "pt" ? (
          <div className="mt-4">
            <label htmlFor="bio_pt" className="text-[12px] font-medium text-panel-muted">
              Biografia (PT)
            </label>
            <textarea
              id="bio_pt"
              rows={5}
              placeholder="Conte sua história em português"
              className="mt-1.5 w-full rounded-lg border border-panel-line bg-panel-bg px-3.5 py-2.5 text-sm text-panel-text placeholder-panel-muted/70 outline-none transition-colors hover:border-panel-line-strong focus:border-signal/60 focus:ring-2 focus:ring-signal/15"
              {...register("biografia_pt")}
            />
            {errors.biografia_pt && (
              <p className="mt-1 text-xs text-danger">{errors.biografia_pt.message}</p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <label htmlFor="bio_en" className="text-[12px] font-medium text-panel-muted">
              Biography (EN)
            </label>
            <textarea
              id="bio_en"
              rows={5}
              placeholder="Tell your story in English"
              className="mt-1.5 w-full rounded-lg border border-panel-line bg-panel-bg px-3.5 py-2.5 text-sm text-panel-text placeholder-panel-muted/70 outline-none transition-colors hover:border-panel-line-strong focus:border-signal/60 focus:ring-2 focus:ring-signal/15"
              {...register("biografia_en")}
            />
            {errors.biografia_en && (
              <p className="mt-1 text-xs text-danger">{errors.biografia_en.message}</p>
            )}
          </div>
        )}
      </section>

      {/* Redes */}
      <section className="border-t border-panel-line pt-7">
        <h2 className="text-[13px] font-medium text-panel-text">Redes sociais</h2>
        <p className="mt-0.5 text-[12px] text-panel-muted">
          Links completos. Os ícones aparecem no rodapé da sua página.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Instagram" placeholder="https://instagram.com/..." error={errors.instagram?.message} {...register("instagram")} />
          <Input label="TikTok" placeholder="https://tiktok.com/..." error={errors.tiktok?.message} {...register("tiktok")} />
          <Input label="Twitter / X" placeholder="https://x.com/..." error={errors.twitter_x?.message} {...register("twitter_x")} />
          <Input label="Facebook" placeholder="https://facebook.com/..." error={errors.facebook?.message} {...register("facebook")} />
        </div>
      </section>

      {toast && (
        <div
          role="status"
          className={cn(
            "rounded-lg border px-3.5 py-2.5 text-[13px]",
            toast.type === "success"
              ? "border-ok/25 bg-ok/[0.08] text-ok"
              : "border-danger/25 bg-danger/[0.08] text-danger",
          )}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-panel-line pt-5">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Salvar alterações
        </Button>
      </div>
        </div>

        <aside className="hidden lg:block lg:border-l lg:border-white/[0.06] lg:pl-7">
          <div className="sticky top-20">
            <PreviewCelular
              origem={origem}
              nome={valores.nome_artistico}
              username={valores.username}
              fotoUrl={fotoUrl}
              bio={valores.biografia_pt}
              redes={{
                instagram: valores.instagram,
                tiktok: valores.tiktok,
                twitter_x: valores.twitter_x,
                facebook: valores.facebook,
              }}
            />
          </div>
        </aside>
      </div>
    </form>
  );
}

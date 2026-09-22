"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_ACCEPT_ATTR, validateAvatarFile } from "@/lib/validators/avatar";

export const AVATAR_UPDATED_EVENT = "presslink:avatar-updated";

type AvatarUploadProps = {
  initialUrl?: string;
  onUploaded?: (fotoUrl: string) => void;
};

const MAX_DIMENSION = 1024;

async function optimizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1 && file.type === "image/webp") {
      bitmap.close();
      return file;
    }
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export function AvatarUpload({ initialUrl, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const persistFotoUrl = useCallback(async (fotoUrl: string) => {
    const res = await fetch("/api/perfil/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foto_url: fotoUrl }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.error || "Erro ao salvar foto no perfil");
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validateAvatarFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setUploading(true);
      try {
        const optimized = await optimizeImage(file);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão expirada. Faça login novamente.");
        const path = `${user.id}/avatar-${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, optimized, {
          contentType: "image/webp",
          upsert: false,
        });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        const publicUrl = data.publicUrl;
        await persistFotoUrl(publicUrl);
        setPreview(publicUrl);
        onUploaded?.(publicUrl);
        window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { foto_url: publicUrl } }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, persistFotoUrl],
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onUploaded?.("");
    window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { foto_url: "" } }));
  }, [onUploaded]);

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Enviar foto de perfil"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex items-center gap-4 rounded-2xl border border-dashed p-4 transition-colors cursor-pointer",
          "bg-white/[0.04] hover:bg-white/[0.06]",
          dragOver ? "border-fuchsia-500 bg-fuchsia-600/10" : "border-white/15",
        )}
      >
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fuchsia-600/20 text-fuchsia-200">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Foto de perfil</p>
          <p className="text-xs text-white/50">Clique ou arraste JPG, PNG ou WebP até 5MB</p>
          {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        </div>
        {preview && !uploading && (
          <button
            type="button"
            aria-label="Remover foto"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT_ATTR}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

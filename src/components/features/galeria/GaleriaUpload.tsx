"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_FILES, MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/validators/galeria";

type Props = {
  onUploaded: (fotos: unknown[]) => void;
};

export function GaleriaUpload({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    if (files.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} arquivos por vez`);
      return;
    }
    for (const f of Array.from(files)) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`${f.name} excede 5MB`);
        return;
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`${f.name}: tipo não permitido`);
        return;
      }
    }

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));

      // Simula progresso (fetch não expõe upload progress sem XHR)
      const timer = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 200);

      const res = await fetch("/api/galeria", { method: "POST", body: fd });
      clearInterval(timer);
      setProgress(100);

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");

      onUploaded(json.fotos);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  return (
    <div className="border-y border-panel-line py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-panel-text">Upload de fotos</p>
          <p className="text-[12px] text-panel-muted">JPEG, PNG ou WebP — até 5MB cada — máx {MAX_FILES} por vez</p>
        </div>
        <Button variant="secondary" size="md" isLoading={uploading} onClick={() => inputRef.current?.click()} leftIcon={!uploading ? <Upload className="h-4 w-4" /> : undefined}>
          {uploading ? "Enviando..." : "Selecionar fotos"}
        </Button>
      </div>

      <input ref={inputRef} type="file" accept={ALLOWED_TYPES.join(",")} multiple hidden onChange={(e) => handleFiles(e.target.files)} />

      {uploading && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full bg-signal transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </div>
  );
}

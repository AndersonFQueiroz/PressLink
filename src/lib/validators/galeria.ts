import { z } from "zod";

// Limites RNF-06 otimização + RF-10 múltiplo
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export const galeriaFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_FILE_SIZE, {
    message: "Arquivo deve ter no máximo 5MB",
  })
  .refine((f) => ALLOWED_TYPES.includes(f.type), {
    message: "Apenas JPEG, PNG e WebP são permitidos",
  });

export const galeriaUploadSchema = z.object({
  files: z.array(galeriaFileSchema).min(1, "Selecione ao menos 1 imagem").max(MAX_FILES, `Máximo ${MAX_FILES} arquivos por vez`),
});

export const galeriaDeleteSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const galeriaReordenarSchema = z.object({
  ids: z.array(z.string().uuid("ID inválido")).min(1, "Lista vazia").max(100, "Máximo 100 fotos"),
});

export type GaleriaUploadData = z.infer<typeof galeriaUploadSchema>;
export type GaleriaDeleteData = z.infer<typeof galeriaDeleteSchema>;
export type GaleriaReordenarData = z.infer<typeof galeriaReordenarSchema>;

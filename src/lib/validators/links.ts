import { z } from "zod";
import { detectTipoMidia } from "@/lib/embed";

// Reexporta os utilitários puros para quem já importava daqui.
// (Client components devem importar de "@/lib/embed" para não puxar zod.)
export {
  detectTipoMidia,
  getEmbedUrl,
  SPOTIFY_REGEX,
  YOUTUBE_REGEX,
  SOUNDCLOUD_REGEX,
} from "@/lib/embed";
export type { TipoMidia, LinkDeMidia } from "@/lib/embed";

export const linkMidiaSchema = z.object({
  url: z
    .string()
    .min(1, "A URL é obrigatória")
    .url("Formato de URL inválido")
    .refine((val) => detectTipoMidia(val) !== null, {
      message: "A URL deve ser do Spotify, SoundCloud ou YouTube",
    }),
  titulo: z
    .string()
    .max(100, "O título deve ter no máximo 100 caracteres")
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  tipo: z.enum(["spotify", "soundcloud", "youtube"]).optional(),
  ordem: z.number().int().min(0).optional(),
});

export const linkMidiaUpdateSchema = z.object({
  titulo: z
    .string()
    .max(100, "O título deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  url: z
    .string()
    .url("Formato de URL inválido")
    .refine((val) => detectTipoMidia(val) !== null, {
      message: "A URL deve ser do Spotify, SoundCloud ou YouTube",
    })
    .optional(),
  ordem: z.number().int().min(0).optional(),
});

export const reordenarLinksSchema = z.object({
  ids: z
    .array(z.string().uuid("ID inválido"))
    .min(1, "Envie pelo menos um ID para reordenar"),
});

export type LinkMidiaInput = z.infer<typeof linkMidiaSchema>;
export type LinkMidiaUpdateInput = z.infer<typeof linkMidiaUpdateSchema>;
export type ReordenarLinksInput = z.infer<typeof reordenarLinksSchema>;

import { z } from "zod";

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

export const AVATAR_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AvatarAcceptedType = (typeof AVATAR_ACCEPTED_TYPES)[number];

export const AVATAR_ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp";

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type as AvatarAcceptedType)) {
    return "Formato inválido. Use JPG, PNG ou WebP.";
  }
  if (file.size > AVATAR_MAX_SIZE) {
    return "Arquivo muito grande. Limite de 5MB.";
  }
  return null;
}

export const avatarUrlSchema = z.object({
  foto_url: z.string().min(1, "foto_url é obrigatória").max(1000, "URL muito longa").url("URL inválida"),
});

export type AvatarUrlData = z.infer<typeof avatarUrlSchema>;

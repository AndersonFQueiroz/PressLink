import { z } from "zod";

export const emailStrictRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isValidWhatsApp(val: string): boolean {
  const digits = val.replace(/\D/g, "");
  if (!digits) return true;

  if (val.trim().startsWith("+")) {
    // E.164 formato internacional: 8 a 15 dígitos
    return digits.length >= 8 && digits.length <= 15;
  }

  // Formato nacional brasileiro:
  // 10 dígitos (DDD + 8 dígitos) ou 11 dígitos (DDD + 9 dígitos)
  // ou com DDI 55 (12 ou 13 dígitos)
  return (digits.length >= 10 && digits.length <= 11) || (digits.length >= 12 && digits.length <= 13);
}

export function getCleanWhatsAppDigits(val: string): string {
  const trimmed = val.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  if (trimmed.startsWith("+")) {
    return digits;
  }

  // Se são 10 ou 11 dígitos (nacional brasileiro sem +55), adiciona 55 para o wa.me
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

export function formatWhatsApp(val: string): string {
  const trimmed = val.trim();
  const isInternational = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return isInternational ? "+" : "";

  if (isInternational) {
    // Se o usuário colocou +55, aplica máscara brasileira com +55
    if (digits.startsWith("55") && digits.length <= 13) {
      const rest = digits.slice(2);
      if (rest.length === 0) return "+55 ";
      if (rest.length <= 2) return `+55 (${rest}`;
      if (rest.length <= 6) return `+55 (${rest.slice(0, 2)}) ${rest.slice(2)}`;
      if (rest.length <= 10) return `+55 (${rest.slice(0, 2)}) ${rest.slice(2, 6)}-${rest.slice(6)}`;
      return `+55 (${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7, 11)}`;
    }
    // Internacional genérico: grupos de dígitos
    return `+${digits.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, "$1 ")}`;
  }

  // Nacional brasileiro
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export const contatoSchema = z.object({
  whatsapp: z
    .string()
    .max(30, "Número muito longo")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.trim() : ""))
    .refine((v) => !v || isValidWhatsApp(v), {
      message: "Número de WhatsApp inválido (use formato nacional DDD+número ou internacional com +DDI)",
    }),
  email_booking: z
    .string()
    .max(255, "E-mail muito longo")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.trim().toLowerCase() : ""))
    .refine((v) => !v || emailStrictRegex.test(v), {
      message: "E-mail de booking inválido (ex: contato@djexemplo.com)",
    }),
});

export type ContatoFormData = z.infer<typeof contatoSchema>;

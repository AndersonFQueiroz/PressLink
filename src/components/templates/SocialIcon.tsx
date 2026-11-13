import React from "react";

export type SocialKey =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "x"
  | "whatsapp"
  | "email"
  | "spotify"
  | "soundcloud"
  | "youtube";

interface SocialIconProps {
  name: SocialKey;
  className?: string;
}

/**
 * Ícones de marca em linha, desenhados no mesmo grid 24×24.
 * O lucide não distribui mais ícones de marcas, então ficam aqui.
 */
export function SocialIcon({ name, className }: SocialIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.4 6.6h.01" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 4v10.5a4.5 4.5 0 1 1-4-4.47" />
          <path d="M14 4a5 5 0 0 0 5 5" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6v4h3v8h4v-8h3l1-4h-4V6.6c0-.4.3-.6.7-.6H17V3z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="m4 4 7.2 8.4L4.4 20H7l5.3-5.9L17 20h3l-7.5-8.8L19.4 4h-2.6l-4.9 5.5L8.1 4H4z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M20.5 11.8a8.4 8.4 0 0 1-12.4 7.4L4 20.5l1.4-4a8.4 8.4 0 1 1 15.1-4.7Z" />
          <path d="M8.7 9.2c.4-.1.8.1 1 .5l.6 1.2c.1.3.1.6-.1.8l-.5.5c.6 1 1.4 1.7 2.4 2.2l.5-.5c.2-.2.5-.2.8-.1l1.2.6c.4.2.6.6.5 1-.2.8-.9 1.4-1.7 1.4-2.9 0-6-3-6-6 0-.8.6-1.5 1.3-1.6Z" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case "spotify":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7.5 9.3c3.2-.9 6.4-.5 9.1 1.1" />
          <path d="M8.2 12.4c2.6-.7 5.1-.4 7.3.9" />
          <path d="M9 15.3c2-.5 3.9-.2 5.6.7" />
        </svg>
      );
    case "soundcloud":
      return (
        <svg {...common}>
          <path d="M4 15v-2.2M6.5 16V10.5M9 16V8.8M11.5 16V6.5" />
          <path d="M14 16V9.2a4.8 4.8 0 0 1 6 4.7V16" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
        </svg>
      );
    default:
      return null;
  }
}

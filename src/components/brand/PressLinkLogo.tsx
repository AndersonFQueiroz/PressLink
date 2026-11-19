import { cn } from "@/lib/utils";

/**
 * Assinatura da marca PressLink.
 *
 * A corrente (dois elos) usa o gradiente branco → magenta da identidade e se
 * "abre" no hover; o wordmark repete a fonte do logo (Poppins Bold).
 * SVG inline: nítido em qualquer tamanho, sem request extra e com animação
 * em CSS puro (desligada em `prefers-reduced-motion`).
 */
export function PressLinkLogo({
  size = 22,
  withMark = true,
  className,
}: {
  /** Altura do wordmark em px (o ícone acompanha). */
  size?: number;
  withMark?: boolean;
  className?: string;
}) {
  const mark = Math.round(size * 1.55);

  return (
    <span
      className={cn("group/brand inline-flex select-none items-center", className)}
      style={{ gap: Math.round(size * 0.38) }}
    >
      {withMark && <ChainMark size={mark} />}
      <span
        className="font-brand font-bold leading-none tracking-[-0.035em] text-panel-text"
        style={{ fontSize: size }}
      >
        Press<span className="text-signal">Link</span>
      </span>
    </span>
  );
}

export function ChainMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("pl-chain shrink-0 overflow-visible", className)}
    >
      <defs>
        <linearGradient
          id="pl-chain-gradient"
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#f6c6ff" />
          <stop offset="0.75" stopColor="#ea1bff" />
          <stop offset="1" stopColor="#d018f6" />
        </linearGradient>
      </defs>
      <g
        transform="rotate(-45 16 16)"
        fill="none"
        stroke="url(#pl-chain-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <g className="pl-chain-back">
          <rect x="1.2" y="9.8" width="19" height="12.4" rx="6.2" pathLength={1} />
        </g>
        <g className="pl-chain-front">
          <rect x="12.2" y="9.8" width="19" height="12.4" rx="6.2" pathLength={1} />
        </g>
      </g>
    </svg>
  );
}

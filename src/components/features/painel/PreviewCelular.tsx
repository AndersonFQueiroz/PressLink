import { Mail, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Prévia do topo da página pública, em escala de celular.
 *
 * É ilustrativa: usa os valores do formulário ao lado e não é clicável
 * (`pointer-events-none`), para ninguém achar que está na página real.
 */
export function PreviewCelular({
  nome,
  username,
  fotoUrl,
  bio,
  redes,
  whatsapp,
  email,
  className,
}: {
  nome?: string;
  username?: string;
  fotoUrl?: string;
  bio?: string;
  redes?: {
    instagram?: string;
    tiktok?: string;
    twitter_x?: string;
    facebook?: string;
  };
  whatsapp?: string;
  email?: string;
  className?: string;
}) {
  const nomeExibido = nome?.trim() || "Seu nome artístico";
  const handle = username?.trim() ? `@${username.trim()}` : "@seu-username";
  const bioExibida =
    bio?.trim() ||
    "Uma linha sobre seu som, sua cidade e o que você toca. É o primeiro texto que o contratante lê.";
  const iniciais = nomeExibido.slice(0, 2).toUpperCase();

  // Monogramas em vez de ícones de marca: o conjunto do lucide não traz mais
  // os logos e, neste tamanho, a sigla lê melhor que um desenho genérico.
  const redesAtivas = [
    { chave: "instagram", valor: redes?.instagram, sigla: "IG", label: "Instagram" },
    { chave: "tiktok", valor: redes?.tiktok, sigla: "TT", label: "TikTok" },
    { chave: "twitter", valor: redes?.twitter_x, sigla: "X", label: "X" },
    { chave: "facebook", valor: redes?.facebook, sigla: "FB", label: "Facebook" },
  ].filter((rede) => Boolean(rede.valor?.trim()));

  return (
    <div className={cn("mx-auto w-full max-w-[288px]", className)}>
      <div className="mb-2 flex items-center justify-between px-0.5">
        <span className="text-[10px] font-medium text-panel-muted">Prévia da página</span>
        <span className="inline-flex items-center gap-1 text-[10px] text-panel-muted/80">
          <span className="h-1 w-1 rounded-full bg-acid" aria-hidden="true" />
          ao vivo
        </span>
      </div>

      <div
        aria-label="Prévia ilustrativa da página pública"
        className="pointer-events-none select-none rounded-[26px] border border-white/10 bg-[#06040a] p-1.5 shadow-[0_30px_70px_-40px_rgba(208,24,246,0.55)]"
      >
        <div className="overflow-hidden rounded-[21px] border border-white/[0.06] bg-[#08050c]">
          {/* Capa */}
          <div className="relative h-28 overflow-hidden">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(208,24,246,0.35),transparent_60%),radial-gradient(90%_90%_at_90%_100%,rgba(216,255,74,0.12),transparent_55%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08050c] via-[#08050c]/20 to-transparent" />
            <span className="absolute left-3 top-3 rounded-sm border border-white/15 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/60">
              EPK
            </span>
          </div>

          <div className="px-3.5 pb-4">
            <div className="-mt-7 relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#08050c] bg-[#171220] text-[12px] font-semibold text-white/70">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                iniciais
              )}
            </div>

            <p className="mt-2 truncate font-display text-[16px] font-bold leading-tight tracking-[-0.02em] text-white">
              {nomeExibido}
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-white/40">{handle}</p>

            <p className="mt-2.5 line-clamp-3 text-[10px] leading-relaxed text-white/55">
              {bioExibida}
            </p>

            {redesAtivas.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5">
                {redesAtivas.map((rede) => (
                  <span
                    key={rede.chave}
                    aria-label={rede.label}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 font-mono text-[7px] leading-none tracking-tight text-white/60"
                  >
                    {rede.sigla}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3.5 space-y-1.5">
              <span
                className={cn(
                  "flex h-7 items-center justify-center gap-1.5 rounded text-[9px] font-semibold",
                  whatsapp?.trim()
                    ? "bg-signal text-ink"
                    : "border border-dashed border-white/15 text-white/35",
                )}
              >
                <MessageCircle className="h-3 w-3" aria-hidden="true" />
                {whatsapp?.trim() || "WhatsApp"}
              </span>
              <span
                className={cn(
                  "flex h-7 items-center justify-center gap-1.5 rounded border text-[9px] font-medium",
                  email?.trim()
                    ? "border-white/20 text-white/80"
                    : "border-dashed border-white/15 text-white/35",
                )}
              >
                <Mail className="h-3 w-3" aria-hidden="true" />
                {email?.trim() || "E-mail de booking"}
              </span>
            </div>

            <p className="mt-3 truncate border-t border-white/[0.07] pt-2 text-center font-mono text-[8px] text-white/30">
              presslink.app/{username?.trim() || "seu-username"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-2 px-0.5 text-[10px] leading-relaxed text-panel-muted/80">
        Ilustração do topo da página. O tema escolhido muda o visual final.
      </p>
    </div>
  );
}

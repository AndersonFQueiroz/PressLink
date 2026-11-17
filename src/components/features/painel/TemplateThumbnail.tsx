"use client";

import type { TemplateDef } from "@/lib/templates";

/**
 * Miniatura em CSS puro de cada template (issue #21, RF-21).
 *
 * Sem imagens externas: blocos estilizados representam a página real
 * (topbar, hero, bio, fotos, música, agenda e botão de contato) usando os
 * tokens CSS variables do próprio template (classe pl-tpl--* do globals.css),
 * o que garante fidelidade de cores sem assets.
 */
export function TemplateThumbnail({ template }: { template: TemplateDef }) {
  const { scheme, classeRaiz } = template;
  // Overlay suave: branco sobre fundo escuro, preto sobre fundo claro.
  const overlay = scheme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
  const overlayStrong = scheme === "dark" ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.28)";
  const isEditorial = template.id === "clean-editorial";
  const isFestival = template.id === "vibrant-festival";

  return (
    <div
      className={classeRaiz}
      aria-hidden="true"
      style={{
        position: "relative",
        aspectRatio: "16 / 10",
        overflow: "hidden",
        borderRadius: "0.75rem",
        background: "var(--pl-tpl-bg)",
        border: "1px solid rgba(128,128,128,0.25)",
        display: "flex",
        flexDirection: "column",
        padding: "0.7rem 0.8rem",
      }}
    >
      {/* Brilhos decorativos do template de festival */}
      {isFestival && (
        <>
          <span
            style={{
              position: "absolute",
              top: "-18%",
              right: "-10%",
              width: "55%",
              height: "70%",
              borderRadius: "9999px",
              background: "radial-gradient(circle, var(--pl-tpl-accent-2), transparent 65%)",
              opacity: 0.35,
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: "-25%",
              left: "-12%",
              width: "55%",
              height: "70%",
              borderRadius: "9999px",
              background: "radial-gradient(circle, var(--pl-tpl-accent), transparent 65%)",
              opacity: 0.25,
            }}
          />
        </>
      )}

      {/* Topbar fake */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem", position: "relative" }}>
        <span style={{ height: 6, width: "22%", borderRadius: 3, background: "var(--pl-tpl-accent)" }} />
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ height: 5, width: 14, borderRadius: 3, background: overlay }} />
          <span style={{ height: 5, width: 14, borderRadius: 3, background: overlay }} />
          <span style={{ height: 5, width: 14, borderRadius: 3, background: overlay }} />
        </div>
      </div>

      {/* Hero: avatar + nome artístico + subtítulo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", position: "relative" }}>
        <span
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: isFestival
              ? "conic-gradient(var(--pl-tpl-accent), var(--pl-tpl-accent-2), var(--pl-tpl-accent))"
              : overlay,
            border: "1px solid var(--pl-tpl-surface)",
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              height: 9,
              width: isEditorial ? "64%" : "78%",
              borderRadius: isEditorial ? 2 : 4,
              background: "var(--pl-tpl-fg)",
              // O editorial simula a tipografia serifada do template real
              fontFamily: isEditorial ? "Georgia, serif" : undefined,
            }}
          />
          <span style={{ height: 5, width: "45%", borderRadius: 3, background: overlayStrong }} />
        </div>
      </div>

      {/* Bio fake */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "0.5rem", position: "relative" }}>
        <span style={{ height: 4, width: "92%", borderRadius: 2, background: overlay }} />
        <span style={{ height: 4, width: "84%", borderRadius: 2, background: overlay }} />
        <span style={{ height: 4, width: isEditorial ? "58%" : "66%", borderRadius: 2, background: overlay }} />
      </div>

      {/* Grade de fotos fake */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: "0.55rem", position: "relative" }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: isEditorial ? 2 : 6,
              background: isFestival
                ? i % 2
                  ? "linear-gradient(135deg, var(--pl-tpl-accent-2), var(--pl-tpl-surface))"
                  : "linear-gradient(135deg, var(--pl-tpl-accent), var(--pl-tpl-surface))"
                : overlay,
              border: "1px solid var(--pl-tpl-surface)",
            }}
          />
        ))}
      </div>

      {/* Faixas de música (esq.) e agenda (dir.) */}
      <div style={{ display: "flex", gap: 4, marginTop: "0.5rem", flex: 1, position: "relative" }}>
        <div style={{ flex: "1.2", display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ height: 5, width: "70%", borderRadius: 3, background: "var(--pl-tpl-accent)" }} />
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ height: 4, width: "${88 - i * 12}%", borderRadius: 2, background: overlay }} />
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ height: 5, width: "55%", borderRadius: 3, background: "var(--pl-tpl-fg)", opacity: 0.8 }} />
          {[0, 1].map((i) => (
            <span key={i} style={{ height: 4, width: "${90 - i * 18}%", borderRadius: 2, background: overlay }} />
          ))}
        </div>
      </div>

      {/* Botão de contato fake */}
      <span
        style={{
          position: "absolute",
          right: "0.8rem",
          bottom: "0.7rem",
          height: 12,
          width: "30%",
          borderRadius: 6,
          background: "var(--pl-tpl-accent)",
        }}
      />
    </div>
  );
}

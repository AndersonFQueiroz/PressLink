// src/emails/VerificationEmail.tsx — template verificação, branding ink/fuchsia, LGPD footer
// RF: Resend verificação (Alternativa A Hook) — email transacional de confirmação de cadastro
// Por que existe: React Email gera HTML compatível com clients (Outlook/Gmail); inline styles evitam css externo bloqueado
// Reuso: cores ink (#0a0a0f) + fuchsia-400/600 já usadas em src/app/cadastro/page.tsx:12 — consistência visual
// Pirâmide: meio — render puro, testável via snapshot/preview sem I/O

import { Html, Head, Body, Container, Section, Text, Button, Link, Hr } from "@react-email/components"; // componentes email-safe (table-based)

// Props do template — nome/url obrigatórios, expiresIn opcional (default 1h = OTP expiry Supabase 3600s)
type Props = { nome: string; url: string; expiresIn?: string };

// Componente funcional — sem estado, puro, renderiza HTML estático para Resend
export function VerificationEmail({ nome, url, expiresIn = "1 hora" }: Props) {
  return (
    <Html lang="pt-BR">
      <Head />
      {/* Body com bg ink — fallback #0a0a0f se cliente não suporta bg */}
      <Body style={{ backgroundColor: "#0a0a0f", margin: 0, padding: 0, fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
          {/* Card glass — borda sutil + blur, replica UI do painel */}
          <Section
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 32,
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Logo PressLink — span fuchsia destaca Link */}
            <Text style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              Press<span style={{ color: "#e879f9" }}>Link</span>
            </Text>
            {/* Saudação personalizada — usa nome do user_metadata ou prefixo do email */}
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: "16px 0 8px" }}>
              Confirme seu email, {nome}!
            </Text>
            {/* Instrução + expiração — LGPD: informa prazo, evita link eterno */}
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: "20px", margin: "0 0 20px" }}>
              Clique no botão abaixo para verificar seu email e liberar o acesso ao painel. Link expira em {expiresIn}.
            </Text>
            {/* CTA — botão fuchsia-600, radius full, fallback text se cliente bloqueia button */}
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <Button
                href={url}
                style={{
                  backgroundColor: "#c026d3",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 9999,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Confirmar email
              </Button>
            </Section>
            {/* Fallback plain link — se botão não renderiza, copia e cola URL */}
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>
              Se o botão não funcionar, copie e cole:
            </Text>
            <Link href={url} style={{ fontSize: 12, color: "#e879f9", wordBreak: "break-all" }}>
              {url}
            </Link>
            <Hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" }} />
            {/* Footer LGPD — informa motivo do email, links privacidade/termos, opt-out implícito (ignore) */}
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: "16px", margin: 0 }}>
              Você recebeu porque criou conta em presslink.app. Se não foi você, ignore. Dúvidas?{" "}
              <Link href="https://presslink.app/privacidade" style={{ color: "#e879f9" }}>
                Política de Privacidade
              </Link>{" "}
              ·{" "}
              <Link href="https://presslink.app/termos" style={{ color: "#e879f9" }}>
                Termos
              </Link>
            </Text>
          </Section>
          {/* Assinatura curta — branding + LGPD compliant */}
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 16 }}>
            PressLink — EPK para DJs · LGPD compliant
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationEmail; // export default para compat com resend react prop e preview

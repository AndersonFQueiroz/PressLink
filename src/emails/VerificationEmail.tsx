// src/emails/VerificationEmail.tsx — template de verificação, brand ink/violeta, footer LGPD
// RF: Resend verificação (Alternativa A Hook) — email transacional de confirmação de cadastro
// Por que existe: React Email gera HTML compatível com clients (Outlook/Gmail); inline styles evitam css externo bloqueado
// Reuso: mesmas cores do painel (#0a0812 ink, #121019 card, #7c3aed brand) — consistência visual
// Pirâmide: meio — render puro, testável via snapshot/preview sem I/O

import { Html, Head, Body, Container, Section, Text, Button, Link, Hr } from "@react-email/components"; // componentes email-safe (table-based)

// Props do template — nome/url obrigatórios, expiresIn opcional (default 1h = OTP expiry Supabase 3600s)
type Props = { nome: string; url: string; expiresIn?: string };

// Componente funcional — sem estado, puro, renderiza HTML estático para Resend
export function VerificationEmail({ nome, url, expiresIn = "1 hora" }: Props) {
  return (
    <Html lang="pt-BR">
      <Head />
      {/* Body com bg ink — fallback #0a0812 se cliente não suporta bg */}
      <Body style={{ backgroundColor: "#0a0812", margin: 0, padding: 0, fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
          {/* Card sólido — borda fina, mesmo raio do painel, sem blur */}
          <Section
            style={{
              backgroundColor: "#121019",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 32,
            }}
          >
            {/* Logo PressLink — "link" no acento violeta */}
            <Text style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "#fff", letterSpacing: "-0.01em" }}>
              press<span style={{ color: "#c4b5fd" }}>link</span>
            </Text>
            {/* Saudação personalizada — usa nome do user_metadata ou prefixo do email */}
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: "16px 0 8px", letterSpacing: "-0.01em" }}>
              Confirme seu email, {nome}
            </Text>
            {/* Instrução + expiração — LGPD: informa prazo, evita link eterno */}
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: "21px", margin: "0 0 20px" }}>
              Clique no botão abaixo para verificar seu email e liberar o acesso ao painel. O link expira em {expiresIn}.
            </Text>
            {/* CTA — botão violeta com texto branco, fallback text se cliente bloqueia button */}
            <Section style={{ margin: "24px 0" }}>
              <Button
                href={url}
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: 8,
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
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>
              Se o botão não funcionar, copie e cole:
            </Text>
            <Link href={url} style={{ fontSize: 12, color: "#c4b5fd", wordBreak: "break-all" }}>
              {url}
            </Link>
            <Hr style={{ borderColor: "rgba(255,255,255,0.08)", margin: "24px 0" }} />
            {/* Footer LGPD — informa motivo do email, links privacidade/termos, opt-out implícito (ignore) */}
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: "16px", margin: 0 }}>
              Você recebeu porque criou conta em presslink.app. Se não foi você, ignore. Dúvidas?{" "}
              <Link href="https://presslink.app/privacidade" style={{ color: "#c4b5fd" }}>
                Política de Privacidade
              </Link>{" "}
              ·{" "}
              <Link href="https://presslink.app/termos" style={{ color: "#c4b5fd" }}>
                Termos
              </Link>
            </Text>
          </Section>
          {/* Assinatura curta — branding + LGPD compliant */}
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 16 }}>
            PressLink — EPK para DJs · LGPD compliant
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationEmail; // export default para compat com resend react prop e preview

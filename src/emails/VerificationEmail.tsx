// src/emails/VerificationEmail.tsx — template de verificação, identidade PressLink
// RF: Resend verificação (Alternativa A Hook) — email transacional de confirmação de cadastro
// Por que existe: React Email gera HTML compatível com clients (Outlook/Gmail); inline styles evitam css externo bloqueado
// Reuso: mesmas cores do painel (#08050C ink, #17121C card, #D018F6 signal) — consistência visual
// Pirâmide: meio — render puro, testável via snapshot/preview sem I/O

import { Html, Head, Body, Container, Section, Text, Button, Link, Hr } from "@react-email/components"; // componentes email-safe (table-based)

// Props do template — nome/url obrigatórios, expiresIn opcional (default 1h = OTP expiry Supabase 3600s)
type Props = { nome: string; url: string; expiresIn?: string };

// Componente funcional — sem estado, puro, renderiza HTML estático para Resend
export function VerificationEmail({ nome, url, expiresIn = "1 hora" }: Props) {
  return (
    <Html lang="pt-BR">
      <Head />
      {/* Body com bg ink — fallback #08050C se cliente não suporta bg */}
      <Body style={{ backgroundColor: "#08050C", margin: 0, padding: 0, fontFamily: "'Space Grotesk', Inter, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
          {/* Card sólido — borda fina, mesmo raio do painel, sem blur */}
          <Section
            style={{
              backgroundColor: "#17121C",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 12,
              padding: 32,
            }}
          >
            {/* Wordmark — "Press" branco + "Link" no magenta do logo */}
            <Text style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "#F6F3F8", letterSpacing: "-0.01em" }}>
              Press<span style={{ color: "#D018F6" }}>Link</span>
            </Text>
            {/* Saudação personalizada — usa nome do user_metadata ou prefixo do email */}
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#F6F3F8", margin: "16px 0 8px", letterSpacing: "-0.01em" }}>
              Confirme seu email, {nome}
            </Text>
            {/* Instrução + expiração — LGPD: informa prazo, evita link eterno */}
            <Text style={{ fontSize: 14, color: "#A79FAD", lineHeight: "21px", margin: "0 0 20px" }}>
              Clique no botão abaixo para verificar seu email e liberar o acesso ao painel. O link expira em {expiresIn}.
            </Text>
            {/* CTA — magenta com texto ink (4,9:1); branco sobre magenta reprovaria AA */}
            <Section style={{ margin: "24px 0" }}>
              <Button
                href={url}
                style={{
                  backgroundColor: "#D018F6",
                  color: "#08050C",
                  padding: "12px 24px",
                  borderRadius: 4,
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
            <Text style={{ fontSize: 12, color: "#A79FAD", margin: "0 0 8px" }}>
              Se o botão não funcionar, copie e cole:
            </Text>
            <Link href={url} style={{ fontSize: 12, color: "#F2A8FF", wordBreak: "break-all" }}>
              {url}
            </Link>
            <Hr style={{ borderColor: "rgba(255,255,255,0.09)", margin: "24px 0" }} />
            {/* Footer LGPD — informa motivo do email, links privacidade/termos, opt-out implícito (ignore) */}
            <Text style={{ fontSize: 11, color: "#A79FAD", lineHeight: "16px", margin: 0 }}>
              Você recebeu porque criou conta em presslink.app. Se não foi você, ignore. Dúvidas?{" "}
              <Link href="https://presslink.app/privacidade" style={{ color: "#F2A8FF" }}>
                Política de Privacidade
              </Link>{" "}
              ·{" "}
              <Link href="https://presslink.app/termos" style={{ color: "#F2A8FF" }}>
                Termos
              </Link>
            </Text>
          </Section>
          {/* Assinatura curta — branding + LGPD compliant */}
          <Text style={{ fontSize: 11, color: "#A79FAD", textAlign: "center", marginTop: 16 }}>
            PressLink — EPK para DJs · LGPD compliant
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationEmail; // export default para compat com resend react prop e preview

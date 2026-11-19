# 🎧 PressLink

**Plataforma SaaS para criação de portfólios digitais profissionais para DJs freelancers.**
[![CI](https://github.com/AndersonFQueiroz/PressLink/actions/workflows/ci.yml/badge.svg)](https://github.com/AndersonFQueiroz/PressLink/actions/workflows/ci.yml)

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## Sobre o Projeto

O **PressLink** é o Trabalho de Conclusão de Curso (TCC) desenvolvido por uma equipe de 3 integrantes com o objetivo de resolver um problema real do mercado de música eletrônica e eventos: **a dificuldade que DJs freelancers enfrentam para ter uma presença digital profissional**.

### O problema

Hoje, quando um DJ precisa de um portfólio digital (também chamado de *Electronic Press Kit* — EPK), ele geralmente precisa contratar um desenvolvedor ou designer para criar uma página sob medida. Esse processo é **caro, lento e não escalável**. Muitos DJs iniciantes simplesmente não têm orçamento para isso e acabam dependendo exclusivamente de redes sociais, que não oferecem a mesma credibilidade de um site profissional.

### A solução

O PressLink é uma plataforma **self-service** onde qualquer DJ pode criar seu próprio portfólio digital profissional **sem nenhum conhecimento técnico**. Basta se cadastrar, preencher as informações no painel administrativo, escolher um template visual e publicar. O sistema gera automaticamente uma página pública acessível por uma URL personalizada (ex.: `presslink.app/nomedodj`).

### Modelo de negócio

O PressLink opera com um modelo **freemium por assinatura**:
- **Plano gratuito**: funcionalidades completas do MVP com marca d'água da plataforma.
- **Planos pagos**: remoção da marca d'água, domínio próprio, acesso a templates premium e recursos avançados.

---

## Funcionalidades do MVP

### Painel do DJ (área logada)

- ✅ Cadastro, login e logout; verificação de e-mail e recuperação/redefinição de senha
- ✅ Perfil: nome artístico, foto, biografia em PT/EN, redes sociais e `@username` único
- ✅ Galeria: até 10 fotos de 5 MB, reordenação por arrastar e exclusão
- ✅ Mídia: Spotify, SoundCloud e YouTube com player embutido, ordem, edição e exclusão
- ✅ Agenda: shows com data, horário, local e cidade (datas passadas somem da página)
- ✅ Contato e booking: WhatsApp (link `wa.me`), e-mail e redes sociais
- ✅ Aparência: 3 templates (Dark Minimal, Vibrant Festival, Clean Editorial) com prévia real antes de aplicar
- ✅ Publicação: checagem de pendências, publicar/despublicar e status ao vivo no painel
- ✅ Estatísticas: visualizações e cliques de contato em janelas de 7 e 30 dias, canais e gráfico diário
- ✅ Exclusão definitiva da conta e dos dados associados (LGPD)

### Página pública gerada automaticamente

- ✅ Layout responsivo a partir de 320 px, com metadados, Open Graph e card de compartilhamento
- ✅ URL personalizada no formato `https://<domínio>/nomedodj`
- ✅ Renderização estática com ISR (revalida a cada 5 min e na hora ao salvar no painel)
- ✅ Telemetria anônima de visualizações e cliques (IP em hash SHA-256, sem cookies de rastreio)
- ✅ Acessibilidade: foco visível, contraste AA e `prefers-reduced-motion` respeitado

---

## Tecnologias Utilizadas

| Camada               | Tecnologia                                        |
| -------------------- | ------------------------------------------------- |
| Front-end            | React 19 + Next.js 15 (App Router)                |
| Estilização          | Tailwind CSS                                      |
| Formulários          | React Hook Form + Zod                             |
| Back-end / API       | Next.js Route Handlers                            |
| Banco de dados       | PostgreSQL via Supabase (RLS em todas as tabelas) |
| Armazenamento        | Supabase Storage                                  |
| Autenticação         | Supabase Auth                                     |
| E-mail transacional  | Resend + hook do Supabase (fallback SMTP)         |
| Arrastar e soltar    | @dnd-kit                                          |
| Gráficos             | SVG próprio (área, barras e sparkline)            |
| Hospedagem           | Vercel (ISR + CDN)                                |
| Testes               | Vitest (unit/API) + Playwright (E2E)              |
| CI                   | GitHub Actions                                    |

---

## Como Rodar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Conta no [Supabase](https://supabase.com/) (para as variáveis de ambiente)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/AndersonFQueiroz/PressLink
cd PressLink

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
```

Preencha o arquivo `.env.local` com as credenciais do seu projeto Supabase:

```env
# Supabase — valores públicos (a service role não é usada pelo app)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Aplicação — URL canônica (OG, sitemap e links de exemplo)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (opcional) — verificação de e-mail via hook do Supabase
RESEND_API_KEY=re_xxx
RESEND_FROM="PressLink <onboarding@resend.dev>"
SUPABASE_HOOK_SECRET=seu-hook-secret-aleatorio
```

> Em produção, aponte `NEXT_PUBLIC_APP_URL` para o domínio real e verifique o
> domínio no Resend (o remetente `onboarding@resend.dev` só entrega para o dono
> da conta). Sem `RESEND_*`, o Supabase usa o SMTP padrão dele.

```bash
# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Testes & SUT

Pirâmide: `unit` (validators, componentes e contratos de arquivo) → `api`
(Route Handlers com Supabase mockado) → `e2e` (Playwright com `webServer`).

- SUT: `next dev` em `localhost:3000` (config em `playwright.config.ts` e `config/test.ts`).
- Offline: `npm run test:unit && npm run test:api` não exige Supabase real
  (mocks em `src/lib/test-utils/supabase-mock.ts`).
- E2E completo: defina `PLAYWRIGHT_TEST_EMAIL`/`PLAYWRIGHT_TEST_PASSWORD`; sem
  credenciais, os testes de redirect 401 continuam rodando.

```bash
npm run test:unit      # validators, componentes e contratos
npm run test:api       # Route Handlers com Supabase mockado
npm run test:ci        # unit + api
npm run test:e2e       # Playwright (com creds roda o fluxo completo)
npm run test:verify    # typecheck + build + test:ci + lista de specs
PLAYWRIGHT_BASE_URL=https://presslink.vercel.app npm run test:e2e  # SUT contra produção
```

Veja `.env.test.example` para SUT local sem Supabase real.

---

## Documentação

| Documento          | Conteúdo                                                      |
| ------------------ | ------------------------------------------------------------- |
| `PRODUCT.md`       | problema, público, capacidades e limites do produto           |
| `requirements.md`  | requisitos funcionais (RF) e não funcionais (RNF) do MVP      |
| `DESIGN.md`        | tokens, tipografia, layout do painel, movimento e checklist   |
| `CONTRIBUTING.md`  | fluxo de branches, padrão de commits e estrutura de pastas    |
| `AGENTS.md`        | instruções para agentes de IA que trabalham no repositório    |
| `docs/lighthouse/` | relatórios de performance mobile/desktop (Lighthouse)         |

---

## Equipe

Este projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) pelos seguintes integrantes:

| Nome                        | Papel                        | GitHub                                                              |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| Anderson Ferreira Queiroz   | Desenvolvedor/DevOps Lead | [@AndersonFQueiroz](https://github.com/AndersonFQueiroz)            |
| Pedro Muginski              | Desenvolvedor                | [@Muginski](https://github.com/Muginski)                                                  |
| Luiz Carvalho               | Desenvolvedor                | [@Lexuxx](https://github.com/Lexuxx)                                                  |

**Orientador(a):** A definir

---

## Status do Projeto

🚧 **MVP em produção na Vercel**, em evolução. Todas as funções descritas acima
estão implementadas; o que ainda falta está listado em `requirements.md`.

---

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

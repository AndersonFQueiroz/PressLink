---
titulo: "PressLink — Plano de Monetização: Free + Pro (assinatura)"
tipo: plano
status: pronto-para-execucao
tags: [presslink, monetizacao, assinatura, planos, mercadopago, billing, tcc]
criado: 2026-11-26
fonte: "PRODUCT.md + requirements.md (RF-01..RF-30) + supabase/migrations/01_initial_schema.sql + docs/plans/2026-09-18-resend-verificacao.md"
conexoes: ["[[requirements]]", "[[PRODUCT]]", "[[specs]]", "[[DESIGN]]"]
resumo: "Free + Pro a R$ 29,90/mês ou R$ 249/ano; limites 3/3/3/1 vs 20/15/ilimitado/3; selo no Free; trial de 7 dias; Mercado Pago (cartão mensal + Pix anual); 24 tasks em 3 fases"
decisoes: "2 planos; preço em BRL; trial sem cartão; downgrade não apaga dados; limite no servidor; checkout hospedado"
---

# Plano — Monetização Free + Pro (PressLink) — 2026-11-26

> **Método:** `superpowers/writing-plans` — tasks de 2-5 min, caminhos exatos, verificação `lint + typecheck + test + build`.
> **Escopo:** transformar o MVP gratuito em produto vendável sem reescrever o que já funciona.
> **Pré-requisito:** a Fase 0 não depende de gateway; a Fase 1 depende das credenciais do Mercado Pago.

---

## Contexto rápido (ler antes de codar)

- Hoje **não existe** conceito de plano: `perfil`, `link_de_midia`, `foto_galeria` e `data_de_show` são iguais para todos os usuários.
- Limite atual no código: `src/lib/validators/galeria.ts` → `MAX_FILES = 10` e 5 MB por arquivo. Mídias e shows **não têm teto**.
- `requirements.md` lista "Sistema de pagamento e assinatura" em **Fora de Escopo**; este plano move para dentro (RF-31 a RF-44).
- `src/app/termos/page.tsx` afirma "a plataforma é gratuita e não há cobrança, assinatura ou comissão" — precisa ser reescrito antes de cobrar.
- RNF-06 (compressão de imagem) está **parcial**: o original sobe sem recompressão. Monetizar sem comprimir estoura o Storage do Supabase (1 GB no plano Free).
- Templates: 3 slugs fixos (`dark-minimal`, `vibrant-festival`, `clean-editorial`), coluna `perfil.template_slug`.
- Padrões que o plano segue: RLS em todas as tabelas, rotas de API com cliente de servidor + sessão, testes Vitest por rota, E2E Playwright, Conventional Commits em branch própria.

## Decisões fechadas

| # | Decisão | Valor |
|---|---|---|
| 1 | Planos | **Free** e **Pro** (sem terceiro plano) |
| 2 | Preço mensal | **R$ 29,90** |
| 3 | Preço anual | **R$ 249,00** (R$ 20,75/mês — "2 meses grátis") |
| 4 | Moeda | **BRL** — Mercado Pago não cobra USD de cliente brasileiro e o IOF encarece para o cliente |
| 5 | Trial | **7 dias de Pro, sem cartão**, criado no cadastro |
| 6 | Gateway | **Mercado Pago** — Checkout Pro (Pix no anual) + Assinaturas/preapproval (cartão no mensal) |
| 7 | Downgrade | **Nunca apaga**: excedente fica salvo e oculto na página pública |
| 8 | Enforcement | **Servidor** (403 `LIMITE_PLANO`); a UI só explica e oferece o upgrade |
| 9 | Cartão | Nunca passa pelo nosso servidor (checkout hospedado) |
| 10 | Selo | "Feito com PressLink" obrigatório no Free, removido no Pro |

### Por que R$ 29,90

- US$ 5 ≈ R$ 28,26 na cotação de 26/11/2026 — o preço fica na faixa de compra por impulso.
- Abaixo de Canva Pro (R$ 39,90) e Netflix (R$ 44,90); perto do Spotify (R$ 21,90), que o DJ já paga.
- Um show paga mais de um ano de assinatura.
- Anual a R$ 249 reduz churn e melhora o caixa (Pix tem taxa ~1% contra ~6,3% do cartão).

## Matriz de limites

| Recurso | Free | Pro | Onde é aplicado |
|---|---|---|---|
| Fotos na galeria | **3** | **20** | `POST /api/galeria` (upload) |
| Links de mídia | **3** | **15** | `POST /api/links` |
| Shows futuros | **3** | ilimitado | `POST /api/shows` |
| Templates | **1** (dark-minimal) | **3** | `PUT /api/perfil` |
| Selo "Feito com PressLink" | obrigatório | removido | página pública |
| Estatísticas | 7 dias (totais) | 30/90 dias + por canal | `/painel/estatisticas` |
| Bio PT/EN, contato, publicação | completo | completo | — |

Regras:
- O Free **publica** — o paywall nunca bloqueia o valor central.
- Limite conta **itens existentes**, não requisições: 3 fotos + tentativa de subir 2 → aceita 0 e responde 403 com `limite`, `usoAtual`, `upgradeUrl`.
- Ao voltar para o Free, os excedentes continuam no banco e a página pública renderiza apenas os N primeiros por `ordem`.

## Modelo de dados — `supabase/migrations/05_planos_assinatura.sql`

```sql
-- PressLink — planos e assinaturas (issue de monetização)
create type public.status_assinatura as enum
  ('trial', 'ativa', 'atrasada', 'cancelada', 'expirada');

create table public.plano (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('free', 'pro')),
  nome text not null,
  preco_centavos integer not null default 0 check (preco_centavos >= 0),
  periodo text not null check (periodo in ('mensal', 'anual')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.assinatura (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  plano_id uuid not null references public.plano(id),
  status public.status_assinatura not null default 'trial',
  gateway text,
  gateway_id text unique,
  trial_ate timestamptz,
  periodo_fim timestamptz,
  cancelada_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evento_gateway (
  id uuid primary key default gen_random_uuid(),
  gateway text not null,
  evento_id text not null,
  tipo text not null,
  payload jsonb not null,
  processado_em timestamptz,
  created_at timestamptz not null default now(),
  unique (gateway, evento_id)
);

-- Plano efetivo resolvido em um único lugar (trial, atraso e cancelamento incluídos)
create or replace function public.plano_efetivo(p_usuario uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select case
      when a.status = 'ativa' then 'pro'
      when a.status = 'trial' and a.trial_ate > now() then 'pro'
      when a.status = 'atrasada' and a.periodo_fim + interval '3 days' > now() then 'pro'
      when a.status = 'cancelada' and a.periodo_fim > now() then 'pro'
      else 'free'
    end
    from public.assinatura a
    where a.usuario_id = p_usuario
  ), 'free');
$$;

-- Catálogo
insert into public.plano (slug, nome, preco_centavos, periodo) values
  ('free', 'Free', 0, 'mensal'),
  ('pro',  'Pro', 2990, 'mensal'),
  ('pro',  'Pro anual', 24900, 'anual');
```

RLS:
- `plano`: `select` para `anon` e `authenticated` (catálogo público); escrita só service role.
- `assinatura`: `select` apenas da própria linha (`usuario_id = auth.uid()`); escrita só service role.
- `evento_gateway`: nenhum acesso para `anon`/`authenticated` (só service role).

## API

| Rota | Método | Função | Auth |
|---|---|---|---|
| `/api/plano` | GET | plano efetivo + limites + uso atual | sessão |
| `/api/assinatura/checkout` | POST | cria preapproval (mensal) ou preference Pix (anual) e devolve URL | sessão |
| `/api/assinatura/cancelar` | POST | cancela no gateway e marca `cancelada` (acesso até `periodo_fim`) | sessão |
| `/api/webhooks/mercadopago` | POST | valida `x-signature`, grava em `evento_gateway` e aplica transição | pública + assinatura |
| `/api/cron/assinaturas` | GET | expira vencidas, marca `atrasada`, dispara e-mail | `CRON_SECRET` |

Máquina de estados (`src/lib/planos/transicoes.ts`, função pura testável):

```
trial (7d) ──► ativa ──► atrasada (3d de tolerância) ──► expirada
                 │                                        │
                 └────── cancelada (acesso até o fim) ◄───┘
```

## Tasks

### Fase 0 — Planos sem cobrança (2-3 dias, já dá demo de TCC)

| # | Task | Arquivos | Pronto quando |
|---|---|---|---|
| 1 | Migration de planos e assinaturas | `supabase/migrations/05_planos_assinatura.sql` | `select * from plano` retorna 3 linhas; `plano_efetivo(uuid)` responde `free` |
| 2 | RLS das 3 tabelas novas | mesma migration | `select` anônimo em `assinatura` volta vazio; `evento_gateway` dá 401 |
| 3 | Constantes de limite | `src/lib/planos/limites.ts` | exporta `LIMITES.free` e `LIMITES.pro` tipados |
| 4 | Helper de plano efetivo | `src/lib/planos/plano-efetivo.ts` | `getPlano(usuarioId)` devolve `free` sem linha e `pro` com trial válido |
| 5 | Guard de limite | `src/lib/planos/assert-limite.ts` | lança `LimitePlanoError` com `recurso`, `limite`, `usoAtual` |
| 6 | `GET /api/plano` | `src/app/api/plano/route.ts` | 401 sem sessão; 200 com plano, limites e uso |
| 7 | Limite na galeria | `src/app/api/galeria/route.ts` | 4ª foto no Free → 403 `LIMITE_PLANO`; no Pro passa |
| 8 | Limite em mídias | `src/app/api/links/route.ts` | 4º link no Free → 403 |
| 9 | Limite em shows | `src/app/api/shows/route.ts` | 4º show futuro no Free → 403 |
| 10 | Limite de template | `src/app/api/perfil/route.ts` | Free só aceita `dark-minimal` |
| 11 | Corte + selo na página pública | `src/app/[username]/page.tsx` e templates | Free mostra 3 fotos/3 mídias/3 shows + selo; Pro mostra tudo sem selo |
| 12 | Página `/planos` | `src/app/planos/page.tsx` | comparativo, preços e FAQ; link no rodapé e no painel |
| 13 | `/painel/plano` | `src/app/painel/plano/page.tsx` | mostra "3 de 3 fotos", plano atual e CTA |
| 14 | Paywall inline | `src/components/features/planos/LimiteDialog.tsx` | modal com limite, uso e link para `/planos` |
| 15 | Trial no cadastro | trigger `on_auth_user_created` ou `src/app/api/cadastro` | conta nova nasce com `trial` de 7 dias |
| 16 | Testes | `tests/unit/planos/*.test.ts`, `tests/api/plano.route.test.ts`, `tests/e2e/planos.spec.ts` | cobrem os limites, o 403 e o selo |

### Fase 1 — Cobrança real (3-4 dias)

| # | Task | Arquivos | Pronto quando |
|---|---|---|---|
| 17 | Cliente do gateway | `src/lib/mercadopago/client.ts` | cria preapproval e preference com token de sandbox |
| 18 | Checkout | `src/app/api/assinatura/checkout/route.ts` | devolve `init_point` válido no sandbox |
| 19 | Webhook idempotente | `src/app/api/webhooks/mercadopago/route.ts` | evento repetido não duplica assinatura; assinatura inválida → 401 |
| 20 | Transições | `src/lib/planos/transicoes.ts` + testes | cobre ativa, atrasada, expirada e cancelada |
| 21 | E-mails | `src/emails/Assinatura*.tsx` | confirmação, falha de pagamento e expiração |
| 22 | Cron | `src/app/api/cron/assinaturas/route.ts` + `vercel.json` | roda 1×/dia e expira vencidas |
| 23 | Cancelamento | `src/app/api/assinatura/cancelar/route.ts` | mantém Pro até `periodo_fim` |
| 24 | Documentação legal | `src/app/termos/page.tsx`, `src/app/privacidade/page.tsx` | termos citam planos, renovação e reembolso (CDC art. 49) |

### Fase 2 — Ciclo de vida (2 dias)

- Portal de gerenciamento (trocar cartão, ver faturas).
- Reembolso manual com registro em `evento_gateway`.
- Régua de e-mail de trial (D-3, D-1, expirou).
- Cupom de lançamento (`LANCAMENTO50`).

### Fase 3 — Receita extra (1-2 semanas)

- Domínio próprio e subdomínio (Pro).
- Templates premium avulsos.
- Analytics 90 dias com fontes de tráfego.
- Selo "verificado" e destaque em diretório de DJs.

## Critérios de aceite

- [ ] Free bloqueia a 4ª foto com `403 { code: "LIMITE_PLANO" }` e link para `/planos`.
- [ ] Pro aceita até 20 fotos; a 21ª bloqueia com a mesma resposta.
- [ ] Limites de mídia (3/15) e shows (3/ilimitado) valem no servidor.
- [ ] Free só aplica o template `dark-minimal`; Pro aplica os 3.
- [ ] Selo "Feito com PressLink" aparece no Free e desaparece no Pro.
- [ ] `/painel/plano` mostra uso real ("3 de 3 fotos") e o plano atual.
- [ ] Conta nova nasce com trial de 7 dias e expira sozinha.
- [ ] Webhook repetido não cria assinatura duplicada (`gateway_id` único + `evento_gateway`).
- [ ] Downgrade preserva os dados; a página pública mostra só os N primeiros.
- [ ] `/planos` exibe R$ 29,90/mês e R$ 249/ano.
- [ ] Termos e Privacidade sem a frase "plataforma gratuita".
- [ ] `npm run lint`, `npm run typecheck`, `npm run test:ci` e `npm run build` verdes.

## Variáveis de ambiente

```env
# Mercado Pago (server-only)
MERCADOPAGO_ACCESS_TOKEN=TEST-...
MERCADOPAGO_WEBHOOK_SECRET=...
MERCADOPAGO_PLANO_MENSAL_ID=...
MERCADOPAGO_PLANO_ANUAL_ID=...

# Cron da Vercel
CRON_SECRET=...
```

## Riscos

| Risco | Mitigação |
|---|---|
| Storage do Supabase estoura | Comprimir no upload (WebP ~1600 px, alvo ≤ 400 KB) **antes** de abrir a cobrança — fecha o RNF-06 |
| Webhook duplicado ou forjado | `unique (gateway, evento_id)` + validação `x-signature` + corpo bruto |
| Chargeback | Checkout hospedado, e-mail de confirmação, prazo de suporte documentado |
| Downgrade apaga conteúdo | Nunca apagar: ocultar excedente por `ordem` |
| Pix não recorre | Pix só no anual (pagamento único); mensal no cartão |
| Prometer o que não existe | `/planos` fala só do produto; sem clientes ou números inventados |

## O que precisa do dono

1. Conta **Mercado Pago** com `ACCESS_TOKEN` de sandbox e o **secret do webhook**.
2. **Usuário de teste** do Mercado Pago (cartão aprovado e recusado).
3. **CNPJ/MEI** (ou decisão de começar com CPF) para os dados fiscais do gateway.
4. Aprovação dos novos Termos e da Política de Reembolso.

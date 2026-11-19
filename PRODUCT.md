# PressLink — Product

Produto SaaS web que dá a DJs freelancers um portfólio profissional (EPK) publicado em minutos, sem conhecimento técnico.

## Platform

web

## Stack

Next.js (App Router, React + TypeScript), Tailwind CSS, React Hook Form + Zod, Supabase (Postgres, Auth, Storage), Vercel. Testes: Vitest (unit/API) e Playwright (E2E).

## Users

- **DJ freelancer brasileiro**, 18–35, gerencia a própria carreira, sem equipe e sem conhecimento técnico. Edita o painel entre shows, quase sempre pelo celular.
- **Quem contrata**: clube, festival, casamento, bar, produtor de evento. Chega pelo Instagram/WhatsApp, abre a página no celular e decide em segundos se chama o DJ.

## Product Purpose

Entregar uma página pública com cara de portfólio profissional — foto, bio, músicas, agenda e contato — que o próprio DJ monta e atualiza sem depender de ninguém. O sucesso é o visitante sair da página falando com o DJ (WhatsApp ou e-mail).

## Positioning

Não é link-in-bio: é um EPK com conteúdo estruturado (galeria, mídia, agenda, contato e métricas). Não cobra comissão de booking, não vende tráfego e não exige domínio próprio.

## Operating Context

- Uso intercalado com a rotina de shows; sessões curtas, no celular.
- A página pública é compartilhada por link em redes sociais e mensagens.
- Idioma único: português do Brasil (conteúdo do DJ pode ter versão PT/EN na bio).
- O painel precisa deixar claro, em qualquer tela, se a página está no ar e o que falta para publicar.

## Capabilities and Constraints

- **Conta e autenticação**: cadastro, login, recuperação e redefinição de senha (Supabase Auth); exclusão de conta com remoção de dados (LGPD).
- **Perfil**: foto, nome artístico, `@username` único, bio em PT e EN, links de redes sociais.
- **Galeria**: até 10 fotos de até 5 MB, reordenar por arrastar, excluir.
- **Mídia**: links de Spotify, SoundCloud e YouTube, com ordem, ocultar, editar e excluir.
- **Agenda**: criar, editar e excluir shows (data, horário, local, cidade); futuros aparecem na página pública.
- **Aparência**: 3 templates (Dark Minimal, Vibrant Festival, Clean Editorial) com preview real antes de aplicar.
- **Contato público**: WhatsApp, e-mail e link `wa.me` gerado a partir do número.
- **Publicação**: a página só entra no ar com os requisitos obrigatórios completos; publicar e despublicar a qualquer momento.
- **Estatísticas**: visualizações, cliques de contato e canais, em janelas de 7 e 30 dias.
- **Limites do MVP**: sem formulário de contato interno, sem domínio/subdomínio próprio, sem marketplace de templates, sem analytics avançado/GA, sem app nativo, sem pagamento ou assinatura.

## Brand Commitments

- Wordmark: "Press" em branco + "Link" em magenta, sobre preto. O magenta oficial é `#D018F6`, amostrado do wordmark (`public/presslink-logo.png`).
- Fundo de marca: `#08050C` (amostrado do logo).
- O magenta é a única cor de sinal do produto; roxo genérico não faz parte da identidade.
- Nome do produto sempre "PressLink" (uma palavra), nunca "Press Link".

## Evidence on Hand

- `requirements.md` e `specs.md` (requisitos e arquitetura).
- Código em produção de todas as funções do MVP neste repositório.
- Logo em `public/presslink-logo.png`; favicon em `src/app/icon.svg`.
- **Não existe**: depoimentos, clientes pagantes, números de mercado, preços ou projeções. Nada disso pode ser afirmado na interface.

## Product Principles

1. Publicar em minutos: cada tela diz o próximo passo, não só o estado atual.
2. O conteúdo do DJ é o herói; a interface recua para o fundo.
3. Estado sempre visível: rascunho/no ar e o que falta para publicar.
4. Uma ação primária por tela; o resto vira texto ou link.
5. Mobile primeiro: se funciona no celular entre dois shows, funciona no desktop.

## Accessibility & Inclusion

- WCAG 2.1 AA: texto normal ≥ 4,5:1; texto grande/ícones ≥ 3:1.
- Foco visível em todo elemento interativo, na ordem do teclado.
- `prefers-reduced-motion` respeitado: nenhuma entrada orquestrada, nenhum movimento essencial.
- Alvos de toque ≥ 32 px; formulários com rótulo associado e erro anunciado.
- Interface 100% em português do Brasil.

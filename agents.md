# Instruções para Agentes de IA — PressLink

Este documento é destinado a **agentes de IA** (Claude Code, GitHub Copilot, Cursor, etc.) que forem auxiliar no desenvolvimento deste repositório. Leia-o integralmente antes de executar qualquer tarefa.

---

## Contexto do Projeto

O **PressLink** é uma plataforma SaaS que permite a DJs freelancers criarem portfólios digitais profissionais (EPK — Electronic Press Kit) de forma autônoma, sem necessidade de conhecimento técnico. Este é um projeto de **Trabalho de Conclusão de Curso (TCC)** desenvolvido por 3 integrantes.

### Stack técnica

| Camada               | Tecnologia                        |
| -------------------- | --------------------------------- |
| Front-end            | React + Next.js (App Router)      |
| Estilização          | Tailwind CSS                      |
| Formulários          | React Hook Form + Zod             |
| Back-end / API       | Next.js API Routes                |
| Banco de dados       | PostgreSQL via Supabase            |
| Armazenamento        | Supabase Storage                  |
| Autenticação         | Supabase Auth                     |
| Hospedagem           | Vercel                            |

---

## Fontes de Verdade

Antes de implementar qualquer funcionalidade nova, **consulte obrigatoriamente** os seguintes documentos:

- **`requirements.md`** — Lista completa de requisitos funcionais e não funcionais do MVP.
- **`specs.md`** — Especificação técnica da arquitetura, modelo de dados, rotas e fluxos.

Esses dois arquivos são a **fonte de verdade** do projeto. Qualquer implementação deve estar alinhada com o que está documentado neles.

---

## Convenções de Código

### Estrutura de pastas (Next.js App Router)

```
src/
├── app/                  # Rotas e layouts (App Router)
│   ├── (auth)/           # Grupo de rotas de autenticação (login, cadastro)
│   ├── painel/           # Área logada do DJ (rotas protegidas)
│   │   ├── perfil/
│   │   ├── agenda/
│   │   ├── musica/
│   │   ├── galeria/
│   │   ├── template/
│   │   └── estatisticas/
│   ├── [username]/       # Página pública do DJ (rota dinâmica)
│   ├── api/              # API Routes
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Página inicial (landing page)
├── components/           # Componentes reutilizáveis
│   ├── ui/               # Componentes genéricos de UI (Button, Input, Modal, Card)
│   └── features/         # Componentes específicos por funcionalidade
├── lib/                  # Utilitários e clients
│   ├── supabase/         # Client e helpers do Supabase
│   ├── validators/       # Schemas de validação (Zod)
│   └── utils.ts          # Funções utilitárias gerais
├── hooks/                # Custom hooks do React
├── types/                # Definições de tipos TypeScript
└── styles/               # Estilos globais e configuração do Tailwind
```

### Padrão de componentes

- Usar **componentes funcionais** com TypeScript (`.tsx`).
- Nomes de componentes em **PascalCase** (ex.: `ProfileForm.tsx`, `ShowCard.tsx`).
- Nomes de arquivos de componentes devem corresponder ao nome do componente exportado.
- Cada componente deve ter tipagem explícita para suas props via `interface` ou `type`.
- Componentes de UI genéricos ficam em `components/ui/`.
- Componentes específicos de uma funcionalidade ficam em `components/features/`.

### Padrão de estilização

- Usar **exclusivamente Tailwind CSS** para estilização.
- Evitar CSS inline e arquivos `.css` avulsos (exceto `globals.css` para reset e variáveis).
- Para variações condicionais de estilo, usar a biblioteca `clsx` ou `cn()` (utilitário de merge de classes).
- Manter classes Tailwind organizadas seguindo a ordem lógica: layout → espaçamento → tipografia → cores → bordas → efeitos.

### Padrão de nomenclatura geral

- Variáveis e funções: **camelCase** (ex.: `getUserProfile`, `showDate`).
- Tipos e interfaces TypeScript: **PascalCase** (ex.: `DjProfile`, `ShowEvent`).
- Constantes: **UPPER_SNAKE_CASE** (ex.: `MAX_PHOTOS`, `DEFAULT_TEMPLATE`).
- Arquivos de utilitários e hooks: **camelCase** (ex.: `useProfile.ts`, `formatDate.ts`).
- Rotas de API: **kebab-case** (ex.: `/api/dj-profile`, `/api/show-events`).

---

## Regras Obrigatórias

### ✅ O que o agente DEVE fazer

1. **Sempre criar uma branch** para qualquer alteração de código. Seguir a convenção:
   - `feature/nome-da-funcionalidade`
   - `fix/nome-do-bug`
   - `docs/descricao-da-alteracao`
   - `refactor/descricao-da-refatoracao`

2. **Seguir Conventional Commits** nas mensagens de commit:
   ```
   feat(escopo): descrição curta
   fix(escopo): descrição curta
   docs: descrição curta
   chore: descrição curta
   refactor(escopo): descrição curta
   ```

3. **Consultar `requirements.md` e `specs.md`** antes de implementar qualquer funcionalidade nova.

4. **Rodar lint** (`npm run lint`) antes de finalizar qualquer tarefa.

5. **Usar TypeScript** com tipagem estrita — evitar `any`.

6. **Validar dados de formulário** com Zod, integrando via React Hook Form.

7. **Tratar erros** de forma adequada, tanto no cliente quanto na API.

### ❌ O que o agente NUNCA deve fazer

1. **Nunca commitar diretamente na branch `main`**. Sempre crie uma branch separada.

2. **Nunca alterar arquivos `.env`, `.env.local` ou `.env.production`**. Variáveis de ambiente contêm credenciais sensíveis e são gerenciadas manualmente pela equipe.

3. **Nunca instalar dependências** sem justificativa clara e sem verificar se já existe uma alternativa na stack atual.

4. **Nunca remover ou alterar testes existentes** sem motivo documentado.

5. **Nunca ignorar erros de lint ou TypeScript** — corrija-os antes de finalizar.

6. **Nunca criar arquivos fora da estrutura de pastas** definida acima sem autorização explícita.

---

## Fluxo de Trabalho Esperado

1. Receba a tarefa (funcionalidade, bug, refatoração).
2. Leia `requirements.md` e `specs.md` para entender o contexto.
3. Crie uma branch com nome descritivo.
4. Implemente a solução seguindo as convenções acima.
5. Rode `npm run lint` e corrija eventuais erros.
6. Faça commit(s) com mensagens no padrão Conventional Commits.
7. Faça push da branch e, se solicitado, abra um Pull Request.

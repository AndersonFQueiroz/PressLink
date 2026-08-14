# Especificação Técnica — PressLink

Este documento descreve a arquitetura técnica, o modelo de dados, as rotas da aplicação e os fluxos principais do PressLink.

---

## 1. Visão Geral da Arquitetura

O PressLink é uma aplicação web full-stack construída com **Next.js** (App Router), que atua simultaneamente como front-end e back-end (via API Routes). O banco de dados e os serviços de autenticação e armazenamento são providos pelo **Supabase** (BaaS — Backend as a Service). A aplicação é hospedada na **Vercel**.

### Diagrama de camadas

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│  React + Next.js (App Router) + Tailwind CSS            │
│  React Hook Form + Zod (validação de formulários)       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                   SERVIDOR                              │
│  Next.js API Routes (Route Handlers)                    │
│  Middleware de autenticação e proteção de rotas          │
│  Server Components (RSC) para páginas públicas          │
└──────────────────────┬──────────────────────────────────┘
                       │ SDK / REST API
┌──────────────────────▼──────────────────────────────────┐
│                   SUPABASE                              │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │ PostgreSQL   │ │ Auth        │ │ Storage          │  │
│  │ (banco de    │ │ (autenti-   │ │ (armazenamento   │  │
│  │  dados)      │ │  cação)     │ │  de mídia)       │  │
│  └──────────────┘ └─────────────┘ └──────────────────┘  │
│  Row Level Security (RLS) para isolamento de dados      │
└─────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   VERCEL                                │
│  Hospedagem + CDN + Deploy contínuo                     │
│  Edge Functions + ISR (Incremental Static Regeneration) │
└─────────────────────────────────────────────────────────┘
```

### Papel de cada tecnologia

| Tecnologia              | Papel na arquitetura                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **React**               | Biblioteca de UI para construção de componentes interativos no front-end.                    |
| **Next.js (App Router)**| Framework full-stack: roteamento baseado em sistema de arquivos, Server Components, API Routes, SSR/SSG/ISR e middleware. |
| **Tailwind CSS**        | Framework CSS utilitário para estilização rápida e consistente de toda a interface.          |
| **React Hook Form**     | Gerenciamento de estado e performance de formulários no front-end.                           |
| **Zod**                 | Validação de schemas de dados, integrado com React Hook Form e usado também no back-end.    |
| **Supabase (PostgreSQL)** | Banco de dados relacional com suporte a Row Level Security (RLS) para isolamento multi-tenant. |
| **Supabase Auth**       | Serviço gerenciado de autenticação (cadastro, login, recuperação de senha, JWT).             |
| **Supabase Storage**    | Armazenamento de arquivos de mídia (fotos de perfil, galeria) com URLs públicas e permissões por bucket. |
| **Vercel**              | Plataforma de hospedagem serverless com CDN global, deploy contínuo via Git e suporte nativo a Next.js. |

---

## 2. Modelo de Dados

### Diagrama de Entidades

```
┌──────────────┐       ┌──────────────────┐
│   Usuario    │       │     Perfil       │
│──────────────│  1:1  │──────────────────│
│ id (PK)      │◄─────►│ id (PK)          │
│ email        │       │ usuario_id (FK)  │
│ senha (hash) │       │ nome_artistico   │
│ created_at   │       │ username (unique)│
│ updated_at   │       │ foto_url         │
└──────────────┘       │ biografia_pt     │
                       │ biografia_en     │
                       │ whatsapp         │
                       │ email_booking    │
                       │ instagram        │
                       │ facebook         │
                       │ tiktok           │
                       │ twitter_x        │
                       │ template_id (FK) │
                       │ publicado        │
                       │ created_at       │
                       │ updated_at       │
                       └──────┬───────────┘
                              │ 1:N
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  LinkDeMidia     │ │ DataDeShow   │ │  FotoGaleria     │
│──────────────────│ │──────────────│ │──────────────────│
│ id (PK)          │ │ id (PK)      │ │ id (PK)          │
│ perfil_id (FK)   │ │ perfil_id(FK)│ │ perfil_id (FK)   │
│ tipo (enum)      │ │ nome_evento  │ │ url              │
│   - spotify      │ │ data         │ │ ordem            │
│   - soundcloud   │ │ horario      │ │ alt_text         │
│   - youtube      │ │ local        │ │ created_at       │
│ url              │ │ cidade       │ └──────────────────┘
│ titulo           │ │ created_at   │
│ ordem            │ └──────────────┘
│ created_at       │
└──────────────────┘

┌──────────────────┐ ┌──────────────────────────┐
│    Template      │ │  VisualizacaoDePagina    │
│──────────────────│ │──────────────────────────│
│ id (PK)          │ │ id (PK)                  │
│ nome             │ │ perfil_id (FK)           │
│ descricao        │ │ tipo (enum)              │
│ thumbnail_url    │ │   - page_view            │
│ slug             │ │   - click_whatsapp       │
│ ativo            │ │   - click_email          │
│ created_at       │ │   - click_formulario     │
└──────────────────┘ │ ip_hash (anonimizado)    │
                     │ user_agent               │
                     │ created_at               │
                     └──────────────────────────┘
```

### Descrição das entidades

#### `Usuario`
Representa a conta do DJ na plataforma. Gerenciado pelo **Supabase Auth** — os dados de autenticação (e-mail, hash de senha, tokens) ficam na tabela interna `auth.users` do Supabase. A tabela `Usuario` no schema público armazena apenas o `id` (referenciando `auth.users.id`) e metadados complementares.

#### `Perfil`
Contém todas as informações do portfólio do DJ: nome artístico, username (usado na URL pública), biografia em múltiplos idiomas, foto, redes sociais e dados de contato. Possui relação 1:1 com `Usuario` e referencia o `Template` selecionado. O campo booleano `publicado` controla se a página pública está ativa.

#### `LinkDeMidia`
Armazena os links de música e vídeo do DJ. O campo `tipo` é um enum que define a plataforma (Spotify, SoundCloud, YouTube), permitindo que o front-end renderize o player embarcado correspondente. Cada perfil pode ter múltiplos links, ordenados pelo campo `ordem`.

#### `DataDeShow`
Representa um evento/show na agenda do DJ. Contém nome do evento, data, horário, local e cidade. A aplicação filtra automaticamente para exibir apenas datas futuras na página pública.

#### `FotoGaleria`
Armazena as referências (URLs) das fotos da galeria do DJ. As imagens propriamente ditas ficam no **Supabase Storage**. O campo `ordem` permite ao DJ reordenar a galeria.

#### `Template`
Catálogo de templates visuais disponíveis para a página pública. No MVP, haverá de 2 a 3 opções pré-configuradas. Cada template possui um `slug` identificador e uma `thumbnail_url` para pré-visualização.

#### `VisualizacaoDePagina`
Registra eventos de interação na página pública: visualizações de página e cliques em botões de contato (WhatsApp, e-mail, formulário). O IP é armazenado de forma anonimizada (hash) para conformidade com a LGPD. Esses dados alimentam as estatísticas simples exibidas no painel do DJ.

---

## 3. Rotas da Aplicação

### Rotas públicas (acessíveis sem autenticação)

| Rota               | Descrição                                              |
| ------------------- | ------------------------------------------------------ |
| `/`                 | Landing page da plataforma PressLink.                    |
| `/login`            | Página de login do DJ.                                 |
| `/cadastro`         | Página de cadastro de nova conta.                      |
| `/recuperar-senha`  | Página de recuperação de senha.                        |
| `/[username]`       | **Página pública do DJ** — rota dinâmica que renderiza o portfólio do DJ com base no username. |

### Rotas privadas (protegidas por autenticação)

| Rota                        | Descrição                                                      |
| --------------------------- | -------------------------------------------------------------- |
| `/painel`                   | Dashboard principal do DJ com visão geral e estatísticas.      |
| `/painel/perfil`            | Edição de perfil: nome artístico, foto, bio, redes sociais.   |
| `/painel/galeria`           | Gerenciamento da galeria de fotos (upload, exclusão, reordenação). |
| `/painel/musica`            | Gerenciamento de links de música e vídeo.                      |
| `/painel/agenda`            | Gerenciamento da agenda de shows.                              |
| `/painel/contato`           | Configuração de informações de contato e booking.              |
| `/painel/template`          | Seleção e pré-visualização de template visual.                 |
| `/painel/estatisticas`      | Visualização das estatísticas de acesso e cliques.             |
| `/painel/configuracoes`     | Configurações da conta (alterar e-mail, senha, excluir conta). |

### Rotas de API (Route Handlers)

| Rota                             | Método    | Descrição                                          |
| -------------------------------- | --------- | -------------------------------------------------- |
| `/api/perfil`                    | GET, PUT  | Buscar e atualizar dados do perfil.                |
| `/api/galeria`                   | GET, POST, DELETE | Listar, adicionar e remover fotos.          |
| `/api/galeria/reordenar`         | PUT       | Atualizar a ordem das fotos.                       |
| `/api/links`                     | GET, POST, PUT, DELETE | CRUD de links de música e vídeo.     |
| `/api/shows`                     | GET, POST, PUT, DELETE | CRUD de datas de shows.              |
| `/api/publicar`                  | POST      | Validar e publicar a página pública.               |
| `/api/despublicar`               | POST      | Despublicar a página pública.                      |
| `/api/estatisticas`              | GET       | Buscar estatísticas de visualizações e cliques.    |
| `/api/estatisticas/registrar`    | POST      | Registrar um evento (visualização ou clique).      |
| `/api/contato`                   | POST      | Enviar mensagem pelo formulário de contato público.|

---

## 4. Estratégia de Hospedagem Multi-Tenant

### MVP — Path-based

No MVP, cada DJ tem sua página pública acessível por um caminho (path) na URL principal da plataforma:

```
https://presslink.app/nomedodj
```

Essa abordagem é a mais simples de implementar com Next.js, utilizando **rotas dinâmicas** (`/[username]/page.tsx`). O Next.js resolve o `username` a partir do path e busca os dados do DJ correspondente no banco.

**Vantagens:**
- Implementação simples com uma única instância e domínio.
- Sem necessidade de configuração de DNS ou certificados SSL adicionais.
- Funciona nativamente com a Vercel.

### Evolução futura — Subdomínio

Em versões futuras (planos pagos), cada DJ terá um subdomínio personalizado:

```
https://nomedodj.presslink.app
```

Isso será implementado com o **middleware do Next.js**, que intercepta a requisição, extrai o subdomínio do header `Host` e resolve internamente para a mesma rota dinâmica. A Vercel suporta wildcard subdomains (`*.presslink.app`) nativamente.

### Evolução futura — Domínio customizado

Para planos premium, o DJ poderá conectar seu próprio domínio:

```
https://www.djfulano.com.br
```

Isso exigirá:
- Configuração de DNS pelo DJ (CNAME apontando para a Vercel).
- Adição do domínio customizado no painel da Vercel via API.
- Certificado SSL automático (gerenciado pela Vercel via Let's Encrypt).
- Resolução do domínio para o perfil correto via tabela de mapeamento no banco de dados.

---

## 5. Fluxo de Publicação (UC01 — Publicar Portfólio)

### Descrição do caso de uso

| Campo              | Valor                                                              |
| ------------------ | ------------------------------------------------------------------ |
| **Identificador**  | UC01                                                               |
| **Nome**           | Publicar Portfólio                                                 |
| **Ator principal** | DJ (usuário autenticado)                                           |
| **Ator secundário**| Visitante / Contratante                                            |
| **Pré-condição**   | DJ está autenticado e possui uma conta ativa.                      |
| **Pós-condição**   | A página pública do DJ está acessível pela URL `presslink.app/[username]`. |

### Fluxo principal

```
┌─────────┐                    ┌──────────┐                  ┌──────────┐
│   DJ    │                    │  Painel  │                  │ Servidor │
└────┬────┘                    └────┬─────┘                  └────┬─────┘
     │                              │                              │
     │  1. Acessa o painel          │                              │
     │─────────────────────────────►│                              │
     │                              │                              │
     │  2. Preenche dados do perfil │                              │
     │  (nome, bio, foto, redes)    │                              │
     │─────────────────────────────►│                              │
     │                              │  3. Salva dados via API      │
     │                              │─────────────────────────────►│
     │                              │           4. Confirma ✓      │
     │                              │◄─────────────────────────────│
     │                              │                              │
     │  5. Adiciona links de música │                              │
     │  e agenda de shows           │                              │
     │─────────────────────────────►│                              │
     │                              │  6. Salva dados via API      │
     │                              │─────────────────────────────►│
     │                              │           7. Confirma ✓      │
     │                              │◄─────────────────────────────│
     │                              │                              │
     │  8. Seleciona template       │                              │
     │─────────────────────────────►│                              │
     │                              │  9. Salva seleção            │
     │                              │─────────────────────────────►│
     │                              │          10. Confirma ✓      │
     │                              │◄─────────────────────────────│
     │                              │                              │
     │ 11. Clica "Publicar"         │                              │
     │─────────────────────────────►│                              │
     │                              │ 12. POST /api/publicar       │
     │                              │─────────────────────────────►│
     │                              │                              │
     │                              │ 13. Valida campos            │
     │                              │    obrigatórios:             │
     │                              │    - nome artístico ✓        │
     │                              │    - ≥1 foto ✓               │
     │                              │    - ≥1 link de música ✓     │
     │                              │                              │
     │                              │ 14. Marca perfil como        │
     │                              │    publicado = true          │
     │                              │                              │
     │                              │ 15. Dispara revalidação      │
     │                              │    da página estática (ISR)  │
     │                              │                              │
     │                              │ 16. Retorna URL gerada       │
     │                              │◄─────────────────────────────│
     │                              │                              │
     │ 17. Exibe URL ao DJ:         │                              │
     │ "presslink.app/nomedodj"       │                              │
     │◄─────────────────────────────│                              │
     │                              │                              │
```

### Fluxo técnico detalhado

1. **Validação no cliente (React Hook Form + Zod):** Antes de enviar os dados ao servidor, o formulário no front-end valida os campos obrigatórios usando schemas Zod integrados com React Hook Form. Erros de validação são exibidos inline nos campos.

2. **Persistência incremental:** Os dados do perfil, links e agenda são salvos de forma incremental conforme o DJ preenche — não é necessário preencher tudo de uma vez. Cada seção do painel faz chamadas independentes à API.

3. **Validação no servidor (API Route):** Quando o DJ clica em "Publicar", o endpoint `POST /api/publicar` executa uma validação server-side dos campos obrigatórios:
   - `nome_artistico` não pode ser vazio.
   - Pelo menos 1 registro em `FotoGaleria`.
   - Pelo menos 1 registro em `LinkDeMidia`.
   - `username` deve ser único e válido.

4. **Atualização do estado:** Se a validação passa, o servidor atualiza o campo `publicado` do perfil para `true` no banco de dados.

5. **Revalidação da página (ISR):** O servidor chama `revalidatePath(/[username])` do Next.js para regenerar a página estática com os dados atualizados. Isso garante que a página pública reflete as alterações sem necessidade de rebuild completo.

6. **Resposta ao cliente:** O servidor retorna a URL pública gerada (`presslink.app/[username]`), que o front-end exibe ao DJ com a opção de copiar ou compartilhar.

### Fluxo do visitante

Após a publicação, qualquer visitante (contratante, agência, público) pode acessar a URL pública. A página é servida como **HTML estático com ISR**, garantindo carregamento rápido via CDN da Vercel. Eventos de visualização e cliques em contato são registrados de forma assíncrona na tabela `VisualizacaoDePagina` via `POST /api/estatisticas/registrar`.

# 🎧 PressLink

**Plataforma SaaS para criação de portfólios digitais profissionais para DJs freelancers.**

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
- ✅ Cadastro e login com autenticação segura
- ✅ Edição de perfil: nome artístico, foto, biografia (com suporte multi-idioma) e redes sociais
- ✅ Galeria de fotos
- ✅ Links de música (Spotify, SoundCloud) e vídeos (YouTube)
- ✅ Agenda de próximas datas de shows
- ✅ Informações de contato e booking (WhatsApp, e-mail, formulário)
- ✅ Seleção de template visual (2–3 opções)

### Página pública gerada automaticamente
- ✅ Layout totalmente responsivo (mobile e desktop)
- ✅ URL personalizada no formato `presslink.app/nomedodj`
- ✅ Estatísticas simples de visualizações e cliques em contato

---

## Tecnologias Utilizadas

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

## Como Rodar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Conta no [Supabase](https://supabase.com/) (para as variáveis de ambiente)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/AndersonFQueiroz/TCC-Portf-lio-DJ-Sem-nome-por-enquanto-.git
cd TCC-Portf-lio-DJ-Sem-nome-por-enquanto-

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
```

Preencha o arquivo `.env.local` com as credenciais do seu projeto Supabase:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Equipe

Este projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) pelos seguintes integrantes:

| Nome                        | Papel                        | GitHub                                                              |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| Anderson Ferreira Queiroz   | Administrador do repositório | [@AndersonFQueiroz](https://github.com/AndersonFQueiroz)            |
| Pedro Muginski              | Desenvolvedor                | [perfil do GitHub]                                                  |
| Luiz Carvalho               | Desenvolvedor                | [perfil do GitHub]                                                  |

**Orientador(a):** A definir

---

## Status do Projeto

🚧 **Em desenvolvimento** — O projeto está na fase inicial de construção do MVP.

---

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

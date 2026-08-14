# Requisitos do Projeto — PressLink

Este documento descreve os requisitos funcionais e não funcionais do MVP (Produto Mínimo Viável) da plataforma PressLink.

---

## Requisitos Funcionais (RF)

### Autenticação e Conta

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-01  | O sistema deve permitir que o DJ crie uma conta informando nome, e-mail e senha.              | Alta       |
| RF-02  | O sistema deve permitir que o DJ faça login com e-mail e senha.                               | Alta       |
| RF-03  | O sistema deve permitir que o DJ faça logout da sessão ativa.                                 | Alta       |
| RF-04  | O sistema deve permitir que o DJ recupere sua senha via e-mail.                               | Média      |

### Edição de Perfil

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-05  | O sistema deve permitir que o DJ cadastre e edite seu nome artístico.                         | Alta       |
| RF-06  | O sistema deve permitir que o DJ faça upload de uma foto de perfil.                           | Alta       |
| RF-07  | O sistema deve permitir que o DJ escreva uma biografia com suporte a múltiplos idiomas (pelo menos português e inglês). | Alta |
| RF-08  | O sistema deve permitir que o DJ cadastre links de suas redes sociais (Instagram, Facebook, X/Twitter, TikTok, etc.). | Alta |
| RF-09  | O sistema deve permitir que o DJ escolha um username único, que será usado na URL pública.    | Alta       |

### Galeria de Fotos

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-10  | O sistema deve permitir que o DJ faça upload de múltiplas fotos para uma galeria.             | Alta       |
| RF-11  | O sistema deve permitir que o DJ exclua e reordene as fotos da galeria.                       | Média      |

### Links de Música e Vídeo

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-12  | O sistema deve permitir que o DJ cadastre links de música de plataformas como Spotify e SoundCloud. | Alta |
| RF-13  | O sistema deve permitir que o DJ cadastre links de vídeos do YouTube.                         | Alta       |
| RF-14  | O sistema deve exibir os players embarcados (embeds) das plataformas na página pública.       | Alta       |

### Agenda de Shows

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-15  | O sistema deve permitir que o DJ cadastre datas de shows futuros com nome do evento, data, horário, local e cidade. | Alta |
| RF-16  | O sistema deve permitir que o DJ edite e exclua datas de shows.                               | Alta       |
| RF-17  | O sistema deve exibir as datas de shows na página pública em ordem cronológica, ocultando automaticamente datas passadas. | Média |

### Contato e Booking

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-18  | O sistema deve permitir que o DJ cadastre um número de WhatsApp para contato.                 | Alta       |
| RF-19  | O sistema deve permitir que o DJ cadastre um e-mail para booking.                             | Alta       |
| RF-20  | O sistema deve disponibilizar um formulário de contato na página pública que envie os dados por e-mail ao DJ. | Média |

### Seleção de Template

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-21  | O sistema deve oferecer pelo menos 2 a 3 templates visuais para a página pública do DJ.      | Alta       |
| RF-22  | O sistema deve permitir que o DJ visualize uma pré-visualização (preview) do template antes de selecionar. | Média |
| RF-23  | O sistema deve permitir que o DJ troque de template a qualquer momento sem perder seus dados. | Alta       |

### Publicação da Página

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-24  | O sistema deve gerar automaticamente a página pública do DJ após a confirmação de publicação. | Alta       |
| RF-25  | O sistema deve validar os campos obrigatórios (nome artístico, pelo menos 1 foto, pelo menos 1 link de música) antes de permitir a publicação. | Alta |
| RF-26  | O sistema deve exibir a URL pública gerada ao DJ após a publicação bem-sucedida.              | Alta       |
| RF-27  | O sistema deve permitir que o DJ despublique sua página a qualquer momento.                   | Média      |

### Estatísticas

| ID     | Requisito                                                                                     | Prioridade |
| ------ | --------------------------------------------------------------------------------------------- | ---------- |
| RF-28  | O sistema deve contabilizar o número de visualizações da página pública de cada DJ.           | Média      |
| RF-29  | O sistema deve contabilizar o número de cliques nos botões de contato (WhatsApp, e-mail, formulário). | Média |
| RF-30  | O sistema deve exibir as estatísticas de forma resumida no painel do DJ.                      | Média      |

---

## Requisitos Não Funcionais (RNF)

### Usabilidade e Responsividade

| ID      | Requisito                                                                                    |
| ------- | -------------------------------------------------------------------------------------------- |
| RNF-01  | A página pública do DJ deve ser totalmente responsiva, adaptando-se a dispositivos móveis (a partir de 320px de largura) e desktops. |
| RNF-02  | O painel administrativo deve ser utilizável em telas a partir de 768px (tablets e desktops).  |
| RNF-03  | A interface deve ser intuitiva o suficiente para que um DJ sem conhecimento técnico consiga publicar sua página em até 15 minutos na primeira utilização. |

### Desempenho

| ID      | Requisito                                                                                    |
| ------- | -------------------------------------------------------------------------------------------- |
| RNF-04  | A página pública do DJ deve atingir uma pontuação mínima de 80 no Google Lighthouse (categoria Performance). |
| RNF-05  | O tempo de carregamento inicial da página pública (First Contentful Paint) deve ser inferior a 2 segundos em conexões 4G. |
| RNF-06  | As imagens enviadas pelo DJ devem ser otimizadas automaticamente (compressão e redimensionamento) antes do armazenamento. |

### Segurança

| ID      | Requisito                                                                                    |
| ------- | -------------------------------------------------------------------------------------------- |
| RNF-07  | A autenticação deve utilizar tokens seguros (JWT) com expiração configurável, gerenciados pelo Supabase Auth. |
| RNF-08  | As senhas devem ser armazenadas com hash seguro (bcrypt ou equivalente, gerenciado pelo Supabase). |
| RNF-09  | As rotas do painel administrativo e da API devem ser protegidas, acessíveis apenas por usuários autenticados. |
| RNF-10  | O formulário de contato público deve contar com proteção contra spam (rate limiting ou captcha). |

### Proteção de Dados (LGPD)

| ID      | Requisito                                                                                    |
| ------- | -------------------------------------------------------------------------------------------- |
| RNF-11  | O sistema deve solicitar consentimento explícito do DJ para coleta e tratamento de seus dados pessoais no momento do cadastro. |
| RNF-12  | O DJ deve poder solicitar a exclusão completa de sua conta e todos os dados associados (direito ao esquecimento). |
| RNF-13  | Os dados pessoais dos DJs devem ser armazenados de forma segura, com acesso restrito por Row Level Security (RLS) no Supabase. |

### Disponibilidade e Infraestrutura

| ID      | Requisito                                                                                    |
| ------- | -------------------------------------------------------------------------------------------- |
| RNF-14  | A aplicação deve estar hospedada na Vercel com deploy contínuo a partir da branch `main`.    |
| RNF-15  | A aplicação deve manter disponibilidade mínima de 99% (conforme SLA da Vercel e Supabase).   |
| RNF-16  | O sistema deve utilizar cache e geração estática (SSG/ISR) para as páginas públicas, reduzindo carga no banco de dados. |

---

## Fora de Escopo do MVP

As funcionalidades abaixo **não fazem parte do MVP** e estão planejadas como trabalho futuro para versões posteriores da plataforma:

| Funcionalidade                       | Descrição                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| Domínio próprio customizado          | Permitir que DJs de planos pagos conectem seu próprio domínio (ex.: `www.djfulano.com.br`). |
| Subdomínio personalizado             | Oferecer URLs no formato `nomedodj.presslink.app` como alternativa ao path-based.             |
| Marketplace de templates premium     | Loja de templates criados por designers terceiros, disponíveis mediante assinatura paga.     |
| Parcerias com agências de booking    | Integrações com plataformas e agências de contratação de DJs.                               |
| Painel de analytics avançado         | Gráficos detalhados com dados de visitantes, geolocalização e fontes de tráfego.            |
| App mobile nativo                    | Versão mobile nativa (iOS/Android) do painel de gestão.                                     |
| Integração com Google Analytics      | Permitir que DJs conectem seu próprio GA para métricas avançadas.                           |
| Sistema de pagamento e assinatura    | Integração com gateway de pagamento (Stripe, etc.) para gestão dos planos pagos.            |

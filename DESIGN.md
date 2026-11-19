# PressLink — Design System

> Mundo: **mesa de som**. O painel não é um app de produtividade claro e fofo; é a console do DJ — preto profundo, réguas finas, número grande e **magenta como sinal**. Cor, tipografia e movimento existem para responder três perguntas: *minha página está no ar? o que falta? o que aconteceu?*

## 1. Cor

Fonte única: as variáveis `--pl-*` em `src/app/globals.css` (canais RGB), mapeadas em `tailwind.config.ts`. Nenhum componente inventa hex.

| Token | Valor | Uso | Contraste |
| --- | --- | --- | --- |
| `ink` | `#08050C` | fundo da aplicação | — |
| `surface` | `#100C14` | faixa/seção elevada | — |
| `raised` | `#17121C` | menu, modal, campo | — |
| `line` | `rgba(255,255,255,.09)` | régua de 1 px | decorativo |
| `line-strong` | `rgba(255,255,255,.16)` | divisor focado/ativo | decorativo |
| `text` | `#F6F3F8` | texto primário | 18,3:1 |
| `muted` | `#A79FAD` | texto secundário | 7,9:1 |
| `signal` | `#D018F6` | estado e ação | 4,9:1 sobre `ink` |
| `signal-hover` | `#EA1BFF` | hover do preenchimento | 5,8:1 |
| `signal-soft` | `#F2A8FF` | ícone/texto de apoio | 11,4:1 |
| `ok` | `#A4EDAF` | sucesso | 12,7:1 |
| `warn` | `#F0D58E` | atenção | 12,1:1 |
| `danger` | `#FF9A9A` | erro/destrutivo | 9,6:1 |

Regras:

- **Branco nunca sobre magenta** (4,08:1 reprova AA). Preenchimento magenta leva texto `ink` (4,92:1).
- Magenta é sinal, não decoração: aparece no status "No ar", na ação primária, no foco e no item ativo. No máximo **dois** pontos de magenta por tela.
- Texto pequeno nunca abaixo de `muted`. Hierarquia se faz com tamanho e peso, não apagando o texto.
- Proibido: gradiente decorativo, glow, sombra colorida, roxo genérico (`#7c3aed` e família), vidro/blur.
- O logo (`public/presslink-logo.png`) é branco + magenta e só existe sobre fundo escuro; largura mínima 96 px, área de respiro igual à altura do "P".

## 2. Tipografia

| Papel | Fonte | Escala |
| --- | --- | --- |
| Título de página | Poppins 700 | 30–36 px, `leading-tight`, `tracking-[-0.02em]` |
| Título de seção | Space Grotesk 500 | 15 px |
| Corpo e UI | Space Grotesk 400/500 | 13–14 px, `leading-relaxed` |
| Número-herói | Space Grotesk 500, `tabular` | 34–40 px |
| Rótulo | Space Grotesk 400 | 12 px, `muted`, sentence case |

- A voz dos títulos é a **fonte do wordmark**: Poppins Bold (`font-display`, `font-serif`, `font-poster` e `font-brand` apontam para ela). Corpo segue Space Grotesk.
- Nunca CAIXA ALTA com tracking como "eyebrow". Siglas naturais (EPK, LGPD) são exceção.
- Wordmark = corrente em gradiente branco→magenta + "Press" branco + "Link" magenta, componente `PressLinkLogo`.

## 3. Espaço, raio, borda

- Base 4 px; ritmo vertical 8/12/16/20/24/32.
- Conteúdo do painel: **largura total do palco** (sem `max-width`), padding 16 (mobile) / 24 (tablet) / 32 (desktop).
- Raios: **4** controles pequenos, **8** superfícies pequenas, **12** flutuantes (modal/menu), **14** card, **16** painel contínuo. Nunca o mesmo raio em tudo.
- Borda de 1 px em `line / 6%` (mais discreta que a régua interna antiga); brilho interno de 1 px no topo (`inset 0 1px 0 white/4%`) simula luz de cima.
- Elevação vem da cor da superfície (`surface` → `raised` → `raised-hover`), não de sombra pesada; sombra só em modal/menu e no recorte do painel inteiro.

## 4. Layout do painel

- Sidebar fixa 248 px (desktop), topbar 56 px, palco ocupando toda a largura restante.
- **Divisão por superfície, não por régua**: o chrome (sidebar/topbar) fica no `ink`; o conteúdo é o palco (`.pl-stage`) em `surface`, com canto superior esquerdo de 22 px e glow radial da marca. Sem `border-r` na sidebar nem `border-b` na topbar.
- **Painel contínuo full-bleed**: a Visão geral encosta nas bordas do palco (sem margem externa e sem moldura); o cabeçalho tem padding interno e as células são separadas por fios internos de 6%. Nada de cards soltos com gap dentro do painel.
- Grade de 12 colunas dentro do painel: topo (12), prontidão (4) + métricas (8, faixa dividida), gráfico (8) + canal (4), agenda (8) + atalhos (4).
- **KPIs são uma faixa com réguas**, não três cards iguais; o número manda e a sparkline é apoio.
- Mobile 390: sidebar vira gaveta; o painel empilha célula a célula; fios viram horizontais; ações quebram em duas linhas.

## 5. Componentes

- **Botão primário**: fundo `signal`, texto `ink`, raio 4, altura 32/36/40. Hover `signal-hover`. Nunca branco no magenta.
- **Botão secundário**: fundo `raised`, borda `line`, texto `text`. Ghost: só texto `muted` → `text` no hover.
- **Campo**: fundo `ink`, borda `line`; foco = borda `signal` + anel `signal/25`; erro = borda `danger` + mensagem com ícone.
- **Navegação**: item 13 px `muted`; ativo = texto `text` + barra de 2 px `signal` à esquerda; só **um** item ativo (`aria-current="page"`).
- **Status de publicação**: chave de dois estados (`Rascunho` ⇄ `No ar`). O estado no ar usa placa magenta com texto `ink`; o rascunho usa `raised` com texto `muted`. A chave abre o menu de ações; o botão "Publicar" executa e move a placa.
- **Lista**: linha com régua inferior, hover `raised`, ação à direita sempre visível (nunca só no hover).
- **Vazio**: uma frase útil + uma ação. Sem ilustração.

## 6. Movimento

- Só `transform` e `opacity`. Durações 150–250 ms; entrada com `--pl-ease` (`.22, 1, .36, 1`); a chave de publicação desliza 300 ms com esse mesmo ease-out expo, sem bounce.
- **Uma** entrada orquestrada por tela: o cabeçalho sobe (`.pl-rise`) e, na Visão geral, as faixas entram em cascata com atrasos de 40–220 ms. Trocou de rota, a cascata roda de novo (o shell remonta pelo `key`).
- **Corrente em repouso aberta**: os elos ficam separados 1,5 px. No hover da marca eles encostam e voltam a abrir (620 ms), terminando abertos — o estado final nunca "pula".
- **Clique**: alvos importantes afundam 2% (`.pl-press` / `Button`); setas de link deslizam 2 px e ícones de ação crescem 10% no hover.
- Feedback de ação: salvar/publicar confirma no lugar; reordenar tem mola; expandir/recolher 200 ms.
- Nada de fade-and-slide em cada seção; nada animando em hover que não seja clicável.
- `prefers-reduced-motion`: zero animação de entrada, zero mola, transições para 0 ms.

## 7. Estados obrigatórios

Toda tela entrega: vazio, carregando (skeleton com a mesma silhueta do conteúdo), erro (mensagem + repetir), hover, foco visível, desabilitado (opacidade 45% + cursor), sucesso.

## 8. Anti-cara-de-IA (checklist de revisão)

- [ ] Nenhuma grade de cards iguais soltos (o painel é contínuo, com fios internos).
- [ ] Nenhum rótulo em caixa alta com tracking.
- [ ] Nenhum tile de ícone decorando título.
- [ ] Glow só no topo do painel (gradiente da marca), nunca em cada card.
- [ ] Texto secundário legível (≥ 4,5:1), não cinza fantasma.
- [ ] Hover só em elemento clicável e ≤ 150 ms.
- [ ] Uma única entrada orquestrada por tela.
- [ ] Magenta presente em no máximo dois pontos por tela.
